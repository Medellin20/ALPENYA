'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/data/history';
import type { ActionResult } from '@/types';
import type { PropertyImage } from '@/types/database';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo

/**
 * Téléverse une ou plusieurs images vers le bucket Supabase Storage
 * `property-images` et crée les lignes `property_images` correspondantes.
 * La première image uploadée devient automatiquement l'image principale
 * si le logement n'en a pas encore.
 */
export async function uploadPropertyImages(propertyId: string, formData: FormData): Promise<ActionResult<PropertyImage[]>> {
  const supabase = createAdminClient();
  const files = formData.getAll('images') as File[];

  if (!files || files.length === 0) {
    return { success: false, message: 'Aucune image sélectionnée.' };
  }

  const { data: property } = await supabase.from('properties').select('slug').eq('id', propertyId).maybeSingle();
  if (!property) {
    return { success: false, message: 'Logement introuvable.' };
  }

  const { count: existingCount } = await supabase
    .from('property_images')
    .select('*', { count: 'exact', head: true })
    .eq('property_id', propertyId);

  const { data: maxOrderRow } = await supabase
    .from('property_images')
    .select('sort_order')
    .eq('property_id', propertyId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextOrder = (maxOrderRow?.sort_order ?? -1) + 1;
  const uploaded: PropertyImage[] = [];

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;

    if (!ALLOWED_TYPES.includes(file.type)) {
      continue; // type non supporté, on ignore silencieusement ce fichier
    }
    if (file.size > MAX_SIZE) {
      continue; // fichier trop volumineux
    }

    const extension = file.name.split('.').pop() || 'jpg';
    const path = `${propertyId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) continue;

    const { data: publicUrlData } = supabase.storage.from('property-images').getPublicUrl(path);

    const { data: imageRow, error: insertError } = await supabase
      .from('property_images')
      .insert({
        property_id: propertyId,
        storage_path: path,
        url: publicUrlData.publicUrl,
        is_primary: existingCount === 0 && uploaded.length === 0,
        sort_order: nextOrder,
      })
      .select('*')
      .single();

    if (!insertError && imageRow) {
      uploaded.push(imageRow);
      nextOrder += 1;
    }
  }

  if (uploaded.length === 0) {
    return { success: false, message: 'Aucune image n’a pu être téléversée (format ou taille non supportés).' };
  }

  await logAdminAction({
    action: 'property.images_upload',
    entityType: 'property',
    entityId: propertyId,
    details: { count: uploaded.length },
  });

  revalidatePath(`/admin/appartements/${propertyId}`);
  revalidatePath(`/appartements/${property.slug}`);
  revalidatePath('/appartements');

  return { success: true, message: `${uploaded.length} image(s) ajoutée(s).`, data: uploaded };
}

export async function deletePropertyImage(imageId: string): Promise<ActionResult> {
  const supabase = createAdminClient();

  const { data: image } = await supabase
    .from('property_images')
    .select('*, properties(slug)')
    .eq('id', imageId)
    .maybeSingle();

  if (!image) {
    return { success: false, message: 'Image introuvable.' };
  }

  const { error: deleteError } = await supabase.from('property_images').delete().eq('id', imageId);
  if (deleteError) {
    return { success: false, message: 'Impossible de supprimer la photo de la base de données.' };
  }

  // La ligne est supprimée en premier : une panne Storage ne laisse ainsi
  // jamais une photo cassée visible sur le site.
  const { error: storageError } = await supabase.storage.from('property-images').remove([image.storage_path]);

  // Si l'image supprimée était la principale, promouvoir la suivante.
  if (image.is_primary) {
    const { data: nextImage } = await supabase
      .from('property_images')
      .select('id')
      .eq('property_id', image.property_id)
      .order('sort_order', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextImage) {
      const { error: primaryError } = await supabase
        .from('property_images')
        .update({ is_primary: true })
        .eq('id', nextImage.id);

      if (primaryError) {
        console.error('Promotion de l’image principale impossible:', primaryError.message);
      }
    }
  }

  revalidatePath(`/admin/appartements/${image.property_id}`);
  const slug = (image as any).properties?.slug;
  if (slug) revalidatePath(`/appartements/${slug}`);
  revalidatePath('/appartements');

  if (storageError) {
    console.error('Nettoyage Storage impossible:', storageError.message);
    return {
      success: true,
      message: 'Photo retirée du logement. Le fichier résiduel devra être nettoyé dans Supabase Storage.',
    };
  }

  return { success: true, message: 'Photo supprimée.' };
}

export async function setPrimaryPropertyImage(propertyId: string, imageId: string): Promise<ActionResult> {
  const supabase = createAdminClient();

  const { error } = await supabase.from('property_images').update({ is_primary: true }).eq('id', imageId);
  if (error) {
    return { success: false, message: 'Impossible de définir l’image principale.' };
  }

  const { data: property } = await supabase.from('properties').select('slug').eq('id', propertyId).maybeSingle();

  revalidatePath(`/admin/appartements/${propertyId}`);
  if (property?.slug) revalidatePath(`/appartements/${property.slug}`);

  return { success: true, message: 'Image principale mise à jour.' };
}

export async function reorderPropertyImages(propertyId: string, orderedImageIds: string[]): Promise<ActionResult> {
  const supabase = createAdminClient();

  await Promise.all(
    orderedImageIds.map((id, index) =>
      supabase.from('property_images').update({ sort_order: index }).eq('id', id)
    )
  );

  revalidatePath(`/admin/appartements/${propertyId}`);
  return { success: true, message: 'Ordre des photos mis à jour.' };
}
