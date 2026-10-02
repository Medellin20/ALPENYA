'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { reservationSchema, type ReservationInput } from '@/lib/validations/reservation';
import { generateReference } from '@/lib/utils/reference';
import type { ActionResult } from '@/types';
import { sendFormRequestAlert } from '@/lib/notifications/email';
import {
  calculateReservationPayment,
  calculateStayRentalAmount,
  getReservationCleaningFee,
  getReservationRate,
} from '@/lib/utils/reservation-payment';

/**
 * Crée une demande de réservation de logement (dossier locataire). Le
 * La demande est ensuite examinée et traitée manuellement par l'agence.
 */
export async function createReservation(
  input: ReservationInput,
  propertySlug: string
): Promise<ActionResult> {
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
    .select('id, title, is_published, status, property_type, monthly_price, deposit_amount, viewing_fee, service_charges, cleaning_fee')
    .eq('id', parsed.data.propertyId)
    .maybeSingle();

  if (propertyError || !property || !property.is_published) {
    return { success: false, message: 'Ce logement n’est plus disponible.' };
  }

  const reference = generateReference('REN');
  const rate = getReservationRate({
    propertyType: property.property_type,
    monthlyPrice: property.monthly_price,
    depositAmount: property.deposit_amount,
    viewingFee: property.viewing_fee,
    serviceCharges: property.service_charges,
    cleaningFee: property.cleaning_fee ?? 0,
  }, parsed.data.selectedRateId);
  const availableCleaningFee = getReservationCleaningFee({
    propertyType: property.property_type,
    monthlyPrice: property.monthly_price,
    depositAmount: property.deposit_amount,
    viewingFee: property.viewing_fee,
    serviceCharges: property.service_charges,
    cleaningFee: property.cleaning_fee ?? 0,
  });
  const cleaningFeeAmount = parsed.data.hasCleaningFee ? availableCleaningFee : 0;
  const rentalAmount = rate
    ? calculateStayRentalAmount(rate.amount, parsed.data.durationDays, rate.unit)
    : null;
  const paymentBreakdown = rentalAmount === null
    ? null
    : calculateReservationPayment(rentalAmount, cleaningFeeAmount);
  const paymentAmount = paymentBreakdown?.totalAmount ?? null;

  const requestPayload = {
    reference,
    property_id: property.id,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    desired_move_in_date: parsed.data.desiredMoveInDate,
    selected_rate_id: parsed.data.selectedRateId ?? null,
    duration_days: parsed.data.durationDays,
    occupants_count: parsed.data.occupantsCount,
    has_pets: parsed.data.hasPets,
    has_cleaning_fee: cleaningFeeAmount > 0,
    cleaning_fee_amount: cleaningFeeAmount,
    rental_amount: rentalAmount,
    payment_amount: paymentAmount,
    status: 'new' as const,
  };

  const { error: requestError } = await supabase
    .from('reservation_requests')
    .insert(requestPayload);

  if (requestError) return { success: false, message: 'Une erreur est survenue, merci de réessayer.' };

  await sendFormRequestAlert('réservation', reference, {
    Logement: property.title,
    Client: `${parsed.data.firstName} ${parsed.data.lastName}`,
    'E-mail': parsed.data.email,
    'Téléphone': parsed.data.phone,
    'Date d’entrée souhaitée': parsed.data.desiredMoveInDate,
    Durée: `${parsed.data.durationDays} jour${parsed.data.durationDays > 1 ? 's' : ''}`,
    Occupants: parsed.data.occupantsCount,
    'Animaux de compagnie': parsed.data.hasPets ? 'Oui' : 'Non',
    'Tarif sélectionné': parsed.data.selectedRateId ?? null,
    'Forfait ménage demandé': parsed.data.hasCleaningFee ? 'Oui' : 'Non',
    'Montant du forfait ménage': cleaningFeeAmount,
    'Montant du séjour': rentalAmount,
    'Montant à régler estimé': paymentAmount,
  });

  revalidatePath('/admin/reservations');
  revalidatePath('/admin/demandes-reservations');
  revalidatePath('/admin');

  redirect(`/appartements/${propertySlug}/reserver/confirmation?ref=${reference}`);
}
