import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { BankSettings } from '@/types/database';

export const DEMO_BANK_SETTINGS: BankSettings = {
  id: 1,
  beneficiary_name: 'ALPENYA (À CONFIGURER)',
  iban: 'NL00 TEST 0000 0000 00',
  bic: 'TESTNL2A',
  bank_name: 'Nederlandse Voorbeeldbank',
  payment_instructions: 'RIB de démonstration — ne pas effectuer de virement avant son remplacement dans l’espace administrateur.',
  default_deposit_amount: 0,
  updated_at: new Date(0).toISOString(),
};

export function isDemoBankSettings(settings: BankSettings) {
  const iban = settings.iban.replace(/\s/g, '').toUpperCase();
  return iban === 'NL91ABNA0417164300' || iban.startsWith('NL00BANK') || iban.startsWith('NL00TEST');
}

/**
 * Les coordonnées bancaires sont stockées dans bank_settings (RLS activée,
 * aucune policy anon — voir supabase/rls_policies.sql) et modifiables
 * uniquement depuis /admin/configuration-bancaire. Cette fonction est la
 * SEULE porte d'accès en lecture, utilisée côté serveur pour afficher les
 * instructions de virement au client lors du parcours de garantie.
 * L'IBAN n'est jamais codé en dur dans un composant.
 */
export async function getBankSettings(): Promise<BankSettings | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('bank_settings').select('*').eq('id', 1).maybeSingle();
  if (error) return null;
  return data;
}
