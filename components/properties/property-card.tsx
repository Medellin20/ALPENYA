import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BedDouble, Bath, MapPin, Mountain, Sun, Camera } from 'lucide-react';
import type { PropertyWithRelations } from '@/types/database';
import { StatusDot } from '@/components/ui/badge';
import { FavoriteButton } from '@/components/properties/favorite-button';
import { PROPERTY_STATUS_LABELS } from '@/lib/utils/constants';
import { formatPrice } from '@/lib/utils/format';

export function PropertyCard({ property }: { property: PropertyWithRelations }) {
  const primaryImage = property.property_images.find(img => img.is_primary) ?? property.property_images[0];
  const statusMeta = PROPERTY_STATUS_LABELS[property.status];
  const isVilla = property.property_type === 'villa';
  const TypeIcon = isVilla ? Sun : Mountain;
  const highlights = property.amenities.slice(0, 2);

  return (
    <article className="group relative flex h-full flex-col rounded-3xl border border-ink-100/70 bg-white p-2 shadow-soft transition-shadow duration-300 hover:shadow-lifted">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-sand-200">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt_text || property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-sand-100 to-canal-100 text-ink-600">
            <TypeIcon className="h-12 w-12 stroke-1" aria-hidden="true" />
            <span className="text-xs">Photos à venir</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/65 via-transparent to-ink-950/10" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink-900">
          <TypeIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {isVilla ? 'Villa' : 'Chalet'}
        </span>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 text-white">
          <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{property.city}</span>
          </span>
          {property.property_images.length > 0 && <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-black/25 px-2 py-1 text-xs backdrop-blur-sm"><Camera className="h-3.5 w-3.5" aria-hidden="true" /><span>{property.property_images.length} photos</span></span>}
        </div>
      </div>
      <FavoriteButton propertyId={property.id} className="absolute right-5 top-5 z-20" />
      <div className="flex flex-1 flex-col px-3 pb-3 pt-5 sm:px-4 sm:pb-4">
        <div className="flex items-center gap-2 text-xs font-medium text-ink-600">
          <StatusDot colorClass={statusMeta.colorClass} />{statusMeta.label}
        </div>
        <h3 className="mt-2 min-h-[3.5rem] text-lg font-bold leading-7 tracking-tight text-ink-950">
          <Link href={`/appartements/${property.slug}`} className="line-clamp-2 after:absolute after:inset-0 after:z-10 after:rounded-3xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-canal-600 focus-visible:after:ring-offset-4">
            {property.title}
          </Link>
        </h3>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink-800">
          <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-canal-700" aria-hidden="true" />{property.bedrooms} chambre{property.bedrooms > 1 ? 's' : ''}</span>
          <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-canal-700" aria-hidden="true" />{property.bathrooms} salle{property.bathrooms > 1 ? 's' : ''} de bain</span>
        </div>
        <div className="mb-5 mt-4 flex min-h-6 flex-wrap gap-1.5">
          {highlights.map(amenity => <span key={amenity.id} className="rounded-full bg-sand-100 px-2.5 py-1 text-[11px] font-medium text-ink-800">{amenity.label_fr}</span>)}
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-ink-100 pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-700">{isVilla ? 'Juillet – août' : 'Hors saison'}</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-ink-950"><span className="text-2xl font-extrabold tracking-tight">{property.monthly_price > 0 ? formatPrice(property.monthly_price) : 'Nous consulter'}</span>{property.monthly_price > 0 && <span className="text-xs font-normal text-ink-700">/ semaine</span>}</p>
          </div>
          <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink-950 text-white transition-colors group-hover:bg-brick-500"><ArrowUpRight className="h-5 w-5" /></span>
        </div>
      </div>
    </article>
  );
}
