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
  description: `# Chalet spacieux à La Clusaz – Quartier du Gotty

Situé dans le **quartier calme du Gotty à La Clusaz**, ce magnifique chalet de **155 m²** offre un cadre chaleureux et confortable pour profiter pleinement d’un séjour à la montagne.

Il peut accueillir **jusqu’à 14 voyageurs**, avec la possibilité d’ajouter **2 couchages supplémentaires**, ce qui en fait une adresse idéale pour les familles nombreuses, les groupes d’amis ou les séjours en tribu.

## Le chalet

Le chalet dispose de **5 chambres confortables**, réparties comme suit :

- **4 chambres avec lit double** ;
- **1 chambre avec 4 lits individuels**.

Chaque chambre bénéficie de sa **salle de bain privative**, soit **5 salles de bain au total**, garantissant confort, intimité et praticité à l’ensemble des voyageurs.

Pour rendre votre séjour encore plus agréable, le chalet comprend également :

- une connexion **Wi-Fi** ;
- un **sauna privatif** ;
- une **cheminée** ;
- un **garage pouvant accueillir 2 véhicules** ;
- un **spacieux jardin** ;
- les **draps et le linge de maison fournis**.

## Un emplacement idéal pour le ski

Le chalet bénéficie d’une situation privilégiée pour profiter facilement du domaine skiable de La Clusaz :

- **Piste de ski la plus proche :** environ 350 mètres ;
- **Arrêt du ski-bus :** environ 100 mètres ;
- **Télécabine de Beauregard :** accès privilégié au secteur de Beauregard, jusqu’à environ **1 640 mètres d’altitude**.

Cette localisation permet de rejoindre rapidement les pistes tout en profitant du calme du quartier du Gotty.

## À proximité du village

Le centre de **La Clusaz** se trouve à environ **1,5 km** du chalet.

Vous pourrez facilement profiter :

- du marché local ;
- des commerces ;
- des restaurants ;
- des animations et services de la station.

## Un séjour entre montagne, confort et tranquillité

Grâce à ses grands espaces, ses nombreux équipements et sa proximité avec les pistes, ce chalet est parfaitement adapté à un **séjour en famille ou entre amis**.

Un lieu idéal pour profiter de **La Clusaz**, de son domaine skiable et de l’atmosphère authentique de la montagne, dans un environnement à la fois **paisible, confortable et convivial**.`,
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
