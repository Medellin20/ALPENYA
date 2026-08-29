'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { upsertClient } from '@/lib/data/clients';
import { recordStatusChange } from '@/lib/data/history';
import { viewingRequestSchema, type ViewingRequestInput } from '@/lib/validations/viewing';
import { generateReference } from '@/lib/utils/reference';
import { sendAdminAlert } from '@/lib/notifications/email';
import type { ActionResult } from '@/types';

/**
 * Crée une demande de visite : upsert du client, insertion de la demande,
 * puis redirection vers la confirmation. La suite est traitée manuellement.
 */
export async function createViewingRequest(
  input: ViewingRequestInput,
  propertySlug: string
): Promise<ActionResult> {
  const parsed = viewingRequestSchema.safeParse(input);
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
    .select('id, title, status, is_published')
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

  const reference = generateReference('VIS');
  const initialStatus = 'pending';

  const { data: viewing, error: insertError } = await supabase
    .from('viewing_requests')
    .insert({
      reference,
      property_id: property.id,
      client_id: client.id,
      requested_date: parsed.data.requestedDate,
      requested_time_slot: parsed.data.requestedTimeSlot,
      occupants_count: parsed.data.occupantsCount,
      status: initialStatus,
      fee_amount: 0,
    })
    .select('*')
    .single();

  if (insertError || !viewing) {
    return { success: false, message: 'Une erreur est survenue, merci de réessayer.' };
  }

  await recordStatusChange({
    entityType: 'viewing_request',
    entityId: viewing.id,
    fromStatus: null,
    toStatus: initialStatus,
    changedBy: 'client',
  });

  await sendAdminAlert(`Nouvelle demande de visite — ${reference}`, {
    Référence: reference,
    Logement: property.title,
    Client: `${parsed.data.firstName} ${parsed.data.lastName}`,
    Email: parsed.data.email,
    Téléphone: parsed.data.phone,
    Date: parsed.data.requestedDate,
    Créneau: parsed.data.requestedTimeSlot,
    Occupants: parsed.data.occupantsCount,
  });

  revalidatePath('/admin/visites');
  revalidatePath('/admin');

  redirect(`/appartements/${propertySlug}/visite/confirmation?ref=${reference}`);
}
