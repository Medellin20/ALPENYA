import type { PropertyWithRelations } from '@/types/database';

const imageNames = [
  'IMG_4208.jpeg', 'IMG_4217.jpeg', 'IMG_4213.jpeg', 'IMG_4212.jpeg', 'IMG_4194.jpeg',
  'IMG_4202.jpeg', 'IMG_4221.jpeg', 'IMG_4200.jpeg', 'IMG_4205.jpeg', 'IMG_4214.jpeg',
  'IMG_4203.jpeg', 'IMG_4215.jpeg', 'IMG_4223.jpeg', 'IMG_4197.jpeg', 'IMG_4216.jpeg',
  'IMG_4201.jpeg', 'IMG_4209.jpeg', 'IMG_4204.jpeg', 'IMG_4220.jpeg', 'IMG_4193.jpeg',
  'IMG_4207.jpeg', 'IMG_4196.jpeg', 'IMG_4198.jpeg', 'IMG_4195.jpeg', 'IMG_4199.jpeg',
  'IMG_4206.jpeg', 'IMG_4211.jpeg', 'IMG_4218.jpeg', 'IMG_4210.jpeg',
];

export const LA_CLUSAZ_PREVIEW: PropertyWithRelations = {
  id: '11111111-1111-4111-8111-111111111111',
  slug: 'chalet-la-clusaz-haute-savoie',
  title: 'Chalet d’exception à La Clusaz',
  description: `Ce sublime chalet de 155 m², situé dans le quartier calme du Gotty à La Clusaz, accueille confortablement jusqu’à 14 voyageurs, avec 2 couchages supplémentaires possibles.

Il comprend 5 chambres : 4 chambres avec lit double et 1 chambre avec 4 lits individuels. Les 5 salles de bain privatives offrent confort et intimité à tous les voyageurs. Le chalet dispose également du Wi-Fi, d’un sauna, d’une cheminée, d’un garage pour 2 véhicules et d’un spacieux jardin. Les draps et le linge de maison sont fournis.

Situation privilégiée pour les séjours au ski : la piste la plus proche se trouve à environ 350 mètres et l’arrêt du ski-bus à 100 mètres. La télécabine de Beauregard dessert directement le secteur de Beauregard jusqu’à 1 640 mètres d’altitude. Le village, son marché, ses commerces et ses restaurants se trouvent à environ 1,5 km.

TARIFS À LA SEMAINE
• Hors saison : 1 806 €
• Noël et Nouvel An : 2 156 €
• De janvier à mars : 2 338 €
• Forfait ménage en option : 150 € par semaine

Ce chalet est idéal pour un séjour paisible à la montagne, en famille ou entre amis.`,
  property_type: 'chalet',
  address: '630 route des Fiaux',
  city: 'La Clusaz',
  postal_code: '74220',
  neighborhood: 'Quartier du Gotty',
  latitude: null,
  longitude: null,
  monthly_price: 1806,
  service_charges: 150,
  deposit_amount: 0,
  viewing_fee: 0,
  surface_m2: 155,
  bedrooms: 5,
  bathrooms: 5,
  rooms: 7,
  floor: null,
  floors_count: 2,
  volume_m3: null,
  contract_type: 'Location saisonnière à la semaine',
  interior_type: 'Entièrement meublé',
  maintenance_condition: 'Excellent',
  construction_type: 'Chalet traditionnel rénové',
  construction_year: null,
  energy_label: null,
  has_elevator: false,
  has_balcony: true,
  has_terrace: true,
  has_parking: true,
  has_garage: true,
  has_garden: true,
  is_furnished: true,
  pets_allowed: false,
  available_from: null,
  minimum_stay_months: 1,
  status: 'available',
  is_published: true,
  is_featured: true,
  view_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  property_images: imageNames.map((name, index) => ({
    id: `22222222-2222-4222-8222-${String(index).padStart(12, '0')}`,
    property_id: '11111111-1111-4111-8111-111111111111',
    storage_path: `preview/${name}`,
    url: `/properties/la-clusaz/${name}`,
    alt_text: index === 0 ? 'Chalet à La Clusaz sous la neige' : `Chalet à La Clusaz — photo ${index + 1}`,
    is_primary: index === 0,
    sort_order: index,
    created_at: new Date().toISOString(),
  })),
  amenities: [
    ['wifi', 'Wi-Fi', 'Wifi'],
    ['heating', 'Chauffage et cheminée', 'Flame'],
    ['equipped_kitchen', 'Cuisine équipée', 'CookingPot'],
    ['parking', 'Garage 2 véhicules', 'SquareParking'],
    ['garden', 'Jardin spacieux', 'Trees'],
    ['sauna', 'Sauna privatif', 'Waves'],
    ['linen', 'Draps et linge fournis', 'BedDouble'],
  ].map(([key, label_fr, icon], index) => ({
    id: `33333333-3333-4333-8333-${String(index).padStart(12, '0')}`,
    key,
    label_fr,
    icon,
  })),
};

