import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BedDouble,
  Bath,
  Ruler,
  Building,
  ArrowUpDown,
  Sofa,
  MessageCircle,
} from 'lucide-react';
import { getPropertyBySlug, getSimilarProperties } from '@/lib/data/properties';
import { PropertyGallery } from '@/components/properties/property-gallery';
import { AmenityIcon } from '@/components/properties/amenity-icon';
import { FavoriteButton } from '@/components/properties/favorite-button';
import { ShareButton } from '@/components/properties/share-button';
import { PropertyCard } from '@/components/properties/property-card';
import { SeasonalPriceSelector } from '@/components/properties/seasonal-price-selector';
import { Badge, StatusDot } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/ui/fade-in';
import { PROPERTY_STATUS_LABELS } from '@/lib/utils/constants';
import { formatDate, formatPrice, formatSurface } from '@/lib/utils/format';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const property = await getPropertyBySlug(params.slug);
  if (!property) return { title: 'Logement introuvable' };

  const primaryImage = property.property_images.find((i) => i.is_primary) ?? property.property_images[0];

  return {
    title: `${property.title} — ${property.city}`,
    description: property.description.slice(0, 155),
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 155),
      images: primaryImage ? [{ url: primaryImage.url }] : undefined,
    },
    alternates: {
      canonical: `/appartements/${property.slug}`,
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const property = await getPropertyBySlug(params.slug);
  if (!property) notFound();

  const similar = await getSimilarProperties(property, 3);
  const statusMeta = PROPERTY_STATUS_LABELS[property.status];
  const isBookable = property.status === 'available';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VacationRental',
    name: property.title,
    description: property.description,
    numberOfRooms: property.rooms ?? property.bedrooms,
    floorSize: { '@type': 'QuantitativeValue', value: property.surface_m2, unitCode: 'MTK' },
    address: { '@type': 'PostalAddress', addressLocality: property.city, addressCountry: 'FR' },
    offers: {
      '@type': 'Offer',
      price: property.monthly_price,
      priceCurrency: 'EUR',
      availability: isBookable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="container-app py-5 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-5 flex min-w-0 items-center gap-1.5 overflow-hidden text-xs text-ink-400 sm:text-sm">
        <Link href="/" className="shrink-0 hover:text-ink-700">Accueil</Link>
        <span>/</span>
        <Link href="/appartements" className="shrink-0 hover:text-ink-700">Chalets & villas</Link>
        <span>/</span>
        <span className="truncate text-ink-600">{property.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-3 lg:gap-10">
        <div className="lg:col-span-2">
          <FadeIn>
            <PropertyGallery images={property.property_images} title={property.title} />
          </FadeIn>

          <FadeIn delay={0.05} className="mt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-200 px-2.5 py-1 text-xs font-semibold text-ink-700">
                    <StatusDot colorClass={statusMeta.colorClass} />
                    {statusMeta.label}
                  </span>
                  <Badge variant="outline">{property.neighborhood ?? property.city}</Badge>
                </div>
                <h1 className="mt-2 break-words text-2xl font-extrabold leading-tight text-ink-900 min-[400px]:text-3xl sm:text-display-md">
                  {property.title}
                </h1>
                <p className="mt-1 text-ink-500">
                  {property.neighborhood ? `${property.neighborhood}, ` : ''}
                  {property.city} · France
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ShareButton title={property.title} />
                <FavoriteButton
                  propertyId={property.id}
                  className="static flex h-10 w-10 shadow-none ring-1 ring-inset ring-ink-200"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-ink-100 bg-white p-4 sm:grid-cols-4 sm:gap-4 sm:p-5">
              <Feature icon={BedDouble} label="Chambres" value={String(property.bedrooms)} />
              <Feature icon={Bath} label="Salles de bain" value={String(property.bathrooms)} />
              {property.surface_m2 > 0 && (
                <Feature icon={Ruler} label="Surface" value={formatSurface(property.surface_m2)} />
              )}
              <Feature
                icon={Building}
                label="Étage"
                value={property.floor != null ? `${property.floor}${property.floor === 0 ? ' (RDC)' : ''}` : '—'}
              />
            </div>

            <div className="mt-10">
              <h2 className="text-lg font-bold text-ink-900">Présentation</h2>
              <PropertyPresentation description={property.description} />
            </div>

            <div className="mt-10">
              <h2 className="text-lg font-bold text-ink-900">Détails du logement</h2>
              <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                <DetailRow label="Offert depuis" value={formatDate(property.created_at)} />
                <DetailRow label="Type de contrat" value={property.contract_type} />
                <DetailRow label="Intérieur" value={property.interior_type} />
                <DetailRow label="État d’entretien" value={property.maintenance_condition} />
                <DetailRow
                  label="Ameublement"
                  value={property.is_furnished ? 'Meublé' : 'Non meublé'}
                />
                <DetailRow
                  label="Disponible à partir du"
                  value={property.available_from ? formatDate(property.available_from) : 'Nous consulter'}
                />
                <DetailRow
                  label="Durée minimale de location"
                  value={property.contract_type.includes('semaine') ? '1 semaine' : `${property.minimum_stay_months ?? 12} mois`}
                />
                <DetailRow label="Parking" value={property.has_parking ? 'Oui' : 'Non'} />
                <DetailRow label="Garage" value={property.has_garage ? 'Oui' : 'Non'} />
              </dl>
            </div>

            {property.amenities.length > 0 && (
              <div className="mt-10">
                <h2 className="text-lg font-bold text-ink-900">Équipements</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {property.amenities.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-2.5 rounded-xl border border-ink-100 bg-white px-3.5 py-3 text-sm text-ink-600"
                    >
                      <AmenityIcon name={a.icon} className="h-4.5 w-4.5 text-canal-600" />
                      {a.label_fr}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </FadeIn>
        </div>

        {/* SIDEBAR STICKY — prix + CTA */}
        <div className="lg:col-span-1">
          <FadeIn delay={0.1} className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
              <SeasonalPriceSelector
                summerPrice={property.monthly_price}
                earlySummerPrice={property.deposit_amount}
                septemberPrice={property.viewing_fee}
                lateSpringPrice={property.service_charges}
              />
              {isBookable ? (
                <div className="mt-5 space-y-2.5">
                  <Button asChild className="w-full" size="lg">
                    <Link href={`/appartements/${property.slug}/reagir`}>
                      <MessageCircle className="h-4.5 w-4.5" />
                      Répondre
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="mt-5 rounded-xl bg-sand-100 p-4 text-sm text-ink-500">
                  Ce logement n’est plus disponible à la réservation pour le moment.
                </div>
              )}

              <div className="mt-5 space-y-2 border-t border-ink-100 pt-5 text-sm text-ink-500">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Sofa className="h-3.5 w-3.5" /> Meublé</span>
                  <span className="font-medium text-ink-700">{property.is_furnished ? 'Oui' : 'Non'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><ArrowUpDown className="h-3.5 w-3.5" /> Ascenseur</span>
                  <span className="font-medium text-ink-700">{property.has_elevator ? 'Oui' : 'Non'}</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mt-16">
          <h2 className="text-lg font-bold text-ink-900">Logements similaires</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PropertyPresentation({ description }: { description: string }) {
  const blocks = description.trim().split(/\n\s*\n/);

  return (
    <div className="mt-4 space-y-5 leading-relaxed text-ink-600">
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
        const markdownHeading = lines.length === 1 ? lines[0].match(/^(#{1,3})\s+(.+)$/) : null;
        const isList = lines.length > 0 && lines.every((line) => /^[•*-]\s+/.test(line));
        const isHeading = lines.length === 1
          && lines[0] === lines[0].toLocaleUpperCase('fr-FR')
          && /[A-ZÀ-ÖØ-Þ]/.test(lines[0]);

        if (markdownHeading) {
          const isMainHeading = markdownHeading[1].length === 1;
          return (
            <h3
              key={blockIndex}
              className={isMainHeading
                ? 'text-xl font-extrabold leading-tight text-ink-900 sm:text-2xl'
                : 'pt-2 text-lg font-bold text-ink-900'}
            >
              {formatBoldText(markdownHeading[2])}
            </h3>
          );
        }

        if (isHeading) {
          return (
            <h3 key={blockIndex} className="pt-2 text-base font-extrabold uppercase tracking-wide text-ink-900">
              {formatBoldText(lines[0])}
            </h3>
          );
        }

        if (isList) {
          return (
            <ul key={blockIndex} className="space-y-2 rounded-2xl bg-sand-100 px-5 py-4">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex} className="flex gap-3">
                  <span aria-hidden="true" className="font-bold text-canal-600">•</span>
                  <span>{formatBoldText(line.replace(/^[•*-]\s+/, ''))}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={blockIndex}>
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 && <br />}
                {formatBoldText(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function formatBoldText(text: string) {
  return text.split(/(\*\*.+?\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={index} className="font-bold text-ink-900">{part.slice(2, -2)}</strong>
    ) : part
  );
}

function Feature({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center sm:items-start sm:text-left">
      <Icon className="h-5 w-5 text-canal-600" />
      <span className="text-sm font-semibold text-ink-900">{value}</span>
      <span className="text-xs text-ink-400">{label}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 py-2 text-sm">
      <dt className="text-ink-400">{label}</dt>
      <dd className="font-medium text-ink-700">{value}</dd>
    </div>
  );
}
