import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronDown, Download, History } from 'lucide-react';
import { getAllReservationsAdmin, getReservationStatusHistory } from '@/lib/data/admin-lists';
import { updateReservationStatus } from '@/actions/admin-reservations';
import { StatusSelect } from '@/components/admin/status-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AutoSubmitSelect } from '@/components/admin/auto-submit-select';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatDateTime, formatPrice } from '@/lib/utils/format';
import { RESERVATION_STATUS_LABELS } from '@/lib/utils/constants';
import type { ReservationStatus } from '@/types/database';

export const metadata: Metadata = { title: 'Réservations' };
export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = Object.entries(RESERVATION_STATUS_LABELS).map(([value, label]) => ({
  value: value as ReservationStatus,
  label,
}));

const PENDING_STATUS_OPTIONS = STATUS_OPTIONS.filter(({ value }) =>
  ['submitted', 'under_review'].includes(value)
);

export default async function AdminReservationsPage({ searchParams }: { searchParams: { status?: string; scope?: string } }) {
  const reservations = await getAllReservationsAdmin({ status: searchParams.status, scope: searchParams.scope });
  const statusHistory = await getReservationStatusHistory(reservations.map((reservation) => reservation.id));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Réservations</h1>
          <p className="mt-1 text-sm text-ink-500">
            {reservations.length} réservation(s){searchParams.scope === 'pending' ? ' en attente' : ''}.
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:items-center">
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <a href="/api/admin/export/reservations" download>
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </a>
          </Button>
          <form action="/admin/reservations" method="get" className="w-full sm:w-auto">
            <AutoSubmitSelect name="status" defaultValue={searchParams.status} className="sm:w-56">
              <option value="">{searchParams.scope === 'pending' ? 'Toutes les réservations en attente' : 'Tous les statuts'}</option>
              {(searchParams.scope === 'pending' ? PENDING_STATUS_OPTIONS : STATUS_OPTIONS).map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </AutoSubmitSelect>
            {searchParams.scope === 'pending' && <input type="hidden" name="scope" value="pending" />}
          </form>
        </div>
      </div>

      {reservations.length === 0 ? (
        <EmptyState title="Aucune réservation" />
      ) : (
        <div className="space-y-3">
          {reservations.map((reservation: any) => (
            <div key={reservation.id} className="rounded-2xl border border-ink-100 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{reservation.reference}</p>
                  <Link href={`/admin/appartements/${reservation.property_id}`} className="font-bold text-ink-900 hover:text-canal-600">
                    {reservation.properties?.title}
                  </Link>
                  <p className="mt-0.5 text-sm text-ink-500">{reservation.properties?.city}</p>
                </div>
                <Badge variant="outline">{RESERVATION_STATUS_LABELS[reservation.status as ReservationStatus]}</Badge>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-ink-600 sm:grid-cols-2 lg:grid-cols-4">
                <p><span className="text-ink-400">Client : </span>{reservation.clients?.first_name} {reservation.clients?.last_name}</p>
                <p className="break-all"><span className="text-ink-400">E-mail : </span>{reservation.clients?.email}</p>
                <p><span className="text-ink-400">Entrée : </span>{formatDate(reservation.desired_move_in_date)}</p>
                <p><span className="text-ink-400">Durée : </span>{reservation.duration_months} mois · {reservation.occupants_count} occupant(s)</p>
                <p>
                  <span className="text-ink-400">Animaux de compagnie : </span>
                  {reservation.has_pets === true || (reservation as any).message === 'ANIMAUX_DE_COMPAGNIE_OUI' ? 'Oui' : 'Non'}
                </p>
              </div>


              <details className="group mt-3 rounded-xl border border-ink-100 bg-sand-100/30">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-sm font-semibold text-ink-700">
                  <span className="flex items-center gap-2">
                    <History className="h-4 w-4 text-canal-600" />
                    Historique de la réservation
                  </span>
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-ink-100 px-3 py-2">
                  {(statusHistory[reservation.id] ?? []).length === 0 ? (
                    <p className="py-2 text-xs text-ink-400">Aucun changement enregistré.</p>
                  ) : (
                    <ol className="space-y-2 py-1">
                      {(statusHistory[reservation.id] ?? []).map((entry) => (
                        <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="text-ink-600">
                            {entry.from_status ? `${RESERVATION_STATUS_LABELS[entry.from_status] ?? entry.from_status} → ` : ''}
                            <strong>{RESERVATION_STATUS_LABELS[entry.to_status] ?? entry.to_status}</strong>
                            <span className="ml-1 text-ink-400">par {entry.changed_by}</span>
                          </span>
                          <time className="text-ink-400">{formatDateTime(entry.created_at)}</time>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </details>

              <div className="mt-3 flex flex-col gap-3 border-t border-ink-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-ink-400">Reçue le {formatDateTime(reservation.created_at)}</span>
                <StatusSelect
                  value={reservation.status as ReservationStatus}
                  options={STATUS_OPTIONS}
                  onUpdate={(status) => updateReservationStatus(reservation.id, status)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
