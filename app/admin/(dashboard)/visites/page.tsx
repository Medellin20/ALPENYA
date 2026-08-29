import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllViewingsAdmin } from '@/lib/data/admin-lists';
import { updateViewingStatus } from '@/actions/admin-viewings';
import { StatusSelect } from '@/components/admin/status-select';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { AutoSubmitSelect } from '@/components/admin/auto-submit-select';
import { formatDate, formatDateTime } from '@/lib/utils/format';
import { VIEWING_STATUS_LABELS } from '@/lib/utils/constants';
import type { ViewingStatus } from '@/types/database';

export const metadata: Metadata = { title: 'Demandes de visite' };
export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = Object.entries(VIEWING_STATUS_LABELS).map(([value, label]) => ({
  value: value as ViewingStatus,
  label,
}));

export default async function AdminViewingsPage({ searchParams }: { searchParams: { status?: string; date?: string } }) {
  const today = new Date().toISOString().slice(0, 10);
  const viewings = await getAllViewingsAdmin({
    status: searchParams.status,
    date: searchParams.date === 'today' ? today : undefined,
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Demandes de visite</h1>
          <p className="mt-1 text-sm text-ink-500">
            {viewings.length} demande(s){searchParams.date === 'today' ? ' prévue(s) aujourd’hui' : ''}.
          </p>
        </div>
        <form action="/admin/visites" method="get" className="w-full sm:w-auto">
          <AutoSubmitSelect name="status" defaultValue={searchParams.status} className="sm:w-56">
            {searchParams.date === 'today' && <option value="">Toutes les visites d’aujourd’hui</option>}
            {searchParams.date !== 'today' && <option value="">Tous les statuts</option>}
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </AutoSubmitSelect>
          {searchParams.date === 'today' && <input type="hidden" name="date" value="today" />}
        </form>
      </div>

      {viewings.length === 0 ? (
        <EmptyState title="Aucune demande de visite" />
      ) : (
        <div className="space-y-3">
          {viewings.map((viewing: any) => (
            <div key={viewing.id} className="rounded-2xl border border-ink-100 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{viewing.reference}</p>
                  <Link href={`/admin/appartements/${viewing.property_id}`} className="font-bold text-ink-900 hover:text-canal-600">
                    {viewing.properties?.title}
                  </Link>
                  <p className="mt-0.5 text-sm text-ink-500">{viewing.properties?.city}</p>
                </div>
                <Badge variant="outline">{VIEWING_STATUS_LABELS[viewing.status as ViewingStatus]}</Badge>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-ink-600 sm:grid-cols-2 lg:grid-cols-4">
                <p className="break-words">
                  <span className="text-ink-400">Client : </span>
                  {viewing.clients?.first_name} {viewing.clients?.last_name}
                </p>
                <p>
                  <span className="text-ink-400">Contact : </span>
                  {viewing.clients?.email} · {viewing.clients?.phone}
                </p>
                <p>
                  <span className="text-ink-400">Créneau : </span>
                  {formatDate(viewing.requested_date)} · {viewing.requested_time_slot}
                </p>
              </div>

              <div className="mt-3 flex flex-col gap-3 border-t border-ink-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-ink-400">Reçue le {formatDateTime(viewing.created_at)}</span>
                <StatusSelect
                  value={viewing.status as ViewingStatus}
                  options={STATUS_OPTIONS}
                  onUpdate={(status) => updateViewingStatus(viewing.id, status)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
