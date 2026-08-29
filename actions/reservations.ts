'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { upsertClient } from '@/lib/data/clients';
import { recordStatusChange } from '@/lib/data/history';
import { reservationSchema, type ReservationInput } from '@/lib/validations/reservation';
import { generateReference } from '@/lib/utils/reference';
import type { ActionResult } from '@/types';
import { sendAdminAlert } from '@/lib/notifications/email';

/**
 * Crée une demande de réservation de logement (dossier locataire). Le
 * La demande est ensuite examinée et traitée manuellement par l'agence.
 */
export async function createReservation(input: ReservationInput, propertySlug: string): Promise<ActionResult> {
  const parsed = reservationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Merci de corriger les champs indiqués.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('id, is_published, status')
    .eq('id', parsed.data.propertyId)
    .maybeSingle();

  if (propertyError || !property || !property.is_published) {
    return { success: false, message: 'Ce logement n’est plus disponible.' };
  }

  const client = await upsertClient({
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    phone: parsed.data.phone,
  });

  const reference = generateReference('REN');

  const { data: reservation, error: insertError } = await supabase
    .from('reservations')
    .insert({
      reference,
      property_id: property.id,
      client_id: client.id,
      desired_move_in_date: parsed.data.desiredMoveInDate,
      // Colonne historique : elle contient désormais la durée du séjour en jours.
      duration_months: parsed.data.durationDays,
      occupants_count: 1,
      message: parsed.data.message || null,
      status: 'submitted',
    })
    .select('*')
    .single();

  if (insertError || !reservation) {
    return { success: false, message: 'Une erreur est survenue, merci de réessayer.' };
  }

  await recordStatusChange({
    entityType: 'reservation',
    entityId: reservation.id,
    fromStatus: null,
    toStatus: 'submitted',
    changedBy: 'client',
  });

  await sendAdminAlert(`Nouvelle réservation — ${reference}`, {
    Référence: reference,
    Client: `${parsed.data.firstName} ${parsed.data.lastName}`,
    Email: parsed.data.email,
    Téléphone: parsed.data.phone,
    'Date de réservation': parsed.data.desiredMoveInDate,
    Durée: `${parsed.data.durationDays} jour${parsed.data.durationDays > 1 ? 's' : ''}`,
  });

  revalidatePath('/admin/reservations');
  revalidatePath('/admin');

  redirect(
    `/appartements/${propertySlug}/reserver/confirmation?ref=${reference}&email=${encodeURIComponent(
      parsed.data.email
    )}`
  );
}
