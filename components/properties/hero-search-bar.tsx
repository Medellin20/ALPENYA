'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Wallet, BedDouble, Building2 } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DESTINATION_CITIES, PROPERTY_TYPES } from '@/lib/utils/constants';

export function HeroSearchBar() {
  const router = useRouter();
  const [city, setCity] = React.useState('');
  const [minPrice, setMinPrice] = React.useState('');
  const [maxPrice, setMaxPrice] = React.useState('');
  const [bedrooms, setBedrooms] = React.useState('');
  const [type, setType] = React.useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (type) params.set('type', type);
    router.push(`/appartements${params.toString() ? `?${params}` : ''}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl bg-white p-3 shadow-lifted sm:p-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ink-500">
            <MapPin className="h-3.5 w-3.5" /> Ville
          </label>
          <Select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">Toutes les villes</option>
            {DESTINATION_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ink-500">
            <Wallet className="h-3.5 w-3.5" /> Budget min.
          </label>
          <Select value={minPrice} onChange={(e) => setMinPrice(e.target.value)}>
            <option value="">Aucun</option>
            {[500, 750, 1000, 1250, 1500, 2000].map((v) => (
              <option key={v} value={v}>
                €{v}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ink-500">
            <Wallet className="h-3.5 w-3.5" /> Budget max.
          </label>
          <Select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}>
            <option value="">Aucun</option>
            {[1000, 1500, 2000, 2500, 3000, 4000, 5000].map((v) => (
              <option key={v} value={v}>
                €{v}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ink-500">
            <BedDouble className="h-3.5 w-3.5" /> Chambres
          </label>
          <Select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}>
            <option value="">Indifférent</option>
            {[1, 2, 3, 4].map((v) => (
              <option key={v} value={v}>
                {v}+
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ink-500">
            <Building2 className="h-3.5 w-3.5" /> Type
          </label>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Tous types</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Button type="submit" size="lg" className="mt-3 w-full">
        <Search className="h-4.5 w-4.5" />
        Voir les chalets et villas
      </Button>
    </form>
  );
}
