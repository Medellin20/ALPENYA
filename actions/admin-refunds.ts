'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordStatusChange, logAdminAction } from '@/lib/data/history';
import type { ActionResult } from '@/types';
import type { RefundStatus } from '@/types/database';

/**
 * Fait progresser une demande de remboursement. IMPORTANT : conformément
 * au cahier des charges, aucune API bancaire n'est intégrée. Passer le
 * statut à "refunded" enregistre uniquement que le virement de
 * remboursement a été EFFECTUÉ MANUELLEMENT par l'agence — l'application
 * ne déclenche aucun virement réel.
 */
export async function updateRefundStatus(id: string, status: RefundStatus, adminNotes?: string): Promise<ActionResult> {
  const supabase = createAdminClient();

  const { data: refund } = await supabase.from('refund_requests').select('*').eq('id', id).maybeSingle();
  if (!refund) return { success: false, message: 'Demande de remboursement introuvable.' };

  const { error } = await supabase
    .from('refund_requests')
    .update({
      status,
      ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}),
      ...(status === 'refunded' ? { processed_at: new Date().toISOString() } : {}),
    })
    .eq('id', id);

  if (error) return { success: false, message: 'Impossible de mettre à jour le statut.' };

  const guaranteeStatusMap: Partial<Record<RefundStatus, string>> = {
    approved: 'refund_processing',
    processing: 'refund_processing',
    refunded: 'refunded',
    rejected: 'payment_received',
  };
  const nextGuaranteeStatus = guaranteeStatusMap[status];
  if (nextGuaranteeStatus) {
    await supabase.from('guarantee_payments').update({ status: nextGuaranteeStatus }).eq('id', refund.guarantee_payment_id);
  }

  if (status === 'refunded') {
    await supabase.from('reservations').update({ status: 'cancelled' }).eq('id', refund.reservation_id);
  }

  await recordStatusChange({
    entityType: 'refund_request',
    entityId: id,
    fromStatus: refund.status,
    toStatus: status,
    changedBy: 'admin',
  });
  await logAdminAction({ action: 'refund.status_change', entityType: 'refund_request', entityId: id, details: { status } });

  revalidatePath('/admin/remboursements');
  revalidatePath('/admin/garanties');
  revalidatePath('/mon-compte');

  return { success: true, message: 'Statut du remboursement mis à jour.' };
}
