'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { isValidAdminSessionToken } from '@/lib/auth/admin-session';
import { ADMIN_SESSION_COOKIE } from '@/lib/utils/constants';
import { createAdminClient } from '@/lib/supabase/admin';
import { paymentSettingsSchema, type PaymentSettingsInput } from '@/lib/validations/payment';
import type { ActionResult } from '@/types';

export async function updatePaymentSettings(input: PaymentSettingsInput): Promise<ActionResult> {
  if (!await isValidAdminSessionToken(cookies().get(ADMIN_SESSION_COOKIE)?.value)) {
    return { success: false, message: 'Veuillez vous reconnecter à l’espace administrateur.' };
  }
  const parsed = paymentSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: 'Saisissez un lien de paiement HTTPS valide.', fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { error } = await createAdminClient().from('payment_settings').upsert({
    id: 1,
    payment_url: parsed.data.paymentUrl,
    updated_at: new Date().toISOString(),
  });
  if (error) return { success: false, message: 'Impossible d’enregistrer le lien de paiement. Vérifiez la configuration de la base de données.' };
  revalidatePath('/admin/parametres');
  revalidatePath('/appartements/[slug]/visite/confirmation', 'page');
  revalidatePath('/appartements/[slug]/reserver/confirmation', 'page');
  return { success: true, message: 'Lien de paiement mis à jour.' };
}
