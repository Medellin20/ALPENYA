import type { Metadata } from 'next';
import { Search, Users } from 'lucide-react';
import { getAllClientsAdmin } from '@/lib/data/admin-lists';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDateTime } from '@/lib/utils/format';

export const metadata: Metadata = { title: 'Clients' };
export const dynamic = 'force-dynamic';

export default async function AdminClientsPage({ searchParams }: { searchParams: { search?: string } }) {
  const clients = await getAllClientsAdmin(searchParams.search);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-900">Clients</h1>
        <p className="mt-1 text-sm text-ink-500">{clients.length} client(s) enregistré(s).</p>
      </div>

      <form className="mb-5 flex flex-col gap-3 sm:flex-row" action="/admin/clients" method="get">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <Input name="search" placeholder="Rechercher par nom ou e-mail..." defaultValue={searchParams.search} className="pl-10" />
        </div>
        <Button type="submit" variant="outline" className="w-full sm:w-auto">
          <Search className="h-4 w-4" />
          Rechercher
        </Button>
      </form>

      {clients.length === 0 ? (
        <EmptyState icon={<Users className="h-10 w-10" />} title="Aucun client trouvé" />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-ink-100 bg-white lg:block">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-100 bg-sand-100/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                <tr>
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3">Téléphone</th>
                  <th className="px-4 py-3">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {clients.map((client: any) => (
                  <tr key={client.id} className="align-middle">
                    <td className="px-4 py-3 font-medium text-ink-900">{client.first_name} {client.last_name}</td>
                    <td className="px-4 py-3 text-ink-600">{client.email}</td>
                    <td className="px-4 py-3 text-ink-600">{client.phone || '—'}</td>
                    <td className="px-4 py-3 text-xs text-ink-400">{formatDateTime(client.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {clients.map((client: any) => (
              <div key={client.id} className="rounded-2xl border border-ink-100 bg-white p-4">
                <p className="font-semibold text-ink-900">{client.first_name} {client.last_name}</p>
                <p className="mt-0.5 break-all text-sm text-ink-500">{client.email}</p>
                {client.phone && <p className="text-sm text-ink-500">{client.phone}</p>}
                <p className="mt-1 text-xs text-ink-400">Inscrit le {formatDateTime(client.created_at)}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
