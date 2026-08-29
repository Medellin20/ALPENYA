import 'server-only';
import Stripe from 'stripe';

// -----------------------------------------------------------------------------
// Abstraction de paiement — ALPENYA
//
// Aujourd'hui : Stripe Checkout (carte + iDEAL) pour les FRAIS DE VISITE.
// La garantie/dépôt de location reste réglée par virement bancaire classique
// (voir bank_settings + guarantee_payments), conformément au cahier des
// charges. Cette abstraction permet de brancher un autre PSP plus tard sans
// toucher au reste de l'application : il suffit d'implémenter la même
// interface `PaymentProvider` dans un nouveau fichier (ex: mollie.ts).
// -----------------------------------------------------------------------------

export interface CreateCheckoutParams {
  amount: number; // en euros
  currency?: string;
  description: string;
  reference: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata: Record<string, string>;
}

export interface PaymentProvider {
  createCheckoutSession(params: CreateCheckoutParams): Promise<{ url: string; sessionId: string }>;
}

function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY manquant. Ajoutez votre clé secrète Stripe dans .env.local pour activer le paiement des frais de visite.'
    );
  }
  return new Stripe(key, { apiVersion: '2024-06-20' });
}

export const stripeProvider: PaymentProvider = {
  async createCheckoutSession({
    amount,
    currency = 'eur',
    description,
    reference,
    successUrl,
    cancelUrl,
    customerEmail,
    metadata,
  }) {
    const stripe = getStripeClient();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'ideal'],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: description,
              description: `Référence : ${reference}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { reference, ...metadata },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    if (!session.url) {
      throw new Error('Stripe n’a pas renvoyé d’URL de paiement.');
    }

    return { url: session.url, sessionId: session.id };
  },
};

/**
 * Indique si Stripe est configuré (clé secrète présente). Utilisé pour
 * afficher un message clair dans l'UI plutôt qu'un bouton qui échouerait
 * silencieusement si les clés ne sont pas encore renseignées.
 */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripeWebhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET;
}

export function getStripeClientForWebhook(): Stripe {
  return getStripeClient();
}
