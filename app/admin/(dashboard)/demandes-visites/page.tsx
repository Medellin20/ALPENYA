import type { Metadata } from 'next';
import { getVisitRequests, REQUEST_STATUS_LABELS, REQUEST_STATUS_OPTIONS } from '@/lib/data/form-requests';
import { updateVisitRequestStatus } from '@/actions/admin-form-requests';
import { StatusSelect } from '@/components/admin/status-select';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatDateTime } from '@/lib/utils/format';
import type { RequestStatus } from '@/types/database';

export const metadata: Metadata = { title: 'Demandes de visite' };
export const dynamic = 'force-dynamic';

export default async function VisitRequestsPage() {
  const requests = await getVisitRequests();
  return <section>
    <header className="mb-6">
      <h1 className="text-2xl font-extrabold text-ink-900">Demandes de visite</h1>
      <p className="mt-1 text-sm text-ink-500">{requests.length} demande(s) reçue(s) depuis le formulaire Visite.</p>
    </header>
    {requests.length === 0 ? <EmptyState title="Aucune demande de visite" /> : <div className="space-y-3">
      {requests.map((request) => <article key={request.id} className="rounded-2xl border border-ink-100 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{request.reference}</p>
            <p className="font-bold text-ink-900">{request.properties?.title ?? 'Bien supprimé'}</p>
            <p className="text-sm text-ink-500">{request.properties?.city}</p></div>
          <Badge variant="outline">{REQUEST_STATUS_LABELS[request.status as RequestStatus]}</Badge>
        </div>
        <div className="mt-3 grid gap-2 text-sm text-ink-600 sm:grid-cols-2 lg:grid-cols-4">
          <p>Client : {request.first_name} {request.last_name}</p><p>E-mail : {request.email}</p>
          <p>Téléphone : {request.phone}</p><p>Visite : {formatDate(request.requested_date)} · {request.requested_time_slot}</p>
        </div>
        <div className="mt-3 flex flex-col gap-3 border-t border-ink-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-ink-400">Reçue le {formatDateTime(request.created_at)}</span>
          <StatusSelect value={request.status as RequestStatus} options={REQUEST_STATUS_OPTIONS} entityId={request.id} onUpdate={updateVisitRequestStatus} />
        </div>
      </article>)}
    </div>}
  </section>;
}
