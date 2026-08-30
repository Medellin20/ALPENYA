import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const projectRoot = process.cwd();
const envText = await fs.readFile(path.join(projectRoot, '.env.local'), 'utf8');
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const separator = line.indexOf('=');
      return [line.slice(0, separator), line.slice(separator + 1)];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const slug = 'chalet-la-clusaz-haute-savoie';
const description = `Ce sublime chalet de 155 m², situé dans le quartier calme du Gotty à La Clusaz, accueille confortablement jusqu’à 14 voyageurs, avec 2 couchages supplémentaires possibles.

Il comprend 5 chambres : 4 chambres avec lit double et 1 chambre avec 4 lits individuels. Les 5 salles de bain privatives offrent confort et intimité à tous les voyageurs. Le chalet dispose également du Wi-Fi, d’un sauna, d’une cheminée, d’un garage pour 2 véhicules et d’un spacieux jardin. Les draps et le linge de maison sont fournis.

Situation privilégiée pour les séjours au ski : la piste la plus proche se trouve à environ 350 mètres et l’arrêt du ski-bus à 100 mètres. La télécabine de Beauregard, qui dessert directement le secteur de Beauregard jusqu’à 1 640 mètres d’altitude, est la remontée à privilégier. Le village de La Clusaz, son marché, ses commerces et ses restaurants se trouvent à environ 1,5 km.

TARIFS À LA SEMAINE
• Hors saison : 1 806 €
• Noël et Nouvel An : 2 156 €
• De janvier à mars : 2 338 €
• Forfait ménage en option : 150 € par semaine

Ce chalet est idéal pour un séjour paisible à la montagne, en famille ou entre amis.`;

const propertyPayload = {
  slug,
  title: 'Chalet d’exception à La Clusaz',
  description,
  property_type: 'chalet',
  address: '630 route des Fiaux',
  city: 'La Clusaz',
  postal_code: '74220',
  neighborhood: 'Quartier du Gotty',
  monthly_price: 1806,
  service_charges: 150,
  deposit_amount: 2156,
  viewing_fee: 2338,
  surface_m2: 155,
  bedrooms: 5,
  bathrooms: 5,
  rooms: 7,
  contract_type: 'Location saisonnière à la semaine',
  interior_type: 'Entièrement meublé',
  maintenance_condition: 'Excellent',
  has_elevator: false,
  has_balcony: true,
  has_terrace: true,
  has_parking: true,
  has_garage: true,
  has_garden: true,
  is_furnished: true,
  minimum_stay_months: 1,
  status: 'available',
  is_published: true,
  is_featured: true,
};

const { data: property, error: propertyError } = await supabase
  .from('properties')
  .upsert(propertyPayload, { onConflict: 'slug' })
  .select('id')
  .single();

if (propertyError) throw new Error(`Import du chalet impossible : ${propertyError.message}`);

const imageNames = [
  'IMG_4208.jpeg', 'IMG_4217.jpeg', 'IMG_4213.jpeg', 'IMG_4212.jpeg', 'IMG_4194.jpeg',
  'IMG_4202.jpeg', 'IMG_4221.jpeg', 'IMG_4200.jpeg', 'IMG_4205.jpeg', 'IMG_4214.jpeg',
  'IMG_4203.jpeg', 'IMG_4215.jpeg', 'IMG_4223.jpeg', 'IMG_4197.jpeg', 'IMG_4216.jpeg',
  'IMG_4201.jpeg', 'IMG_4209.jpeg', 'IMG_4204.jpeg', 'IMG_4220.jpeg', 'IMG_4193.jpeg',
  'IMG_4207.jpeg', 'IMG_4196.jpeg', 'IMG_4198.jpeg', 'IMG_4195.jpeg', 'IMG_4199.jpeg',
  'IMG_4206.jpeg', 'IMG_4211.jpeg', 'IMG_4218.jpeg', 'IMG_4210.jpeg',
];

const sourceDirectory = '/home/mendellin/Téléchargements/infoschaletlaclusaz';
await supabase.storage.createBucket('property-images', {
  public: true,
  fileSizeLimit: 10 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg'],
});

await supabase.from('property_images').delete().eq('property_id', property.id);

for (const [index, imageName] of imageNames.entries()) {
  const sourcePath = path.join(sourceDirectory, imageName);
  const storagePath = `${property.id}/${imageName.toLowerCase()}`;
  const file = await fs.readFile(sourcePath);
  const { error: uploadError } = await supabase.storage
    .from('property-images')
    .upload(storagePath, file, { contentType: 'image/jpeg', upsert: true });
  if (uploadError) throw new Error(`Échec de ${imageName} : ${uploadError.message}`);

  const { data: publicUrl } = supabase.storage.from('property-images').getPublicUrl(storagePath);
  const { error: imageError } = await supabase.from('property_images').insert({
    property_id: property.id,
    storage_path: storagePath,
    url: publicUrl.publicUrl,
    alt_text: index === 0
      ? 'Chalet à La Clusaz sous la neige'
      : `Chalet à La Clusaz — photo ${index + 1}`,
    is_primary: index === 0,
    sort_order: index,
  });
  if (imageError) throw new Error(`Référencement de ${imageName} impossible : ${imageError.message}`);
}

const { data: amenities } = await supabase
  .from('amenities')
  .select('id,key')
  .in('key', ['wifi', 'heating', 'equipped_kitchen', 'dishwasher', 'parking', 'balcony', 'garden']);

if (amenities?.length) {
  await supabase.from('property_amenities').delete().eq('property_id', property.id);
  await supabase.from('property_amenities').insert(
    amenities.map((amenity) => ({ property_id: property.id, amenity_id: amenity.id }))
  );
}

console.log(JSON.stringify({ propertyId: property.id, slug, images: imageNames.length }));
