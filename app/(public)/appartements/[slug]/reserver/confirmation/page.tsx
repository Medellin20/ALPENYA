import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock3, Home } from 'lucide-react';
import { getReservationByReference } from '@/lib/data/dossier';
import { ReservationPaymentNotice } from '@/components/forms/reservation-payment-notice';
import { ReservationProgress } from '@/components/forms/reservation-progress';
import { RESERVATION_GUARANTEE_AMOUNT } from '@/lib/utils/reservation-payment';
import { Button } from '@/components/ui/button';
import { RESERVATION_STATUS_LABELS } from '@/lib/utils/constants';
import { formatDate } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Demande de réservation en attente de confirmation' };

export default async function ReservationConfirmationPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  if (!searchParams.ref) notFound();
  const reservation = await getReservationByReference(searchParams.ref);
  if (!reservation) notFound();

  const property = (reservation as any).properties;

  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-6 sm:py-14">
      <div className="w-full max-w-2xl rounded-2xl border border-ink-100 bg-white p-4 text-center shadow-card sm:p-8">
        <ReservationProgress activeStep={3} />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <Clock3 className="h-7 w-7" />
        </div>

        <h1 className="mt-5 text-xl font-extrabold text-ink-900">
          Votre demande de réservation est en attente de confirmation
        </h1>

        <p className="mt-2 text-sm text-ink-500">
          Votre demande a bien été transmise à notre équipe. Elle sera confirmée après examen de votre dossier ; nous vous contacterons pour vous informer de la suite.
        </p>

        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-relaxed text-amber-800">
          Aucun paiement n’est à effectuer avant la confirmation de votre réservation par notre équipe.
        </p>

        <p className="mt-2 text-sm text-ink-500">
          Numéro de réservation : <span className="font-semibold text-ink-700">{reservation.reference}</span>
        </p>

        <div className="mt-6 space-y-2 rounded-xl bg-sand-100/60 p-4 text-left text-sm">
          <Row label="Logement" value={property?.title ?? '—'} />
          <Row label="Date de réservation" value={formatDate(reservation.desired_move_in_date)} />
          <Row label="Durée" value={`${reservation.duration_months} jour${reservation.duration_months > 1 ? 's' : ''}`} />
          <Row
            label="Statut"
            value={reservation.status === 'submitted'
              ? 'En attente de confirmation'
              : RESERVATION_STATUS_LABELS[reservation.status] ?? reservation.status}
          />
        </div>

        {reservation.rental_amount !== null && reservation.payment_amount !== null && (
          <div className="mt-6 text-left">
            <ReservationPaymentNotice
              rentalAmount={reservation.rental_amount}
              depositAmount={Math.round(reservation.rental_amount * 0.4 * 100) / 100}
              guaranteeAmount={RESERVATION_GUARANTEE_AMOUNT}
              cleaningFee={reservation.cleaning_fee_amount ?? 0}
              totalAmount={reservation.payment_amount}
            />
          </div>
        )}

        <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
          <Button asChild className="w-full flex-1"><Link href="/mon-compte">Suivre mon dossier</Link></Button>
          <Button asChild variant="outline" className="w-full flex-1">
            <Link href="/appartements">
              <Home className="h-4 w-4" />
              Voir d’autres logements
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-ink-400">{label}</span>
      <span className="break-words font-medium text-ink-700 sm:text-right">{value}</span>
    </div>
  );
}
