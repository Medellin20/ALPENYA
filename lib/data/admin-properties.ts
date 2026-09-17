import 'server-only';
import type { Amenity } from '@/types/database';
import { createAdminClient } from '@/lib/supabase/admin';

export async function getAllPropertiesAdmin(params: { search?: string; status?: string; city?: string; propertyType?: string; page?: number } = {}) {
  const supabase = createAdminClient();
  const pageSize = 12;
  const page = Number.isSafeInteger(params.page) && params.page! > 0 ? params.page! : 1;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('properties')
    .select('*, property_images(id, url, is_primary)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,city.ilike.%${params.search}%,slug.ilike.%${params.search}%`);
  }
  if (params.status) {
    query = query.eq('status', params.status);
  }
  if (params.city) {
    query = query.eq('city', params.city);
  }
  if (params.propertyType) {
    query = query.eq('property_type', params.propertyType);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) {
    console.error('getAllPropertiesAdmin error:', error.message);
    return { properties: [], total: 0, page, pageSize, error: 'Impossible de charger les logements. Vérifiez la connexion à la base de données puis réessayez.' };
  }
  return { properties: data ?? [], total: count ?? 0, page, pageSize };
}

export async function getPropertyByIdAdmin(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('properties')
    .select('*, property_images(*), property_amenities(amenity_id)')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function getAllAmenities(): Promise<{ amenities: Amenity[]; error: string | null }> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('amenities').select('*').order('label_fr');
    if (error) {
      console.error('getAllAmenities error:', error.code);
      return {
        amenities: [],
        error: error.code === 'PGRST205'
          ? 'Le catalogue des équipements est introuvable dans la base configurée. Vérifiez le projet Supabase et initialisez ses tables avant d’ajouter un bien.'
          : 'Impossible de charger les équipements. Vérifiez la connexion et les accès à la base de données, puis réessayez.',
      };
    }
    return { amenities: data ?? [], error: null };
  } catch {
    return {
      amenities: [],
      error: 'La connexion à la base de données est indisponible. Vérifiez la configuration Supabase du site, puis réessayez.',
    };
  }
}
