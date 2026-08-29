import type { Metadata } from 'next';
import { getAllGuaranteesAdmin } from '@/lib/data/admin-lists';
import { updateGuaranteeStatus } from '@/actions/admin-guarantees';
import { StatusSelect } from '@/components/admin/status-select';
import { Badge } from '@/components/ui/badge';
import { AutoSubmitSelect } from '@/components/admin/auto-submit-select';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatDateTime, formatPrice } from '@/lib/utils/format';
import { GUARANTEE_STATUS_LABELS } from '@/lib/utils/constants';
import type { GuaranteeStatus } from '@/types/database';

export const metadata: Metadata = { title: 'Garanties' };
export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = Object.entries(GUARANTEE_STATUS_LABELS).map(([value, label]) => ({
  value: value as GuaranteeStatus,
  label,
}));

export default async function AdminGuaranteesPage({ searchParams }: { searchParams: { status?: string } }) {
  const guarantees = await getAllGuaranteesAdmin({ status: searchParams.status });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Garanties</h1>
          <p className="mt-1 text-sm text-ink-500">{guarantees.length} dossier(s) de garantie.</p>
        </div>
        <form action="/admin/garanties" method="get" className="w-full sm:w-auto">
          <AutoSubmitSelect name="status" defaultValue={searchParams.status} className="sm:w-56">
            <option value="">Tous les statuts</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </AutoSubmitSelect>
        </form>
      </div>

      {guarantees.length === 0 ? (
        <EmptyState title="Aucun dossier de garantie" />
      ) : (
        <div className="space-y-3">
          {guarantees.map((guarantee: any) => (
            <div key={guarantee.id} className="rounded-2xl border border-ink-100 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{guarantee.reference}</p>
                  <p className="font-bold text-ink-900">{guarantee.reservations?.properties?.title ?? '—'}</p>
                  <p className="mt-0.5 text-sm text-ink-500">
                    Réservation : {guarantee.reservations?.reference ?? '—'}
                  </p>
                </div>
                <Badge variant="outline">{GUARANTEE_STATUS_LABELS[guarantee.status as GuaranteeStatus]}</Badge>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-ink-600 sm:grid-cols-2 lg:grid-cols-4">
                <p><span className="text-ink-400">Client : </span>{guarantee.clients?.first_name} {guarantee.clients?.last_name}</p>
                <p className="break-all"><span className="text-ink-400">E-mail : </span>{guarantee.clients?.email}</p>
                <p><span className="text-ink-400">Montant : </span>{formatPrice(guarantee.amount)}</p>
                {guarantee.declared_transfer_date && (
                  <p><span className="text-ink-400">Virement déclaré le : </span>{formatDate(guarantee.declared_transfer_date)}</p>
                )}
              </div>

              {guarantee.declared_bank_name && (
                <div className="mt-2 rounded-lg bg-sand-100/60 px-3 py-2 text-xs text-ink-500">
                  Banque émettrice : {guarantee.declared_bank_name}
                  {guarantee.declared_reference && <> · Réf : {guarantee.declared_reference}</>}
                  {guarantee.proof_storage_path && <> · Justificatif joint</>}
                </div>
              )}

              <div className="mt-3 flex flex-col gap-3 border-t border-ink-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-ink-400">Créée le {formatDateTime(guarantee.created_at)}</span>
                <StatusSelect
                  value={guarantee.status as GuaranteeStatus}
                  options={STATUS_OPTIONS}
                  onUpdate={(status) => updateGuaranteeStatus(guarantee.id, status)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
