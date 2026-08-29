import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Filter, PlusCircle, Search } from 'lucide-react';
import { getAllPropertiesAdmin } from '@/lib/data/admin-properties';
import { PropertyRowActions } from '@/components/admin/property-row-actions';
import { Pagination } from '@/components/properties/pagination';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge, StatusDot } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { DESTINATION_CITIES, PROPERTY_STATUS_LABELS, PROPERTY_TYPES } from '@/lib/utils/constants';
import { formatPrice } from '@/lib/utils/format';

export const metadata: Metadata = { title: 'Chalets et villas' };
export const dynamic = 'force-dynamic';

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; city?: string; type?: string; page?: string };
}) {
  const { properties, total, page, pageSize } = await getAllPropertiesAdmin({
    search: searchParams.search,
    status: searchParams.status,
    city: searchParams.city,
    propertyType: searchParams.type,
    page: searchParams.page ? Number(searchParams.page) : 1,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Chalets et villas</h1>
          <p className="mt-1 text-sm text-ink-500">{total} bien(s) au total.</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/appartements/nouveau">
            <PlusCircle className="h-4 w-4" />
            Ajouter un bien
          </Link>
        </Button>
      </div>

      <form className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_12rem_12rem_12rem_auto]" action="/admin/appartements" method="get">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <Input name="search" placeholder="Rechercher un titre, une ville, un slug..." defaultValue={searchParams.search} className="pl-10" />
        </div>
        <Select name="type" defaultValue={searchParams.type}>
          <option value="">Chalets et villas</option>
          {PROPERTY_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
        </Select>
        <Select name="status" defaultValue={searchParams.status}>
          <option value="">Tous les statuts</option>
          <option value="draft">Brouillon</option>
          <option value="available">Disponible</option>
          <option value="reserved">Réservé</option>
          <option value="rented">Loué</option>
          <option value="unavailable">Indisponible</option>
        </Select>
        <Select name="city" defaultValue={searchParams.city}>
          <option value="">Toutes les villes</option>
          {DESTINATION_CITIES.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </Select>
        <Button type="submit" variant="outline" className="w-full xl:w-auto">
          <Filter className="h-4 w-4" />
          Appliquer les filtres
        </Button>
      </form>

      {properties.length === 0 ? (
        <EmptyState title="Aucun bien trouvé" description="Ajoutez votre premier chalet ou votre première villa pour commencer." />
      ) : (
        <>
          {/* Vue tableau — desktop */}
          <div className="scrollbar-safe hidden overflow-x-auto rounded-2xl border border-ink-100 bg-white xl:block">
            <table className="w-full min-w-[950px] table-fixed text-sm">
              <thead className="border-b border-ink-100 bg-sand-100/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                <tr>
                  <th className="w-[28%] px-4 py-3">Bien</th>
                  <th className="w-[15%] px-4 py-3">Ville</th>
                  <th className="w-[13%] px-4 py-3">Tarif</th>
                  <th className="w-[12%] px-4 py-3">Publication</th>
                  <th className="w-[32%] px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {properties.map((property: any) => {
                  const primaryImage =
                    property.property_images?.find((i: any) => i.is_primary) ?? property.property_images?.[0];
                  const statusMeta = PROPERTY_STATUS_LABELS[property.status];
                  return (
                    <tr key={property.id} className="align-middle">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                            {primaryImage && (
                              <Image src={primaryImage.url} alt="" fill sizes="64px" className="object-cover" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink-900">{property.title}</p>
                            <span className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-ink-400">
                              <StatusDot colorClass={statusMeta.colorClass} />
                              {statusMeta.label}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-600"><span className="line-clamp-2">{property.city}</span></td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-ink-800">{formatPrice(property.monthly_price)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={property.is_published ? 'available' : 'default'}>
                          {property.is_published ? 'Publié' : 'Brouillon'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <PropertyRowActions id={property.id} isPublished={property.is_published} status={property.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Vue cartes — mobile / tablette */}
          <div className="space-y-4 xl:hidden">
            {properties.map((property: any) => {
              const primaryImage =
                property.property_images?.find((i: any) => i.is_primary) ?? property.property_images?.[0];
              const statusMeta = PROPERTY_STATUS_LABELS[property.status];
              return (
                <div key={property.id} className="rounded-2xl border border-ink-100 bg-white p-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                      {primaryImage && <Image src={primaryImage.url} alt="" fill sizes="80px" className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink-900">{property.title}</p>
                      <p className="text-xs text-ink-400">{property.city}</p>
                      <p className="mt-0.5 text-sm font-medium text-ink-700">{formatPrice(property.monthly_price)}</p>
                    </div>
                    <Badge className="shrink-0" variant={property.is_published ? 'available' : 'default'}>
                      {property.is_published ? 'Publié' : 'Brouillon'}
                    </Badge>
                  </div>
                  <div className="mt-3 border-t border-ink-100 pt-3">
                    <PropertyRowActions id={property.id} isPublished={property.is_published} status={property.status} />
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/appartements" searchParams={searchParams} />
        </>
      )}
    </div>
  );
}
