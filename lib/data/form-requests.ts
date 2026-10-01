import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { RequestStatus } from '@/types/database';

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  new: 'Nouvelle',
  in_progress: 'En cours',
  accepted: 'Acceptée',
  rejected: 'Refusée',
};

export const REQUEST_STATUS_OPTIONS = Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => ({
  value: value as RequestStatus,
  label,
}));

export async function getVisitRequests() {
  const { data, error } = await createAdminClient()
    .from('visit_requests')
    .select('*, properties(title, city)')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getReservationRequests() {
  const { data, error } = await createAdminClient()
    .from('reservation_requests')
    .select('*, properties(title, city)')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}
