import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight, Mountain, Sun, Compass, Building2, Caravan } from 'lucide-react';
import { PropertyGrid } from '@/components/properties/property-grid';
import { PropertyFilters } from '@/components/properties/property-filters';
import { Pagination } from '@/components/properties/pagination';
import { getAvailableCities, getCityPropertySummaries, getPublishedProperties } from '@/lib/data/properties';
import type { PropertyFilters as Filters } from '@/types';

export const revalidate = 30;

export const metadata: Metadata = {
  title: 'Biens à louer en France',
  description:
    'Découvrez nos chalets, villas, appartements non meublés et mobil-homes à louer en France. Filtrez par destination, budget, capacité et type de bien.',
};

interface PageProps {
  searchParams: {
    city?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
    type?: string;
    furnished?: string;
    sort?: string;
    page?: string;
  };
}

export default async function AppartementsPage({ searchParams }: PageProps) {
  if (Object.values(searchParams).every(value => !value)) {
    const cities = await getCityPropertySummaries();
    return (
      <div className="container-app py-10 sm:py-14">
        <CatalogueHeader />
        <div className="mb-7 mt-12 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-canal-700">À chaque envie, une destination</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-950">Où souhaitez-vous vous évader ?</h2></div>
          <span className="text-sm text-ink-700">{cities.length} destination{cities.length > 1 ? 's' : ''} à découvrir</span>
        </div>
        {cities.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map(({ city, count, imageUrl }) => (
              <Link key={city} href={`/appartements?city=${encodeURIComponent(city)}`} className="group relative isolate flex min-h-[300px] items-end overflow-hidden rounded-3xl bg-ink-900 p-6 text-white shadow-soft transition-shadow hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canal-600 focus-visible:ring-offset-4">
                {imageUrl ? <Image src={imageUrl} alt={`Séjour à ${city}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="-z-20 object-cover transition-transform duration-700 motion-safe:group-hover:scale-105" /> : <div className="absolute inset-0 -z-20 bg-gradient-to-br from-canal-700 to-ink-950"><Mountain aria-hidden="true" className="absolute right-6 top-6 h-28 w-28 stroke-1 text-white/15" /></div>}
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950/95 via-ink-950/20 to-transparent" />
                <div className="flex w-full items-end justify-between gap-4">
                  <div><span className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-white/80"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />France</span><h3 className="text-3xl font-bold tracking-tight">{city}</h3><p className="mt-2 text-sm text-white/85">{count} séjour{count > 1 ? 's' : ''} à découvrir</p></div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/40 transition-colors group-hover:bg-white group-hover:text-ink-950"><ArrowRight className="h-5 w-5" aria-hidden="true" /></span>
                </div>
              </Link>
            ))}
          </div>
        ) : <p className="rounded-3xl border border-ink-100 bg-white p-8 text-ink-700">Le catalogue est en cours de préparation. Les premiers biens apparaîtront ici dès leur publication.</p>}
      </div>
    );
  }

  const filters: Filters = {
    city: searchParams.city,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    bedrooms: searchParams.bedrooms ? Number(searchParams.bedrooms) : undefined,
    propertyType: searchParams.type,
    furnished: (searchParams.furnished as Filters['furnished']) || undefined,
    sort: (searchParams.sort as Filters['sort']) || 'recent',
    page: searchParams.page ? Number(searchParams.page) : 1,
  };

  const [{ properties, total, page, pageSize }, cities] = await Promise.all([
    getPublishedProperties(filters),
    getAvailableCities(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="container-app py-10 sm:py-14">
      <CatalogueHeader city={filters.city} propertyType={filters.propertyType} />
      <div className="mt-10 rounded-2xl border border-ink-100 bg-white px-4 pb-0 pt-5 sm:px-6">
      <PropertyFilters resultCount={total} cities={cities} />
      </div>
      <div className="mt-8"><PropertyGrid properties={properties} /></div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/appartements"
        searchParams={searchParams}
      />
    </div>
  );
}


function CatalogueHeader({ city, propertyType }: { city?: string; propertyType?: string }) {
  const categories = [
    { label: 'Toutes les destinations', type: '', icon: Compass },
    { label: 'Nos chalets', type: 'chalet', icon: Mountain },
    { label: 'Nos villas', type: 'villa', icon: Sun },
    { label: 'Appartements non meublés', type: 'unfurnished_apartment', icon: Building2 },
    { label: 'Mobil-homes', type: 'mobile_home', icon: Caravan },
  ];
  return (
    <header className="relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-10 text-white sm:px-10 sm:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full border-[60px] border-white/[0.04]" />
      <p className="relative text-xs font-semibold uppercase tracking-[0.24em] text-canal-200">La collection ALPENIA</p>
      <h1 className="relative mt-5 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
        {city ? <>Une parenthèse à <span className="font-serif font-normal italic text-canal-200">{city}.</span></> : propertyType === 'chalet' ? <>L’esprit chalet.<br /><span className="font-serif font-normal italic text-canal-200">La montagne pour horizon.</span></> : propertyType === 'villa' ? <>L’art de la villa.<br /><span className="font-serif font-normal italic text-canal-200">Du soleil, de l’espace.</span></> : propertyType === 'unfurnished_apartment' ? <>Un appartement à vous.<br /><span className="font-serif font-normal italic text-canal-200">À aménager selon vos envies.</span></> : propertyType === 'mobile_home' ? <>L’esprit plein air.<br /><span className="font-serif font-normal italic text-canal-200">Découvrez nos mobil-homes.</span></> : <>Des lieux à découvrir.<br /><span className="font-serif font-normal italic text-canal-200">Des séjours à imaginer.</span></>}
      </h1>
      <p className="relative mt-5 max-w-xl text-sm leading-7 text-white/75 sm:text-base">{city ? 'Trouvez le logement qui vous ressemble dans cette destination.' : 'Chalets, villas, appartements non meublés et mobil-homes : trouvez votre prochaine adresse en France.'}</p>
      <nav aria-label="Collections de logements" className="relative mt-8 flex flex-wrap gap-2">
        {categories.map(({ label, type, icon: Icon }) => {
          const active = !city && (propertyType ?? '') === type;
          return <Link key={label} href={type ? `/appartements?type=${type}` : '/appartements'} aria-current={active ? 'page' : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canal-200 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 ${active ? 'border-white bg-white text-ink-950' : 'border-white/25 text-white hover:border-white/60 hover:bg-white/10'}`}><Icon className="h-4 w-4" aria-hidden="true" />{label}</Link>;
        })}
      </nav>
    </header>
  );
}
