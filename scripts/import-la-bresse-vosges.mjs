import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const root = process.cwd();
const rawEnv = await fs.readFile(path.join(root, '.env.local'), 'utf8');
const env = Object.fromEntries(rawEnv.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith('#') && line.includes('=')).map((line) => {
  const index = line.indexOf('=');
  return [line.slice(0, index), line.slice(index + 1)];
}));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const slug = 'chalet-la-bresse-vosges';
const description = `À La Bresse, dans les Vosges, découvrez ce sublime chalet de 115 m² offrant une belle vue sur la montagne. Il peut accueillir jusqu’à 12 voyageurs.

Le chalet comprend une agréable pièce à vivre avec cheminée, 4 belles chambres, 3 salles de bain avec douche, un sauna et un grand jardin. Il dispose également du Wi-Fi, d’une cuisine entièrement équipée et de tout le nécessaire pour passer un agréable séjour à la montagne.

ACTIVITÉS À PROXIMITÉ
• Ski alpin à La Bresse-Hohneck : environ 15 minutes
• Ski de fond et raquettes à Lispach : environ 15 minutes
• Luge et activités neige : environ 15 minutes
• Lac des Corbeaux : environ 10 à 12 minutes
• Station familiale du Brabant : environ 10 minutes

Le logement bénéficie ainsi d’un emplacement idéal à proximité de La Bresse-Hohneck et de Lispach, avec ski alpin, ski de fond, raquettes, luge, activités pour enfants et randonnées.

TARIFS À LA SEMAINE
• Hors saison : 1 365 €
• Noël et Nouvel An : 1 735 €
• De janvier à mars : 1 876 €
• Forfait ménage en option : 150 € par semaine`;

const { data: property, error: propertyError } = await supabase.from('properties').upsert({
  slug,
  title: 'Chalet avec sauna et vue montagne à La Bresse',
  description,
  property_type: 'chalet',
  address: '13 Vouillée des Brimbelles',
  city: 'La Bresse',
  postal_code: '88250',
  neighborhood: 'Vosges',
  monthly_price: 1365,
  service_charges: 150,
  deposit_amount: 1735,
  viewing_fee: 1876,
  surface_m2: 115,
  bedrooms: 4,
  bathrooms: 3,
  rooms: 6,
  floors_count: 2,
  contract_type: 'Location saisonnière à la semaine',
  interior_type: 'Entièrement meublé',
  maintenance_condition: 'Excellent',
  construction_type: 'Chalet traditionnel',
  has_elevator: false,
  has_balcony: true,
  has_terrace: true,
  has_parking: true,
  has_garage: false,
  has_garden: true,
  is_furnished: true,
  pets_allowed: false,
  minimum_stay_months: 1,
  status: 'available',
  is_published: true,
  is_featured: true,
}, { onConflict: 'slug' }).select('id').single();
if (propertyError) throw new Error(`Import du chalet impossible : ${propertyError.message}`);

const imageNames = [
  'IMG_4293.jpeg', 'IMG_4297.jpeg', 'IMG_4309.jpeg', 'IMG_4305.jpeg',
  'IMG_4308.jpeg', 'IMG_4299.jpeg', 'IMG_4294.jpeg', 'IMG_4298.jpeg',
  'IMG_4306.jpeg', 'IMG_4307.jpeg', 'IMG_4304.jpeg', 'IMG_4290.jpeg',
  'IMG_4300.jpeg', 'IMG_4288.jpeg', 'IMG_4295.jpeg', 'IMG_4292.jpeg',
  'IMG_4296.jpeg', 'IMG_4301.jpeg', 'IMG_4302.jpeg',
];
const sourceDirectory = path.join(root, 'public/properties/la-bresse-vosges');
await supabase.storage.createBucket('property-images', { public: true, fileSizeLimit: 10 * 1024 * 1024, allowedMimeTypes: ['image/jpeg'] });
await supabase.from('property_images').delete().eq('property_id', property.id);

for (const [index, imageName] of imageNames.entries()) {
  const storagePath = `${property.id}/${imageName.toLowerCase()}`;
  const file = await fs.readFile(path.join(sourceDirectory, imageName));
  const { error: uploadError } = await supabase.storage.from('property-images').upload(storagePath, file, { contentType: 'image/jpeg', upsert: true });
  if (uploadError) throw new Error(`Échec de ${imageName} : ${uploadError.message}`);
  const { data: publicUrl } = supabase.storage.from('property-images').getPublicUrl(storagePath);
  const { error: imageError } = await supabase.from('property_images').insert({
    property_id: property.id,
    storage_path: storagePath,
    url: publicUrl.publicUrl,
    alt_text: index === 0 ? 'Chalet avec jardin et vue montagne à La Bresse' : `Chalet à La Bresse dans les Vosges — photo ${index + 1}`,
    is_primary: index === 0,
    sort_order: index,
  });
  if (imageError) throw new Error(`Référencement de ${imageName} impossible : ${imageError.message}`);
}

const { data: amenities } = await supabase.from('amenities').select('id,key').in('key', ['wifi', 'heating', 'equipped_kitchen', 'dishwasher', 'parking', 'balcony', 'garden']);
if (amenities?.length) {
  await supabase.from('property_amenities').delete().eq('property_id', property.id);
  await supabase.from('property_amenities').insert(amenities.map((amenity) => ({ property_id: property.id, amenity_id: amenity.id })));
}

console.log(JSON.stringify({ propertyId: property.id, slug, images: imageNames.length }));
