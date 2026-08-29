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

const slug = 'chalet-megeve-mont-d-arbois';
const description = `Magnifique chalet entièrement rénové avec goût, situé au Mont d’Arbois à Megève.

Le logement dispose d’une cuisine entièrement équipée, de 4 chambres avec lit double et salle de bain privative, ainsi que d’une spacieuse chambre dortoir avec 2 lits doubles. Il peut accueillir jusqu’à 14 voyageurs. Une buanderie avec lave-linge et sèche-linge, un sauna, un ski-room, une terrasse, un magnifique jardin et un parking pour 2 véhicules complètent les prestations.

L’arrêt du ski-bus se trouve à proximité immédiate. Le chalet est situé à 2 minutes du Four Seasons, à 3 minutes des remontées mécaniques du Mont d’Arbois et à 6 minutes du centre de Megève. Les remontées sont accessibles à pied à environ 1 km ; une navette gratuite dessert également directement le Mont d’Arbois.

TARIFS À LA SEMAINE
• Hors saison : 2 156 €
• Noël et Nouvel An : 2 478 €
• De janvier à mars : 2 876 €
• Forfait ménage en option : 200 € par semaine

Surface non communiquée.`;

const { data: property, error: propertyError } = await supabase.from('properties').upsert({
  slug,
  title: 'Chalet rénové au Mont d’Arbois à Megève',
  description,
  property_type: 'chalet',
  address: '21 chemin des Marestots',
  city: 'Megève',
  postal_code: '74120',
  neighborhood: 'Mont d’Arbois',
  monthly_price: 2156,
  service_charges: 200,
  deposit_amount: 2478,
  viewing_fee: 2876,
  surface_m2: 0,
  bedrooms: 5,
  bathrooms: 4,
  rooms: 7,
  floors_count: 3,
  contract_type: 'Location saisonnière à la semaine',
  interior_type: 'Entièrement meublé',
  maintenance_condition: 'Entièrement rénové',
  construction_type: 'Chalet traditionnel rénové',
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
  'IMG_4259.jpeg', 'IMG_4246.jpeg', 'IMG_4247.jpeg', 'IMG_4255.jpeg', 'IMG_4278.jpeg',
  'IMG_4244.jpeg', 'IMG_4250.jpeg', 'IMG_4286.jpeg', 'IMG_4258.jpeg', 'IMG_4260.jpeg',
  'IMG_4265.jpeg', 'IMG_4270.jpeg', 'IMG_4272.jpeg', 'IMG_4253.jpeg', 'IMG_4267.jpeg',
  'IMG_4256.jpeg', 'IMG_4263.jpeg', 'IMG_4266.jpeg', 'IMG_4273.jpeg', 'IMG_4252.jpeg',
  'IMG_4275.jpeg', 'IMG_4248.jpeg', 'IMG_4251.jpeg', 'IMG_4261.jpeg', 'IMG_4262.jpeg',
  'IMG_4271.jpeg', 'IMG_4274.jpeg', 'IMG_4279.jpeg', 'IMG_4284.jpeg', 'IMG_4285.jpeg',
  'IMG_4282.jpeg', 'IMG_4283.jpeg', 'IMG_4257.jpeg', 'IMG_4264.jpeg', 'IMG_4268.jpeg',
  'IMG_4280.jpeg', 'IMG_4281.jpeg',
];
const sourceDirectory = path.join(root, 'public/properties/megeve-mont-arbois');
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
    alt_text: index === 0 ? 'Chalet rénové sous la neige au Mont d’Arbois à Megève' : `Chalet au Mont d’Arbois à Megève — photo ${index + 1}`,
    is_primary: index === 0,
    sort_order: index,
  });
  if (imageError) throw new Error(`Référencement de ${imageName} impossible : ${imageError.message}`);
}

const { data: amenities } = await supabase.from('amenities').select('id,key').in('key', ['wifi', 'heating', 'equipped_kitchen', 'washing_machine', 'dishwasher', 'parking', 'balcony', 'garden']);
if (amenities?.length) {
  await supabase.from('property_amenities').delete().eq('property_id', property.id);
  await supabase.from('property_amenities').insert(amenities.map((amenity) => ({ property_id: property.id, amenity_id: amenity.id })));
}

console.log(JSON.stringify({ propertyId: property.id, slug, images: imageNames.length }));
