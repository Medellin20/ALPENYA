import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PropertyDataError } from '@/components/admin/property-data-error';
import { PropertyForm } from '@/components/admin/property-form';
import { PROPERTY_TYPES } from '@/lib/utils/constants';
import { getAllAmenities } from '@/lib/data/admin-properties';

export const metadata: Metadata = { title: 'Ajouter un bien' };

export default async function NewPropertyPage({ searchParams }: { searchParams: { type?: string } }) {
  const selectedType = PROPERTY_TYPES.find(type => type.value === searchParams.type);
  const { amenities, error } = await getAllAmenities();

  return (
    <div>
      <Link
        href="/admin/appartements"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux biens
      </Link>
      <h1 className="mb-6 text-2xl font-extrabold text-ink-900">Ajouter un bien</h1>

      <nav aria-label="Catégorie du nouveau bien" className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {PROPERTY_TYPES.map(type => <Link key={type.value} href={`/admin/appartements/nouveau?type=${type.value}`} aria-current={selectedType?.value === type.value ? 'page' : undefined} className={`rounded-xl border p-4 text-sm font-semibold ${selectedType?.value === type.value ? 'border-canal-600 bg-canal-50 text-canal-800' : 'border-ink-100 bg-white text-ink-700 hover:border-canal-400'}`}>{type.label}</Link>)}
      </nav>
      <p className="mb-6 text-sm text-ink-500">1. Choisissez une catégorie · 2. Renseignez le bien · 3. Ajoutez les photos et publiez</p>
      <div className="max-w-4xl">
        {error ? (
          <PropertyDataError message={error} retryHref="/admin/appartements/nouveau" />
        ) : (
          <PropertyForm key={selectedType?.value ?? 'chalet'} mode="create" initialType={selectedType?.value} amenities={amenities} />
        )}
        {!error && <p className="mt-4 text-xs text-ink-400">
          Vous pourrez ajouter des photos une fois le logement créé.
        </p>}
      </div>
    </div>
  );
}
