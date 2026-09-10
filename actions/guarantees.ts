'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordStatusChange } from '@/lib/data/history';
import { declareTransferSchema } from '@/lib/validations/refund';
import type { ActionResult } from '@/types';
import { sendAdminAlert } from '@/lib/notifications/email';

/**
 * Le client déclare avoir effectué le virement de garantie et peut joindre
 * un justificatif (stocké dans le bucket privé `payment-proofs`). Le statut
 * passe à "payment_declared" ; la validation finale ("payment_received")
 * reste une action manuelle de l'administrateur (voir actions/admin-guarantees.ts).
 */
export async function declareGuaranteeTransfer(
  _previousState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    guaranteePaymentId: String(formData.get('guaranteePaymentId') || ''),
    transferDate: String(formData.get('transferDate') || ''),
    bankName: String(formData.get('bankName') || ''),
    reference: String(formData.get('reference') || ''),
  };

  const parsed = declareTransferSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Merci de corriger les champs indiqués.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();

  const { data: guarantee, error: fetchError } = await supabase
    .from('guarantee_payments')
    .select('*, clients(first_name, last_name, email, phone), reservations(reference)')
    .eq('id', parsed.data.guaranteePaymentId)
    .maybeSingle();

  if (fetchError || !guarantee) {
    return { success: false, message: 'Dossier de garantie introuvable.' };
  }

  let proofStoragePath: string | null = guarantee.proof_storage_path;
  const proofFile = formData.get('proof') as File | null;

  if (proofFile && proofFile.size > 0) {
    if (proofFile.size > 8 * 1024 * 1024) {
      return { success: false, message: 'Le justificatif ne doit pas dépasser 8 Mo.' };
    }
    const extension = proofFile.name.split('.').pop() || 'pdf';
    const path = `guarantees/${guarantee.reference}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(path, proofFile, { upsert: true, contentType: proofFile.type });

    if (uploadError) {
      return { success: false, message: 'Le téléversement du justificatif a échoué. Merci de réessayer.' };
    }
    proofStoragePath = path;
  }

  const { error: updateError } = await supabase
    .from('guarantee_payments')
    .update({
      status: 'payment_declared',
      declared_transfer_date: parsed.data.transferDate,
      declared_bank_name: parsed.data.bankName,
      declared_reference: parsed.data.reference,
      proof_storage_path: proofStoragePath,
    })
    .eq('id', guarantee.id);

  if (updateError) {
    return { success: false, message: 'Une erreur est survenue, merci de réessayer.' };
  }

  await recordStatusChange({
    entityType: 'guarantee_payment',
    entityId: guarantee.id,
    fromStatus: guarantee.status,
    toStatus: 'payment_declared',
    changedBy: 'client',
  });

  await sendAdminAlert(`Virement de garantie déclaré — ${guarantee.reference}`, {
    Référence: guarantee.reference,
    Réservation: (guarantee as any).reservations?.reference,
    Client: `${(guarantee as any).clients?.first_name ?? ''} ${(guarantee as any).clients?.last_name ?? ''}`.trim(),
    Email: (guarantee as any).clients?.email,
    Téléphone: (guarantee as any).clients?.phone,
    Date: parsed.data.transferDate,
    Banque: parsed.data.bankName,
    'Référence du virement': parsed.data.reference,
    Justificatif: proofStoragePath ? 'Oui' : 'Non',
  });

  revalidatePath('/admin/garanties');
  revalidatePath('/mon-compte');

  return { success: true, message: 'Votre virement a bien été déclaré. Notre équipe va le vérifier.' };
}
