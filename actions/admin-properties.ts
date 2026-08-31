'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/data/history';
import { propertySchema, type PropertyInput } from '@/lib/validations/property';
import type { ActionResult } from '@/types';
import type { PropertyStatus } from '@/types/database';

function toDbPayload(data: PropertyInput) {
  return {
    title: data.title,
    description: data.description,
    slug: data.slug,
    property_type: data.propertyType,
    city: data.city,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    monthly_price: data.monthlyPrice,
    service_charges: data.serviceCharges,
    deposit_amount: data.depositAmount,
    viewing_fee: data.viewingFee,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    rooms: data.rooms ?? null,
    contract_type: data.contractType,
    interior_type: data.interiorType,
    maintenance_condition: data.maintenanceCondition,
    has_elevator: data.hasElevator,
    has_balcony: data.hasBalcony,
    has_terrace: data.hasTerrace,
    has_parking: data.hasParking,
    has_garage: data.hasGarage,
    has_garden: data.hasGarden,
    is_furnished: data.isFurnished,
    available_from: data.availableFrom || null,
    minimum_stay_months: data.minimumStayMonths,
    status: data.status,
    is_published: data.isPublished,
    is_featured: data.isFeatured,
  };
}

async function syncAmenities(propertyId: string, amenityIds: string[]) {
  const supabase = createAdminClient();
  await supabase.from('property_amenities').delete().eq('property_id', propertyId);
  if (amenityIds.length > 0) {
    await supabase
      .from('property_amenities')
      .insert(amenityIds.map((amenityId) => ({ property_id: propertyId, amenity_id: amenityId })));
  }
}

function revalidatePublicPaths(slug?: string) {
  revalidatePath('/admin');
  revalidatePath('/appartements');
  revalidatePath('/');
  revalidatePath('/admin/appartements');
  if (slug) revalidatePath(`/appartements/${slug}`);
}

/** Vérifie un slug pendant la saisie, sans attendre l'envoi du formulaire. */
export async function checkPropertySlugAvailability(
  slug: string,
  propertyId?: string
): Promise<{ available: boolean; error?: boolean }> {
  if (!slug) return { available: true };

  const supabase = createAdminClient();
  let query = supabase.from('properties').select('id').eq('slug', slug);
  if (propertyId) query = query.neq('id', propertyId);

  const { data, error } = await query.maybeSingle();
  if (error) return { available: false, error: true };

  return { available: !data };
}

export async function createProperty(input: PropertyInput): Promise<ActionResult<{ id: string }>> {
  const parsed = propertySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Merci de corriger les champs indiqués.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();

  const { data: existingSlug } = await supabase
    .from('properties')
    .select('id')
    .eq('slug', parsed.data.slug)
    .maybeSingle();

  if (existingSlug) {
    return {
      success: false,
      message: 'Ce slug est déjà utilisé par un autre logement.',
      fieldErrors: { slug: ['Ce slug est déjà utilisé.'] },
    };
  }

  const { data: property, error } = await supabase
    .from('properties')
    // `surface_m2` est encore obligatoire dans le schéma historique, mais le
    // champ n’est plus demandé dans l’administration.
    .insert({ ...toDbPayload(parsed.data), surface_m2: 1 })
    .select('id')
    .single();

  if (error || !property) {
    return { success: false, message: 'Une erreur est survenue lors de la création du logement.' };
  }

  await syncAmenities(property.id, parsed.data.amenityIds);
  await logAdminAction({ action: 'property.create', entityType: 'property', entityId: property.id });
  revalidatePublicPaths(parsed.data.slug);

  return { success: true, message: 'Bien ajouté avec succès.', data: { id: property.id } };
}

export async function updateProperty(id: string, input: PropertyInput): Promise<ActionResult> {
  const parsed = propertySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Merci de corriger les champs indiqués.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();

  const { data: existingSlug } = await supabase
    .from('properties')
    .select('id')
    .eq('slug', parsed.data.slug)
    .neq('id', id)
    .maybeSingle();

  if (existingSlug) {
    return {
      success: false,
      message: 'Ce slug est déjà utilisé par un autre logement.',
      fieldErrors: { slug: ['Ce slug est déjà utilisé.'] },
    };
  }

  const { error } = await supabase.from('properties').update(toDbPayload(parsed.data)).eq('id', id);

  if (error) {
    return { success: false, message: 'Une erreur est survenue lors de la mise à jour du logement.' };
  }

  await syncAmenities(id, parsed.data.amenityIds);
  await logAdminAction({ action: 'property.update', entityType: 'property', entityId: id });
  revalidatePublicPaths(parsed.data.slug);

  return { success: true, message: 'Bien mis à jour avec succès.' };
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  const supabase = createAdminClient();

  const { data: images } = await supabase.from('property_images').select('storage_path').eq('property_id', id);
  if (images && images.length > 0) {
    await supabase.storage.from('property-images').remove(images.map((i) => i.storage_path));
  }

  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) {
    return { success: false, message: 'Impossible de supprimer ce logement.' };
  }

  await logAdminAction({ action: 'property.delete', entityType: 'property', entityId: id });
  revalidatePublicPaths();

  return { success: true, message: 'Bien supprimé.' };
}

export async function updatePropertyStatus(id: string, status: PropertyStatus): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('properties').update({ status }).eq('id', id).select('slug').single();

  if (error) {
    return { success: false, message: 'Impossible de mettre à jour le statut.' };
  }

  await logAdminAction({ action: 'property.status_change', entityType: 'property', entityId: id, details: { status } });
  revalidatePublicPaths(data?.slug);

  return { success: true, message: 'Statut mis à jour.' };
}

export async function togglePropertyPublish(id: string, isPublished: boolean): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('properties')
    .update({ is_published: isPublished })
    .eq('id', id)
    .select('slug')
    .single();

  if (error) {
    return { success: false, message: 'Impossible de mettre à jour la publication.' };
  }

  await logAdminAction({
    action: isPublished ? 'property.publish' : 'property.unpublish',
    entityType: 'property',
    entityId: id,
  });
  revalidatePublicPaths(data?.slug);

  return { success: true, message: isPublished ? 'Logement publié.' : 'Logement dépublié.' };
}
