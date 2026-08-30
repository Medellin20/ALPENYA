import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const root = process.cwd();
const envText = await fs.readFile(path.join(root, '.env.local'), 'utf8');
const env = Object.fromEntries(envText.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith('#') && line.includes('=')).map((line) => {
  const separator = line.indexOf('=');
  return [line.slice(0, separator), line.slice(separator + 1)];
}));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const slug = 'appartement-centre-grand-bornand';
const description = `# Appartement haut de gamme au Grand-Bornand – Vue sur les Aravis

Situé au **deuxième étage avec ascenseur**, en plein cœur du village du **Grand-Bornand en Haute-Savoie**, cet appartement haut de gamme bénéficie d’un emplacement privilégié et d’une **vue exceptionnelle sur la chaîne des Aravis**.

Confortable, fonctionnel et entièrement équipé, il peut accueillir **jusqu’à 10 voyageurs** et constitue une excellente adresse pour un séjour à la montagne en famille ou entre amis.

## Le logement

L’appartement dispose de **3 chambres**, réparties comme suit :

- **2 chambres avec lit double** ;
- **1 chambre équipée de 2 lits superposés**.

Pensé pour offrir confort et praticité tout au long du séjour, le logement met également à disposition :

- une connexion **Wi-Fi** ;
- une **cuisine entièrement équipée** ;
- les **draps et serviettes** ;
- le **linge de maison** ;
- un **ascenseur** facilitant l’accès à l’appartement.

## Une vue exceptionnelle sur les Aravis

Depuis l’appartement, profitez d’une **magnifique vue dégagée sur la chaîne des Aravis**, véritable décor naturel emblématique du Grand-Bornand.

Son emplacement au cœur du village permet également de profiter facilement de l’ambiance de la station et de ses différents services.

## Accès rapide au domaine skiable

L’appartement bénéficie d’une situation idéale pour les amateurs de sports d’hiver :

- **Télécabine :** environ 5 minutes à pied ;
- **Accès direct au domaine skiable du Grand-Bornand** ;
- **Navette gratuite** permettant également de rejoindre facilement les remontées mécaniques.

Vous pouvez ainsi rejoindre les pistes rapidement tout en profitant du confort d’un logement situé au centre du village.

## Un séjour au cœur du Grand-Bornand

Grâce à son emplacement central, ses équipements et sa proximité avec les remontées mécaniques, cet appartement est parfaitement adapté à un **séjour en famille ou entre amis**.

Une adresse idéale pour profiter pleinement du **Grand-Bornand**, entre **ski, montagne, confort et panorama exceptionnel sur les Aravis**.`;

const { data: property, error: propertyError } = await supabase.from('properties').upsert({
  slug,
  title: 'Appartement haut standing au Grand-Bornand',
  description,
  // Le schéma de production limite actuellement ce champ à chalet/villa.
  property_type: 'chalet',
  address: 'Centre du village',
  city: 'Le Grand-Bornand',
  postal_code: '74450',
  neighborhood: 'Centre du village',
  monthly_price: 1350,
  service_charges: 150,
  deposit_amount: 1670,
  viewing_fee: 1876,
  surface_m2: 0,
  bedrooms: 3,
  bathrooms: 2,
  rooms: 4,
  floor: 2,
  contract_type: 'Location saisonnière à la semaine',
  interior_type: 'Entièrement meublé',
  maintenance_condition: 'Excellent',
  has_elevator: true,
  has_balcony: true,
  has_terrace: false,
  has_parking: false,
  has_garage: false,
  has_garden: false,
  is_furnished: true,
  minimum_stay_months: 1,
  status: 'available',
  is_published: true,
  is_featured: true,
}, { onConflict: 'slug' }).select('id').single();

if (propertyError) throw new Error(`Import de l’appartement impossible : ${propertyError.message}`);

const imageNames = [
  'IMG_4225.jpeg', 'IMG_4228.jpeg', 'IMG_4231.jpeg', 'IMG_4239.jpeg',
  'IMG_4227.jpeg', 'IMG_4229.jpeg', 'IMG_4232.jpeg', 'IMG_4236.jpeg',
  'IMG_4230.jpeg', 'IMG_4233.jpeg', 'IMG_4234.jpeg', 'IMG_4235.jpeg',
  'IMG_4241.jpeg', 'IMG_4226.jpeg', 'IMG_4237.jpeg', 'IMG_4242.jpeg',
];
const sourceDirectory = path.join(root, 'public/properties/grand-bornand');
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
    alt_text: index === 0 ? 'Séjour avec vue sur les Aravis au Grand-Bornand' : `Appartement au Grand-Bornand — photo ${index + 1}`,
    is_primary: index === 0,
    sort_order: index,
  });
  if (imageError) throw new Error(`Référencement de ${imageName} impossible : ${imageError.message}`);
}

const { data: amenities } = await supabase.from('amenities').select('id,key').in('key', ['wifi', 'heating', 'equipped_kitchen', 'dishwasher', 'balcony', 'elevator']);
if (amenities?.length) {
  await supabase.from('property_amenities').delete().eq('property_id', property.id);
  await supabase.from('property_amenities').insert(amenities.map((amenity) => ({ property_id: property.id, amenity_id: amenity.id })));
}

console.log(JSON.stringify({ propertyId: property.id, slug, images: imageNames.length }));
