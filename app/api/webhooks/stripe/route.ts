import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getStripeClientForWebhook, getStripeWebhookSecret } from '@/lib/payments/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordStatusChange, logAdminAction } from '@/lib/data/history';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const webhookSecret = getStripeWebhookSecret();
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook non configuré' }, { status: 500 });
  }

  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
  }

  let event;
  try {
    const stripe = getStripeClientForWebhook();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Erreur de vérification du webhook Stripe :', err.message);
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const reference = session.metadata?.reference;
    const type = session.metadata?.type;

    if (type === 'viewing_fee' && reference) {
      const supabase = createAdminClient();

      const { data: viewing } = await supabase
        .from('viewing_requests')
        .select('id, status')
        .eq('reference', reference)
        .maybeSingle();

      if (viewing && viewing.status === 'payment_pending') {
        await supabase
          .from('viewing_requests')
          .update({
            status: 'paid',
            stripe_payment_intent_id: session.payment_intent,
            paid_at: new Date().toISOString(),
          })
          .eq('id', viewing.id);

        await recordStatusChange({
          entityType: 'viewing_request',
          entityId: viewing.id,
          fromStatus: 'payment_pending',
          toStatus: 'paid',
          changedBy: 'stripe_webhook',
        });

        await logAdminAction({
          action: 'viewing.payment_received',
          entityType: 'viewing_request',
          entityId: viewing.id,
          details: {
            reference,
            paymentIntent: session.payment_intent,
            amount: session.amount_total / 100,
          },
        });

        revalidatePath('/admin/visites');
        revalidatePath('/mon-compte');
      }
    }
  }

  return NextResponse.json({ received: true });
}
