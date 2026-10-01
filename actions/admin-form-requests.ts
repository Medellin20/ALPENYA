'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ActionResult } from '@/types';
import type { RequestStatus } from '@/types/database';

const STATUS_PATHS = {
  visit_requests: '/admin/demandes-visites',
  reservation_requests: '/admin/demandes-reservations',
} as const;

export async function updateFormRequestStatus(
  table: keyof typeof STATUS_PATHS,
  id: string,
  status: RequestStatus
): Promise<ActionResult> {
  if (!STATUS_PATHS[table] || !['new', 'in_progress', 'accepted', 'rejected'].includes(status)) {
    return { success: false, message: 'Statut invalide.' };
  }

  const { error } = await createAdminClient()
    .from(table)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { success: false, message: 'Impossible de mettre à jour le statut.' };
  revalidatePath(STATUS_PATHS[table]);
  return { success: true, message: 'Statut de la demande mis à jour.' };
}

export async function updateVisitRequestStatus(id: string, status: RequestStatus) {
  return updateFormRequestStatus('visit_requests', id, status);
}

export async function updateReservationRequestStatus(id: string, status: RequestStatus) {
  return updateFormRequestStatus('reservation_requests', id, status);
}
