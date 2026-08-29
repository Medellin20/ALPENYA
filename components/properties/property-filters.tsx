'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { PROPERTY_TYPES } from '@/lib/utils/constants';
import { useMediaQuery } from '@/hooks/use-media-query';

interface FilterState {
  city: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  type: string;
  furnished: string;
  sort: string;
}

function readFilters(params: URLSearchParams): FilterState {
  return {
    city: params.get('city') ?? '',
    minPrice: params.get('minPrice') ?? '',
    maxPrice: params.get('maxPrice') ?? '',
    bedrooms: params.get('bedrooms') ?? '',
    type: params.get('type') ?? '',
    furnished: params.get('furnished') ?? '',
    sort: params.get('sort') ?? 'recent',
  };
}

export function PropertyFilters({ resultCount, cities }: { resultCount: number; cities: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<FilterState>(() => readFilters(searchParams));

  React.useEffect(() => {
    setFilters(readFilters(searchParams));
  }, [searchParams]);

  function apply(next: FilterState) {
    const params = new URLSearchParams();
    if (next.city) params.set('city', next.city);
    if (next.minPrice) params.set('minPrice', next.minPrice);
    if (next.maxPrice) params.set('maxPrice', next.maxPrice);
    if (next.bedrooms) params.set('bedrooms', next.bedrooms);
    if (next.type) params.set('type', next.type);
    if (next.furnished) params.set('furnished', next.furnished);
    if (next.sort && next.sort !== 'recent') params.set('sort', next.sort);
    router.push(`${pathname}${params.toString() ? `?${params}` : ''}`);
    setDrawerOpen(false);
  }

  function update<K extends keyof FilterState>(key: K, value: string) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    if (key === 'sort') apply(next); // le tri s'applique immédiatement
  }

  function reset() {
    const cleared: FilterState = {
      city: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      type: '',
      furnished: '',
      sort: 'recent',
    };
    setFilters(cleared);
    apply(cleared);
  }

  const activeCount = [
    filters.city,
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
    filters.type,
    filters.furnished,
  ].filter(Boolean).length;

  const filterFields = (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-ink-500">Ville</label>
        <Select value={filters.city} onChange={(e) => update('city', e.target.value)}>
          <option value="">Toutes les villes</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-500">Prix min.</label>
          <Select value={filters.minPrice} onChange={(e) => update('minPrice', e.target.value)}>
            <option value="">—</option>
            {[500, 750, 1000, 1250, 1500, 2000].map((v) => (
              <option key={v} value={v}>
                €{v}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-500">Prix max.</label>
          <Select value={filters.maxPrice} onChange={(e) => update('maxPrice', e.target.value)}>
            <option value="">—</option>
            {[1000, 1500, 2000, 2500, 3000, 4000, 5000].map((v) => (
              <option key={v} value={v}>
                €{v}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-ink-500">Chambres minimum</label>
        <Select value={filters.bedrooms} onChange={(e) => update('bedrooms', e.target.value)}>
          <option value="">Indifférent</option>
          {[1, 2, 3, 4].map((v) => (
            <option key={v} value={v}>
              {v}+
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-ink-500">Type de logement</label>
        <Select value={filters.type} onChange={(e) => update('type', e.target.value)}>
          <option value="">Tous types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-ink-500">Ameublement</label>
        <Select value={filters.furnished} onChange={(e) => update('furnished', e.target.value)}>
          <option value="">Indifférent</option>
          <option value="yes">Meublé</option>
          <option value="no">Non meublé</option>
        </Select>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={reset}>
          Réinitialiser
        </Button>
        <Button type="button" className="flex-1" onClick={() => apply(filters)}>
          Appliquer
        </Button>
      </div>
    </div>
  );

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-ink-500">
        <span className="font-semibold text-ink-900">{resultCount}</span>{' '}
        {resultCount > 1 ? 'logements trouvés' : 'logement trouvé'}
      </p>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <Select
          value={filters.sort}
          onChange={(e) => update('sort', e.target.value)}
          className="!h-10 min-w-0 flex-1 text-xs sm:w-auto sm:min-w-[9.5rem]"
        >
          <option value="recent">Plus récents</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
          <option value="surface">Surface</option>
        </Select>

        <Button variant="outline" size="sm" onClick={() => setDrawerOpen(true)} className="shrink-0">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filtres
          {activeCount > 0 && (
            <span className="ml-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-ink-700 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Filtrer les logements">
        {filterFields}
      </Drawer>
    </div>
  );
}
