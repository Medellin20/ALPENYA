import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PropertyForm } from '@/components/admin/property-form';
import { getAllAmenities } from '@/lib/data/admin-properties';

export const metadata: Metadata = { title: 'Ajouter un bien' };

export default async function NewPropertyPage() {
  const amenities = await getAllAmenities();

  return (
    <div>
      <Link
        href="/admin/appartements"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux biens
      </Link>
      <h1 className="mb-6 text-2xl font-extrabold text-ink-900">Ajouter un chalet ou une villa</h1>

      <div className="max-w-4xl">
        <PropertyForm mode="create" amenities={amenities} />
        <p className="mt-4 text-xs text-ink-400">
          Vous pourrez ajouter des photos une fois le logement créé.
        </p>
      </div>
    </div>
  );
}
