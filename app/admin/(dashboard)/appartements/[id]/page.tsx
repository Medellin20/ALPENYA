import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getPropertyByIdAdmin, getAllAmenities } from '@/lib/data/admin-properties';
import { PropertyForm } from '@/components/admin/property-form';
import { ImageUploader } from '@/components/admin/image-uploader';

export const metadata: Metadata = { title: 'Modifier un bien' };
export const dynamic = 'force-dynamic';

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const [property, amenities] = await Promise.all([getPropertyByIdAdmin(params.id), getAllAmenities()]);
  if (!property) notFound();

  const currentAmenityIds = (property.property_amenities ?? []).map((pa: any) => pa.amenity_id);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/appartements"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux biens
        </Link>
        {property.is_published && (
          <Link
            href={`/appartements/${property.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-canal-600 hover:underline"
          >
            Voir la page publique
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <h1 className="mb-6 text-2xl font-extrabold text-ink-900">{property.title}</h1>

      <div className="max-w-4xl space-y-8">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h2 className="mb-4 font-bold text-ink-900">Photos</h2>
          <ImageUploader propertyId={property.id} initialImages={property.property_images ?? []} />
        </div>

        <PropertyForm
          mode="edit"
          propertyId={property.id}
          property={property}
          currentAmenityIds={currentAmenityIds}
          amenities={amenities}
        />
      </div>
    </div>
  );
}
