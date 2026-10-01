'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/data/history';
import { bankSettingsSchema, type BankSettingsInput } from '@/lib/validations/admin';
import type { ActionResult } from '@/types';

export async function updateBankSettings(input: BankSettingsInput): Promise<ActionResult> {
  const parsed = bankSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Merci de corriger les champs indiqués.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('bank_settings')
    .update({
      beneficiary_name: parsed.data.beneficiaryName,
      iban: parsed.data.iban,
      bic: parsed.data.bic,
      payment_instructions: parsed.data.paymentInstructions,
      default_deposit_amount: parsed.data.defaultDepositAmount,
    })
    .eq('id', 1)
    .select('id')
    .maybeSingle();

  if (error || !data) {
    return { success: false, message: 'Impossible de mettre à jour la configuration bancaire.' };
  }

  await logAdminAction({ action: 'bank_settings.update' });
  revalidatePath('/admin/configuration-bancaire');
  revalidatePath('/mon-compte');
  revalidatePath('/appartements/[slug]/visite/confirmation', 'page');
  revalidatePath('/appartements/[slug]/reserver/confirmation', 'page');

  return { success: true, message: 'Configuration bancaire mise à jour avec succès.' };
}
