import Image from 'next/image';
import Link from 'next/link';
import { BedDouble, Bath, Ruler, MapPin } from 'lucide-react';
import type { PropertyWithRelations } from '@/types/database';
import { Badge, StatusDot } from '@/components/ui/badge';
import { FavoriteButton } from '@/components/properties/favorite-button';
import { PROPERTY_STATUS_LABELS } from '@/lib/utils/constants';
import { formatDate, formatPrice, formatSurface } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

function isNew(createdAt: string) {
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return days <= 14;
}

export function PropertyCard({ property }: { property: PropertyWithRelations }) {
  const primaryImage =
    property.property_images.find((img) => img.is_primary) ?? property.property_images[0];
  const statusMeta = PROPERTY_STATUS_LABELS[property.status];
  const availableNow =
    !property.available_from || new Date(property.available_from) <= new Date();

  return (
    <Link
      href={`/appartements/${property.slug}`}
      className="group block overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-100">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt_text || property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-300">Pas de photo</div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {isNew(property.created_at) && <Badge variant="new">Nouveau</Badge>}
          {availableNow && property.status === 'available' && (
            <Badge variant="available">Disponible immédiatement</Badge>
          )}
        </div>

        <FavoriteButton propertyId={property.id} className="absolute right-3 top-3" />

        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink-700 shadow-soft backdrop-blur-sm">
            <StatusDot colorClass={statusMeta.colorClass} />
            {statusMeta.label}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-canal-600">
          <MapPin className="h-3.5 w-3.5" />
          {property.neighborhood ? `${property.neighborhood}, ${property.city}` : property.city}
        </div>

        <h3 className="mt-1.5 truncate text-base font-bold text-ink-900 sm:text-lg">
          {property.title}
        </h3>

        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-xl font-extrabold text-ink-900">
            {formatPrice(property.monthly_price)}
          </span>
          <span className="text-sm text-ink-400">/ semaine hors saison</span>
        </div>

        <div className="mt-3 flex items-center gap-4 border-t border-ink-100 pt-3 text-sm text-ink-500">
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4 text-ink-400" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-ink-400" />
            {property.bathrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Ruler className="h-4 w-4 text-ink-400" />
            {formatSurface(property.surface_m2)}
          </span>
        </div>

        {property.available_from && (
          <p className={cn('mt-2.5 text-xs text-ink-400')}>
            Disponible à partir du {formatDate(property.available_from)}
          </p>
        )}
      </div>
    </Link>
  );
}
