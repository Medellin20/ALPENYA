import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { paymentLinkSchema } from '@/lib/validations/payment';

export async function getPaymentSettings() {
  const { data, error } = await createAdminClient()
    .from('payment_settings').select('payment_url').eq('id', 1).maybeSingle();
  const parsed = paymentLinkSchema.safeParse(data?.payment_url);
  return { paymentUrl: parsed.success ? parsed.data : '', available: !error };
}
