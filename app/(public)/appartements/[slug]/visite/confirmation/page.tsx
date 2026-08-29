import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Home } from 'lucide-react';
import { getViewingByReference } from '@/lib/data/dossier';
import { Button } from '@/components/ui/button';
import { VIEWING_STATUS_LABELS } from '@/lib/utils/constants';
import { formatDate } from '@/lib/utils/format';

export const metadata = { title: 'Demande de visite envoyée' };

export default async function ViewingConfirmationPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  if (!searchParams.ref) notFound();
  const viewing = await getViewingByReference(searchParams.ref);
  if (!viewing) notFound();

  const property = (viewing as any).properties;
  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-6 sm:py-14">
      <div className="w-full max-w-2xl rounded-2xl border border-ink-100 bg-white p-4 text-center shadow-card sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-canal-50 text-canal-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <h1 className="mt-5 text-xl font-extrabold text-ink-900">
          Votre demande de visite est envoyée
        </h1>

        <p className="mt-2 text-sm text-ink-500">
          Référence : <span className="font-semibold text-ink-700">{viewing.reference}</span>
        </p>

        <div className="mt-6 space-y-2 rounded-xl bg-sand-100/60 p-4 text-left text-sm">
          <Row label="Logement" value={property?.title ?? '—'} />
          <Row label="Date" value={formatDate(viewing.requested_date)} />
          <Row label="Créneau" value={viewing.requested_time_slot} />
          <Row label="Statut" value={VIEWING_STATUS_LABELS[viewing.status] ?? viewing.status} />
        </div>

        <p className="mt-4 text-sm text-ink-500">
          Notre équipe va examiner votre demande et vous contactera pour confirmer le rendez-vous.
          Aucun paiement ni justificatif bancaire n’est demandé sur le site.
        </p>

        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold leading-relaxed text-red-700">
          Si vous ne recevez pas une confirmation par mail ou par WhatsApp en moins de 24 h, sachez que votre dossier a été rejeté.
        </p>

        <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
          <Button asChild variant="outline" className="w-full flex-1"><Link href="/mon-compte">Suivre mon dossier</Link></Button>
          <Button asChild className="w-full flex-1">
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
