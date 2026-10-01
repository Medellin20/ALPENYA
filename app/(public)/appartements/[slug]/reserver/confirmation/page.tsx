import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock3, Home } from 'lucide-react';
import { ReservationProgress } from '@/components/forms/reservation-progress';
import { ReservationConfirmationToast } from '@/components/forms/reservation-confirmation-toast';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Demande de réservation en attente de confirmation' };

export default function ReservationConfirmationPage({
  searchParams,
}: {
  searchParams: { ref?: string; email?: string };
}) {
  if (!searchParams.ref) notFound();

  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-6 sm:py-14">
      <div className="w-full max-w-2xl rounded-2xl border border-ink-100 bg-white p-4 text-center shadow-card sm:p-8">
        <ReservationConfirmationToast emailSent={searchParams.email === 'sent'} />
        <ReservationProgress activeStep={3} />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <Clock3 className="h-7 w-7" />
        </div>

        <h1 className="mt-5 text-xl font-extrabold text-ink-900">
          Votre demande de réservation est en attente de confirmation
        </h1>

        <p className="mt-2 text-sm text-ink-500">
          Votre demande a bien été enregistrée et est en attente de confirmation par notre équipe. Nous vous contacterons après examen de votre dossier pour vous informer de la suite.
        </p>

        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-relaxed text-amber-800">
          Aucun paiement n’est à effectuer avant la confirmation de votre réservation par notre équipe.
        </p>

        <p className="mt-2 text-sm text-ink-500">
          Numéro de réservation : <span className="font-semibold text-ink-700">{searchParams.ref}</span>
        </p>

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
