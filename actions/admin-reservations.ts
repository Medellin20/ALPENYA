'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordStatusChange, logAdminAction } from '@/lib/data/history';
import { getBankSettings } from '@/lib/data/bank';
import { RESERVATION_STATUS_LABELS } from '@/lib/utils/constants';
import { generateGuaranteeReference } from '@/lib/utils/reference';
import type { ActionResult } from '@/types';
import type { ReservationStatus } from '@/types/database';

/** Met à jour le statut d'une demande traitée manuellement par l'agence. */
export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
  adminNotes?: string
): Promise<ActionResult> {
  if (!(status in RESERVATION_STATUS_LABELS)) {
    return { success: false, message: 'Statut de réservation invalide.' };
  }

  const supabase = createAdminClient();

  const { data: reservation } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!reservation) return { success: false, message: 'Réservation introuvable.' };

  if (status === 'awaiting_guarantee') {
    const { data: existingGuarantee, error: guaranteeLookupError } = await supabase
      .from('guarantee_payments')
      .select('id')
      .eq('reservation_id', id)
      .maybeSingle();

    if (guaranteeLookupError) {
      return { success: false, message: 'Impossible de vérifier la garantie de cette réservation.' };
    }

    if (!existingGuarantee) {
      const bankSettings = await getBankSettings();
      if (!bankSettings) {
        return { success: false, message: 'Configurez les coordonnées bancaires avant de demander une garantie.' };
      }
      if (bankSettings.default_deposit_amount <= 0) {
        return { success: false, message: 'Configurez un montant de garantie supérieur à 0 avant de continuer.' };
      }

      const { error: guaranteeInsertError } = await supabase.from('guarantee_payments').insert({
        reference: generateGuaranteeReference(reservation.reference),
        reservation_id: reservation.id,
        client_id: reservation.client_id,
        amount: bankSettings.default_deposit_amount,
        status: 'awaiting_payment',
      });

      if (guaranteeInsertError) {
        return { success: false, message: 'Impossible de créer la garantie de cette réservation.' };
      }
    }
  }

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
