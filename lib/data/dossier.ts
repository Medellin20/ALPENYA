import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Ces fonctions utilisent la service role car les tables viewing_requests /
 * reservations / guarantee_payments / refund_requests n'ont volontairement
 * aucune policy RLS publique (voir supabase/rls_policies.sql). L'accès à
 * une page de confirmation ou au dossier client se fait donc exclusivement
 * via ces lectures côté serveur, filtrées par référence ou par e-mail —
 * jamais directement depuis le navigateur.
 */

export async function getViewingByReference(reference: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('viewing_requests')
    .select('*, properties(title, slug, city, viewing_fee), clients(first_name, last_name, email)')
    .eq('reference', reference)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function getReservationByReference(reference: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('reservations')
    .select('*, properties(title, slug, city, monthly_price, deposit_amount), clients(first_name, last_name, email)')
    .eq('reference', reference)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function getClientDossierByEmail(email: string) {
  const supabase = createAdminClient();

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (!client) return null;

  const [{ data: viewings }, { data: reservations }] = await Promise.all([
    supabase
      .from('viewing_requests')
      .select('*, properties(title, slug, city)')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('reservations')
      .select('*, properties(title, slug, city, deposit_amount), guarantee_payments(*), refund_requests(*)')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false }),
  ]);

  return { client, viewings: viewings ?? [], reservations: reservations ?? [] };
}

export async function getGuaranteeForReservation(reservationId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('guarantee_payments')
    .select('*')
    .eq('reservation_id', reservationId)
    .maybeSingle();

  if (error) return null;
  return data;
}
