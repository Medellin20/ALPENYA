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

  const reservationPayload = {
    reference,
    property_id: property.id,
    client_id: client.id,
    desired_move_in_date: parsed.data.desiredMoveInDate,
    // Colonne historique : elle contient désormais la durée du séjour en jours.
    duration_months: parsed.data.durationDays,
    occupants_count: parsed.data.occupantsCount,
    has_pets: parsed.data.hasPets,
    status: 'submitted' as const,
  };

  let { data: reservation, error: insertError } = await supabase
    .from('reservations')
    .insert(reservationPayload)
    .select('*')
    .single();

  // Compatibilité temporaire avec une base qui n’a pas encore reçu la
  // migration `has_pets`. Le champ message n’est plus exposé au client et sert
  // uniquement à conserver cette réponse jusqu’au déploiement de la migration.
  if (insertError?.code === 'PGRST204' || insertError?.code === '42703') {
    const { has_pets: _hasPets, ...legacyPayload } = reservationPayload;
    const legacyInsert = await supabase
      .from('reservations')
      .insert({
        ...legacyPayload,
        message: parsed.data.hasPets ? 'ANIMAUX_DE_COMPAGNIE_OUI' : 'ANIMAUX_DE_COMPAGNIE_NON',
      })
      .select('*')
      .single();
    reservation = legacyInsert.data;
    insertError = legacyInsert.error;
  }

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
    Occupants: parsed.data.occupantsCount,
    'Animaux de compagnie': parsed.data.hasPets ? 'Oui' : 'Non',
  });

  revalidatePath('/admin/reservations');
  revalidatePath('/admin');

  redirect(
    `/appartements/${propertySlug}/reserver/confirmation?ref=${reference}&email=${encodeURIComponent(
      parsed.data.email
    )}`
  );
}
