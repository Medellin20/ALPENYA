import type { Metadata } from 'next';
import { getAllRefundsAdmin } from '@/lib/data/admin-lists';
import { updateRefundStatus } from '@/actions/admin-refunds';
import { StatusSelect } from '@/components/admin/status-select';
import { Badge } from '@/components/ui/badge';
import { AutoSubmitSelect } from '@/components/admin/auto-submit-select';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDateTime, formatPrice } from '@/lib/utils/format';
import { REFUND_STATUS_LABELS } from '@/lib/utils/constants';
import type { RefundStatus } from '@/types/database';

export const metadata: Metadata = { title: 'Remboursements' };
export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = Object.entries(REFUND_STATUS_LABELS).map(([value, label]) => ({
  value: value as RefundStatus,
  label,
}));

export default async function AdminRefundsPage({ searchParams }: { searchParams: { status?: string } }) {
  const refunds = await getAllRefundsAdmin({ status: searchParams.status });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Demandes de remboursement</h1>
          <p className="mt-1 text-sm text-ink-500">{refunds.length} demande(s).</p>
        </div>
        <form action="/admin/remboursements" method="get" className="w-full sm:w-auto">
          <AutoSubmitSelect name="status" defaultValue={searchParams.status} className="sm:w-56">
            <option value="">Tous les statuts</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </AutoSubmitSelect>
        </form>
      </div>

      {refunds.length === 0 ? (
        <EmptyState title="Aucune demande de remboursement" />
      ) : (
        <div className="space-y-3">
          {refunds.map((refund: any) => (
            <div key={refund.id} className="rounded-2xl border border-ink-100 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{refund.reference}</p>
                  <p className="font-bold text-ink-900">{refund.reservations?.properties?.title ?? '—'}</p>
                  <p className="mt-0.5 text-sm text-ink-500">Réservation : {refund.reservations?.reference ?? '—'}</p>
                </div>
                <Badge variant="outline">{REFUND_STATUS_LABELS[refund.status as RefundStatus]}</Badge>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-ink-600 sm:grid-cols-2">
                <p className="break-words"><span className="text-ink-400">Client : </span>{refund.clients?.first_name} {refund.clients?.last_name} ({refund.clients?.email})</p>
                <p><span className="text-ink-400">Montant : </span>{formatPrice(refund.amount)}</p>
              </div>

              {refund.reason && (
                <p className="mt-2 rounded-lg bg-sand-100/60 px-3 py-2 text-xs text-ink-500">
                  Raison : {refund.reason}
                </p>
              )}

              <div className="mt-3 flex flex-col gap-3 border-t border-ink-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-ink-400">Demandée le {formatDateTime(refund.requested_at)}</span>
                <StatusSelect
                  value={refund.status as RefundStatus}
                  options={STATUS_OPTIONS}
                  onUpdate={(status) => updateRefundStatus(refund.id, status)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
