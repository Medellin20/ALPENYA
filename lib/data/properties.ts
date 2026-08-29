import { createClient } from '@/lib/supabase/server';
import type { Amenity, Property, PropertyImage, PropertyWithRelations } from '@/types/database';
import type { PropertyFilters } from '@/types';
import { LA_CLUSAZ_PREVIEW } from '@/lib/data/la-clusaz-preview';

const PAGE_SIZE = 9;

function mapRelations(row: any): PropertyWithRelations {
  const images: PropertyImage[] = (row.property_images ?? []).sort(
    (a: PropertyImage, b: PropertyImage) => a.sort_order - b.sort_order
  );
  const amenities: Amenity[] = (row.property_amenities ?? [])
    .map((pa: any) => pa.amenities)
    .filter(Boolean);

  return { ...row, property_images: images, amenities };
}

/** Liste paginée + filtrée des biens PUBLIÉS pour le catalogue public. */
export async function getPublishedProperties(filters: PropertyFilters = {}) {
  const supabase = createClient();
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('properties')
    .select(
      `*, property_images(*), property_amenities(amenities(*))`,
      { count: 'exact' }
    )
    .eq('is_published', true)
    .neq('status', 'draft');

  // La ville reste le premier critère de classement, y compris entre deux pages.
  query = query.order('city', { ascending: true });

  if (filters.city) query = query.eq('city', filters.city);
  if (filters.minPrice) query = query.gte('monthly_price', filters.minPrice);
  if (filters.maxPrice) query = query.lte('monthly_price', filters.maxPrice);
  if (filters.bedrooms) query = query.gte('bedrooms', filters.bedrooms);
  if (filters.propertyType) query = query.eq('property_type', filters.propertyType);
  if (filters.furnished === 'yes') query = query.eq('is_furnished', true);
  if (filters.furnished === 'no') query = query.eq('is_furnished', false);

  switch (filters.sort) {
    case 'price_asc':
      query = query.order('monthly_price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('monthly_price', { ascending: false });
      break;
    case 'surface':
      query = query.order('surface_m2', { ascending: false });
      break;
    case 'recent':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error('getPublishedProperties error:', error.message);
    const matches = (!filters.city || filters.city === LA_CLUSAZ_PREVIEW.city)
      && (!filters.propertyType || filters.propertyType === 'chalet')
      && (!filters.minPrice || LA_CLUSAZ_PREVIEW.monthly_price >= filters.minPrice)
      && (!filters.maxPrice || LA_CLUSAZ_PREVIEW.monthly_price <= filters.maxPrice)
      && (!filters.bedrooms || LA_CLUSAZ_PREVIEW.bedrooms >= filters.bedrooms);
    return { properties: matches ? [LA_CLUSAZ_PREVIEW] : [], total: matches ? 1 : 0, page, pageSize: PAGE_SIZE };
  }

  return {
    properties: (data ?? []).map(mapRelations),
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  };
}

/** Détail d'un bien publié par son slug (page /appartements/[slug]). */
export async function getPropertyBySlug(slug: string): Promise<PropertyWithRelations | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('properties')
    .select(`*, property_images(*), property_amenities(amenities(*))`)
    .eq('slug', slug)
    .eq('is_published', true)
    .neq('status', 'draft')
    .maybeSingle();

  if (error || !data) return slug === LA_CLUSAZ_PREVIEW.slug ? LA_CLUSAZ_PREVIEW : null;
  return mapRelations(data);
}

/** Biens similaires : même ville, statut disponible, en excluant le bien courant. */
export async function getSimilarProperties(property: Property, limit = 3) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('properties')
    .select(`*, property_images(*), property_amenities(amenities(*))`)
    .eq('is_published', true)
    .eq('city', property.city)
    .neq('id', property.id)
    .neq('status', 'draft')
    .limit(limit);

  if (error) return [];
  return (data ?? []).map(mapRelations);
}

/** Liste des villes disponibles avec biens publiés (pour les filtres). */
export async function getAvailableCities(): Promise<string[]> {
  const supabase = createClient();
  let query = supabase
    .from('properties')
    .select('city')
    .eq('is_published', true)
    .neq('status', 'draft');

  const { data, error } = await query;

  if (error || !data) return [LA_CLUSAZ_PREVIEW.city];
  return Array.from(new Set(data.map((r) => r.city))).sort();
}

/** Destinations ayant au moins un chalet ou une villa publié, avec leur nombre d'annonces. */
export async function getAvailableCityCounts(): Promise<{ city: string; count: number }[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('properties')
    .select('city')
    .eq('is_published', true)
    .neq('status', 'draft');

  if (error || !data) return [{ city: LA_CLUSAZ_PREVIEW.city, count: 1 }];
  const counts = new Map<string, number>();
  for (const row of data) counts.set(row.city, (counts.get(row.city) ?? 0) + 1);
  return Array.from(counts, ([city, count]) => ({ city, count }))
    .sort((a, b) => a.city.localeCompare(b.city, 'fr'));
}

export interface CityPropertySummary {
  city: string;
  count: number;
  averagePrice: number;
  imageUrl: string | null;
}

/** Données de la liste des villes affichée sur la page d'accueil. */
export async function getCityPropertySummaries(): Promise<CityPropertySummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('properties')
    .select('city, monthly_price, property_images(url, is_primary, sort_order)')
    .eq('is_published', true)
    .neq('status', 'draft')
    .order('city', { ascending: true });

  if (error || !data) return [{
    city: LA_CLUSAZ_PREVIEW.city,
    count: 1,
    averagePrice: LA_CLUSAZ_PREVIEW.monthly_price,
    imageUrl: LA_CLUSAZ_PREVIEW.property_images[0].url,
  }];

  const summaries = new Map<string, { count: number; total: number; imageUrl: string | null }>();
  for (const property of data as any[]) {
    const current = summaries.get(property.city) ?? { count: 0, total: 0, imageUrl: null };
    const images = [...(property.property_images ?? [])].sort(
      (a: any, b: any) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order
    );
    summaries.set(property.city, {
      count: current.count + 1,
      total: current.total + Number(property.monthly_price),
      imageUrl: current.imageUrl ?? images[0]?.url ?? null,
    });
  }

  return Array.from(summaries, ([city, summary]) => ({
    city,
    count: summary.count,
    averagePrice: Math.round(summary.total / summary.count),
    imageUrl: summary.imageUrl,
  })).sort((a, b) => a.city.localeCompare(b.city, 'fr'));
}

/** Biens mis en avant pour la page d'accueil. */
export async function getFeaturedProperties(limit = 6) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('properties')
    .select(`*, property_images(*), property_amenities(amenities(*))`)
    .eq('is_published', true)
    .neq('status', 'draft')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [LA_CLUSAZ_PREVIEW].slice(0, limit);
  return (data ?? []).map(mapRelations);
}

/** Tous les slugs publiés — utilisé par sitemap.ts. */
export async function getAllPublishedSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('properties')
    .select('slug, updated_at')
    .eq('is_published', true)
    .neq('status', 'draft');

  if (error || !data) return [{ slug: LA_CLUSAZ_PREVIEW.slug, updated_at: LA_CLUSAZ_PREVIEW.updated_at }];
  return data;
}
