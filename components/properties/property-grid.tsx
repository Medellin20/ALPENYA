import type { PropertyWithRelations } from '@/types/database';
import { PropertyCard } from '@/components/properties/property-card';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchX } from 'lucide-react';

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

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property, index) => (
        <div
          key={property.id}
          className="min-w-0 h-full motion-safe:animate-fade-up"
          style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
        >
          <PropertyCard property={property} />
        </div>
      ))}
    </div>
  );
}
