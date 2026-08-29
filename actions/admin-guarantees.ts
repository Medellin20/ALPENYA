'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordStatusChange, logAdminAction } from '@/lib/data/history';
import type { ActionResult } from '@/types';
import type { GuaranteeStatus } from '@/types/database';

/**
 * Validation manuelle de la réception d'un virement de garantie par
 * l'administrateur. Aucune vérification bancaire automatique n'est
 * effectuée : c'est une confirmation humaine après consultation du relevé
 * bancaire réel de l'agence.
 */
export async function updateGuaranteeStatus(id: string, status: GuaranteeStatus): Promise<ActionResult> {
  const supabase = createAdminClient();

  const { data: guarantee } = await supabase.from('guarantee_payments').select('*').eq('id', id).maybeSingle();
  if (!guarantee) return { success: false, message: 'Dossier de garantie introuvable.' };

  const updatePayload: Record<string, unknown> = { status };
  if (status === 'payment_received' && !guarantee.validated_at) {
    updatePayload.validated_at = new Date().toISOString();
    updatePayload.validated_by = 'admin';
  }

  const { error } = await supabase.from('guarantee_payments').update(updatePayload).eq('id', id);
  if (error) return { success: false, message: 'Impossible de mettre à jour le statut.' };

  // Lorsque la garantie est confirmée, on fait progresser la réservation associée.
  if (status === 'reservation_confirmed') {
    await supabase.from('reservations').update({ status: 'confirmed' }).eq('id', guarantee.reservation_id);
    await recordStatusChange({
      entityType: 'reservation',
      entityId: guarantee.reservation_id,
      fromStatus: 'guarantee_paid',
      toStatus: 'confirmed',
      changedBy: 'admin',
    });
  } else if (status === 'payment_received') {
    await supabase.from('reservations').update({ status: 'guarantee_paid' }).eq('id', guarantee.reservation_id);
    await recordStatusChange({
      entityType: 'reservation',
      entityId: guarantee.reservation_id,
      fromStatus: 'awaiting_guarantee',
      toStatus: 'guarantee_paid',
      changedBy: 'admin',
    });
  }

  await recordStatusChange({
    entityType: 'guarantee_payment',
    entityId: id,
    fromStatus: guarantee.status,
    toStatus: status,
    changedBy: 'admin',
  });
  await logAdminAction({ action: 'guarantee.status_change', entityType: 'guarantee_payment', entityId: id, details: { status } });

  revalidatePath('/admin/garanties');
  revalidatePath('/admin/reservations');
  revalidatePath('/mon-compte');

  return { success: true, message: 'Statut de la garantie mis à jour.' };
}
