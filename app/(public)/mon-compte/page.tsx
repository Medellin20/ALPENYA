import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, CalendarClock, ShieldCheck, Search } from 'lucide-react';
import { getClientDossierByEmail } from '@/lib/data/dossier';
import { StatusTimeline } from '@/components/shared/status-timeline';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { getReservationTimelineSteps, getViewingTimelineSteps } from '@/lib/utils/timeline';
import { formatDate } from '@/lib/utils/format';
import { RESERVATION_STATUS_LABELS, VIEWING_STATUS_LABELS } from '@/lib/utils/constants';

export const metadata: Metadata = { title: 'Mon compte' };

export default async function MonComptePage({ searchParams }: { searchParams: { email?: string } }) {
  const email = searchParams.email?.trim();

  if (!email) {
    return <EmailLookupScreen />;
  }

  const dossier = await getClientDossierByEmail(email);

  if (!dossier) {
    return <EmailLookupScreen notFoundEmail={email} />;
  }

  return (
    <div className="container-app py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="text-display-sm font-extrabold text-ink-900 sm:text-display-md">Mon compte</h1>
        <p className="mt-2 text-ink-500">
          Bonjour {dossier.client.first_name}, voici le suivi de vos démarches auprès d’ALPENYA.
        </p>
      </div>

      {/* RÉSERVATIONS */}
      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink-900">
          <ShieldCheck className="h-5 w-5 text-canal-600" />
          Mes réservations
        </h2>

        {dossier.reservations.length === 0 ? (
          <EmptyState
            title="Aucune réservation pour le moment"
            description="Parcourez nos chalets et villas et démarrez votre prochaine réservation."
            action={
              <Button asChild><Link href="/appartements">Voir les chalets et villas</Link></Button>
            }
          />
        ) : (
          <div className="space-y-6">
            {dossier.reservations.map((reservation: any) => (
                <div key={reservation.id} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                        {reservation.reference}
                      </p>
                      <Link
                        href={`/appartements/${reservation.properties?.slug}`}
                        className="text-base font-bold text-ink-900 hover:text-canal-600"
                      >
                        {reservation.properties?.title}
                      </Link>
                      <p className="mt-0.5 text-sm text-ink-500">
                        Entrée souhaitée le {formatDate(reservation.desired_move_in_date)} ·{' '}
                        {reservation.duration_months} jour{reservation.duration_months > 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge variant="outline">{RESERVATION_STATUS_LABELS[reservation.status]}</Badge>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-5">
                    <div className="lg:col-span-2">
                      <StatusTimeline steps={getReservationTimelineSteps(reservation.status)} />
                    </div>

                    <div className="lg:col-span-3">
                      {reservation.status === 'submitted' && (
                        <p className="text-sm text-ink-400">
                          Votre demande est en attente d’examen. Notre équipe vous contactera pour
                          organiser manuellement la suite.
                        </p>
                      )}

                      {reservation.status === 'rejected' && (
                        <p className="text-sm text-brick-500">
                          Votre demande n’a malheureusement pas pu être acceptée pour ce logement.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
            ))}
          </div>
        )}
      </section>

      {/* VISITES */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink-900">
          <CalendarClock className="h-5 w-5 text-canal-600" />
          Mes demandes de visite
        </h2>

        {dossier.viewings.length === 0 ? (
          <EmptyState title="Aucune visite demandée" description="Réservez une visite depuis la fiche d’un logement." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {dossier.viewings.map((viewing: any) => (
              <div key={viewing.id} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                      {viewing.reference}
                    </p>
                    <Link
                      href={`/appartements/${viewing.properties?.slug}`}
                      className="font-bold text-ink-900 hover:text-canal-600"
                    >
                      {viewing.properties?.title}
                    </Link>
                  </div>
                  <Badge variant="outline">{VIEWING_STATUS_LABELS[viewing.status]}</Badge>
                </div>
                <p className="mt-1.5 text-sm text-ink-500">
                  {formatDate(viewing.requested_date)} · {viewing.requested_time_slot}
                </p>
                <div className="mt-4">
                  <StatusTimeline steps={getViewingTimelineSteps(viewing.status)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmailLookupScreen({ notFoundEmail }: { notFoundEmail?: string }) {
  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-14">
      <div className="w-full max-w-md rounded-2xl border border-ink-100 bg-white p-8 shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-canal-50 text-canal-600">
          <Mail className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-center text-xl font-extrabold text-ink-900">Accéder à mon dossier</h1>
        <p className="mt-1.5 text-center text-sm text-ink-500">
          Saisissez l’adresse e-mail utilisée lors de votre demande de visite ou de réservation.
        </p>

        {notFoundEmail && (
          <p className="mt-4 rounded-lg bg-brick-50 px-3 py-2 text-center text-xs text-brick-600">
            Aucun dossier trouvé pour « {notFoundEmail} ». Vérifiez l’orthographe de votre e-mail.
          </p>
        )}

        <form action="/mon-compte" method="get" className="mt-6 space-y-3">
          <Input type="email" name="email" placeholder="vous@exemple.com" required defaultValue={notFoundEmail} />
          <Button type="submit" className="w-full">
            <Search className="h-4 w-4" />
            Accéder à mon dossier
          </Button>
        </form>
      </div>
    </div>
  );
}
