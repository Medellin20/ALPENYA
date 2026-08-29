import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export async function getAllViewingsAdmin(params: { status?: string; date?: string } = {}) {
  const supabase = createAdminClient();
  let query = supabase
    .from('viewing_requests')
    .select('*, properties(title, slug, city), clients(first_name, last_name, email, phone)')
    .order('created_at', { ascending: false });

  if (params.status) query = query.eq('status', params.status);
  if (params.date) query = query.eq('requested_date', params.date);

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function getAllReservationsAdmin(params: { status?: string; scope?: string } = {}) {
  const supabase = createAdminClient();
  let query = supabase
    .from('reservations')
    .select('*, properties(title, slug, city), clients(first_name, last_name, email, phone)')
    .order('created_at', { ascending: false });

  if (params.status) query = query.eq('status', params.status);
  if (params.scope === 'pending') query = query.in('status', ['submitted', 'under_review']);

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function getReservationStatusHistory(reservationIds: string[]) {
  if (reservationIds.length === 0) return {};

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('status_history')
    .select('*')
    .eq('entity_type', 'reservation')
    .in('entity_id', reservationIds)
    .order('created_at', { ascending: false });

  return (data ?? []).reduce<Record<string, typeof data>>((history, entry) => {
    (history[entry.entity_id] ??= []).push(entry);
    return history;
  }, {});
}

export async function getAllGuaranteesAdmin(params: { status?: string } = {}) {
  const supabase = createAdminClient();
  let query = supabase
    .from('guarantee_payments')
    .select('*, reservations(reference, property_id, properties(title)), clients(first_name, last_name, email)')
    .order('created_at', { ascending: false });

  if (params.status) query = query.eq('status', params.status);

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function getAllRefundsAdmin(params: { status?: string } = {}) {
  const supabase = createAdminClient();
  let query = supabase
    .from('refund_requests')
    .select('*, reservations(reference, properties(title)), clients(first_name, last_name, email)')
    .order('created_at', { ascending: false });

  if (params.status) query = query.eq('status', params.status);

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function getAllClientsAdmin(search?: string) {
  const supabase = createAdminClient();
  let query = supabase.from('clients').select('*').order('created_at', { ascending: false });

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function getClientDetailAdmin(clientId: string) {
  const supabase = createAdminClient();
  const [{ data: client }, { data: viewings }, { data: reservations }] = await Promise.all([
    supabase.from('clients').select('*').eq('id', clientId).maybeSingle(),
    supabase.from('viewing_requests').select('*, properties(title, slug)').eq('client_id', clientId),
    supabase.from('reservations').select('*, properties(title, slug)').eq('client_id', clientId),
  ]);

  if (!client) return null;
  return { client, viewings: viewings ?? [], reservations: reservations ?? [] };
}
