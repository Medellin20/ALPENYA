import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getPropertyBySlug } from '@/lib/data/properties';
import { ViewingRequestForm } from '@/components/forms/viewing-request-form';

export const metadata: Metadata = { title: 'Réserver une visite' };

export default async function ViewingRequestPage({ params }: { params: { slug: string } }) {
  const property = await getPropertyBySlug(params.slug);
  if (!property) notFound();

  const primaryImage = property.property_images.find((i) => i.is_primary) ?? property.property_images[0];

  return (
    <div className="container-app py-6 sm:py-14">
      <Link
        href={`/appartements/${property.slug}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au logement
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:p-8">
            <h1 className="text-display-sm font-extrabold text-ink-900">Réserver une visite</h1>
            <p className="mt-1.5 text-ink-500">{property.title}</p>
            <div className="mt-8">
              <ViewingRequestForm
                propertyId={property.id}
                propertySlug={property.slug}
                propertyTitle={property.title}
              />
            </div>
          </div>
        </div>

        <aside className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
            {primaryImage && (
              <div className="relative aspect-[4/3] w-full">
                <Image src={primaryImage.url} alt={property.title} fill className="object-cover" />
              </div>
            )}
            <div className="p-5">
              <h2 className="font-bold text-ink-900">{property.title}</h2>
              <p className="mt-1 text-sm text-ink-500">
                {property.neighborhood ? `${property.neighborhood}, ` : ''}
                {property.city}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
