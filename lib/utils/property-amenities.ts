import type { Amenity, Property } from '@/types/database';

export const PROPERTY_AMENITY_FIELDS = [
  { key: 'elevator', field: 'hasElevator', column: 'has_elevator', label: 'Ascenseur', icon: 'ArrowUpDown' },
  { key: 'balcony', field: 'hasBalcony', column: 'has_balcony', label: 'Balcon', icon: 'DoorOpen' },
  { key: 'terrace', field: 'hasTerrace', column: 'has_terrace', label: 'Terrasse', icon: 'Sun' },
  { key: 'parking', field: 'hasParking', column: 'has_parking', label: 'Parking', icon: 'SquareParking' },
  { key: 'garage', field: 'hasGarage', column: 'has_garage', label: 'Garage', icon: 'Warehouse' },
  { key: 'garden', field: 'hasGarden', column: 'has_garden', label: 'Jardin', icon: 'Trees' },
] as const;

/** Inclut les caractéristiques cochées dans l’admin, sans doublons. */
export function getPropertyAmenities(property: Property, amenities: Amenity[]): Amenity[] {
  const result = new Map(amenities.map(amenity => [amenity.key, amenity]));
  for (const item of PROPERTY_AMENITY_FIELDS) {
    if (property[item.column] && !result.has(item.key)) {
      result.set(item.key, { id: `feature-${item.key}`, key: item.key, label_fr: item.label, icon: item.icon });
    }
  }
  return [...result.values()];
}
