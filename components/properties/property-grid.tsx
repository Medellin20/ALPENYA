import type { PropertyWithRelations } from '@/types/database';
import { PropertyCard } from '@/components/properties/property-card';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchX } from 'lucide-react';
import { MapPin } from 'lucide-react';
import { DESTINATION_CITIES } from '@/lib/utils/constants';

export function PropertyGrid({ properties }: { properties: PropertyWithRelations[] }) {
  if (properties.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="h-10 w-10" />}
        title="Aucun bien ne correspond à votre recherche"
        description="Essayez d’élargir vos critères : catégorie, budget, destination ou nombre de chambres."
      />
    );
  }

  const cityOrder = new Map<string, number>(
    DESTINATION_CITIES.map((city, index) => [city, index])
  );
  const grouped = Array.from(
    properties.reduce((groups, property) => {
      const cityProperties = groups.get(property.city) ?? [];
      cityProperties.push(property);
      groups.set(property.city, cityProperties);
      return groups;
    }, new Map<string, PropertyWithRelations[]>())
  ).sort(([cityA], [cityB]) =>
    (cityOrder.get(cityA) ?? Number.MAX_SAFE_INTEGER) -
      (cityOrder.get(cityB) ?? Number.MAX_SAFE_INTEGER) || cityA.localeCompare(cityB)
  );

  return (
    <div className="space-y-12">
      {grouped.map(([city, cityProperties]) => (
        <section key={city} aria-labelledby={`city-${city.toLowerCase().replaceAll(' ', '-')}`}>
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-ink-100 pb-3">
            <h2
              id={`city-${city.toLowerCase().replaceAll(' ', '-')}`}
              className="flex items-center gap-2 text-xl font-extrabold text-ink-900 sm:text-2xl"
            >
              <MapPin className="h-5 w-5 text-canal-600" />
              {city}
            </h2>
            <span className="text-sm text-ink-400">
              {cityProperties.length} bien{cityProperties.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cityProperties.map((property, index) => (
              <div
                key={property.id}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
