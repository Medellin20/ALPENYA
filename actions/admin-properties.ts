'use server';

import { PROPERTY_AMENITY_FIELDS } from '@/lib/utils/property-amenities';
import { revalidatePath } from 'next/cache';
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
    status: data.isPublished && data.status === 'draft' ? 'available' as const : data.status,
    is_published: data.isPublished,
    is_featured: data.isFeatured,
  };
}

async function syncAmenities(propertyId: string, input: PropertyInput): Promise<boolean> {
  const supabase = createAdminClient();
  const { data: catalog, error: catalogError } = await supabase.from('amenities').select('id,key');
  if (catalogError || !catalog) return false;
  const selected = new Set(input.amenityIds);
  if (input.amenityIds.some(id => !catalog.some(amenity => amenity.id === id))) return false;
  for (const amenity of catalog) {
    const feature = PROPERTY_AMENITY_FIELDS.find(item => item.key === amenity.key);
    if (feature) {
      if (input[feature.field]) selected.add(amenity.id);
      else selected.delete(amenity.id);
    }
  }
  const ids = [...selected];
  // Ajouter d’abord : un échec ne doit pas effacer les équipements existants.
  if (ids.length > 0) {
    const { error } = await supabase.from('property_amenities').upsert(
      ids.map(amenityId => ({ property_id: propertyId, amenity_id: amenityId })),
      { onConflict: 'property_id,amenity_id' }
    );
    if (error) return false;
  }
  let removal = supabase.from('property_amenities').delete().eq('property_id', propertyId);
  if (ids.length > 0) removal = removal.not('amenity_id', 'in', `(${ids.join(',')})`);
  const { error } = await removal;
  return !error;
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

  const { data: existingSlug, error: slugError } = await supabase
    .from('properties')
    .select('id')
    .eq('slug', parsed.data.slug)
    .maybeSingle();

  if (slugError) {
    return { success: false, message: 'Impossible de vérifier le logement. Vérifiez que la base est configurée et accessible, puis réessayez.' };
  }

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

  if (error?.code === '23505') {
    return { success: false, message: 'Ce slug est déjà utilisé par un autre logement.', fieldErrors: { slug: ['Ce slug est déjà utilisé.'] } };
  }

  if (error || !property) {
    return { success: false, message: 'Une erreur est survenue lors de la création du logement.' };
  }

  const amenitiesSaved = await syncAmenities(property.id, parsed.data);
  await logAdminAction({ action: 'property.create', entityType: 'property', entityId: property.id });
  revalidatePublicPaths(parsed.data.slug);

  return { success: amenitiesSaved, message: amenitiesSaved ? 'Bien ajouté avec succès.' : 'Bien créé, mais les équipements n’ont pas tous été enregistrés. Vérifiez-les sur la fiche et réessayez.', data: { id: property.id } };
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

  const { data: existingSlug, error: slugError } = await supabase
    .from('properties')
    .select('id')
    .eq('slug', parsed.data.slug)
    .neq('id', id)
    .maybeSingle();

  if (slugError) {
    return { success: false, message: 'Impossible de vérifier le logement. Vérifiez que la base est configurée et accessible, puis réessayez.' };
  }

  if (existingSlug) {
    return {
      success: false,
      message: 'Ce slug est déjà utilisé par un autre logement.',
      fieldErrors: { slug: ['Ce slug est déjà utilisé.'] },
    };
  }

  const { data: updated, error } = await supabase.from('properties').update(toDbPayload(parsed.data)).eq('id', id).select('id').single();

  if (error || !updated) {
    return { success: false, message: 'Impossible de modifier ce logement. Vérifiez qu’il existe encore et que la base est accessible.' };
  }

  const amenitiesSaved = await syncAmenities(id, parsed.data);
  await logAdminAction({ action: 'property.update', entityType: 'property', entityId: id });
  revalidatePublicPaths(parsed.data.slug);

  return { success: amenitiesSaved, message: amenitiesSaved ? 'Bien mis à jour avec succès.' : 'Le logement a été modifié, mais les équipements n’ont pas tous été enregistrés. Vérifiez-les et réessayez.' };
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  const supabase = createAdminClient();

  const { data: images, error: imageError } = await supabase.from('property_images').select('storage_path').eq('property_id', id);
  if (imageError) return { success: false, message: 'Impossible de charger les photos. Le logement n’a pas été supprimé.' };

  const { data: deleted, error } = await supabase.from('properties').delete().eq('id', id).select('slug').single();
  if (error || !deleted) {
    return { success: false, message: 'Impossible de supprimer ce logement. Vérifiez qu’il existe encore et qu’aucun dossier ne bloque sa suppression.' };
  }

  // Ne supprimer les fichiers qu’après la suppression effective du logement.
  let cleanupFailed = false;
  if (images && images.length > 0) {
    try {
      const { error: storageError } = await supabase.storage.from('property-images').remove(images.map((i) => i.storage_path));
      cleanupFailed = !!storageError;
    } catch {
      cleanupFailed = true;
    }
  }

  await logAdminAction({ action: 'property.delete', entityType: 'property', entityId: id });
  revalidatePublicPaths(deleted.slug);

  return { success: true, message: cleanupFailed ? 'Bien supprimé. Certains fichiers photo n’ont pas pu être supprimés du stockage.' : 'Bien supprimé.' };
}

export async function updatePropertyStatus(id: string, status: PropertyStatus): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('properties').update({ status, ...(status === 'draft' ? { is_published: false } : {}) }).eq('id', id).select('slug').single();

  if (error) {
    return { success: false, message: 'Impossible de mettre à jour le statut.' };
  }

  await logAdminAction({ action: 'property.status_change', entityType: 'property', entityId: id, details: { status } });
  revalidatePublicPaths(data?.slug);

  return { success: true, message: 'Statut mis à jour.' };
}

export async function togglePropertyPublish(id: string, isPublished: boolean): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { data: property, error: readError } = await supabase.from('properties').select('status').eq('id', id).single();
  if (readError || !property) {
    return { success: false, message: 'Impossible de charger ce logement. Vérifiez la connexion à la base.' };
  }

  const { data, error } = await supabase
    .from('properties')
    .update({ is_published: isPublished, ...(isPublished && property.status === 'draft' ? { status: 'available' as const } : {}) })
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
