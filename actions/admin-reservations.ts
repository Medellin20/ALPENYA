'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordStatusChange, logAdminAction } from '@/lib/data/history';
import type { ActionResult } from '@/types';
import type { ReservationStatus } from '@/types/database';

/** Met à jour le statut d'une demande traitée manuellement par l'agence. */
export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
  adminNotes?: string
): Promise<ActionResult> {
  const supabase = createAdminClient();

  const { data: reservation } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!reservation) return { success: false, message: 'Réservation introuvable.' };

  const { error } = await supabase
    .from('reservations')
    .update({ status, ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}) })
    .eq('id', id);

  if (error) return { success: false, message: 'Impossible de mettre à jour le statut.' };

  await recordStatusChange({
    entityType: 'reservation',
    entityId: id,
    fromStatus: reservation.status,
    toStatus: status,
    changedBy: 'admin',
  });
  await logAdminAction({ action: 'reservation.status_change', entityType: 'reservation', entityId: id, details: { status } });

  revalidatePath('/admin/reservations');
  revalidatePath('/admin');
  revalidatePath('/mon-compte');

  return { success: true, message: 'Statut de la réservation mis à jour.' };
}
