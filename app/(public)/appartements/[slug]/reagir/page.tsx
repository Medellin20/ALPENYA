import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, FileCheck2, ArrowRight } from 'lucide-react';
import { getPropertyBySlug } from '@/lib/data/properties';

export const metadata: Metadata = { title: 'Réagir à cette annonce' };

export default async function ReactToPropertyPage({ params }: { params: { slug: string } }) {
  const property = await getPropertyBySlug(params.slug);
  if (!property) notFound();

  return (
    <div className="container-app py-8 sm:py-16">
      <Link href={`/appartements/${property.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Retour au logement
      </Link>
      <div className="mx-auto mt-8 max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-canal-600">{property.title}</p>
        <h1 className="mt-2 text-display-sm font-extrabold text-ink-900 sm:text-display-md">
          Voulez-vous faire la réservation ou la visite ?
        </h1>
        <div className="mt-9 grid gap-5 sm:grid-cols-2">
          <Choice href={`/appartements/${property.slug}/reserver`} icon={FileCheck2} title="Réservation" description="Envoyez votre dossier pour louer ce logement." />
          <Choice href={`/appartements/${property.slug}/visite`} icon={CalendarDays} title="Visite" description="Demandez une date pour visiter ce logement." />
        </div>
      </div>
    </div>
  );
}

function Choice({ href, icon: Icon, title, description }: { href: string; icon: typeof CalendarDays; title: string; description: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-ink-100 bg-white p-7 text-left shadow-soft transition hover:-translate-y-1 hover:border-canal-300 hover:shadow-lifted">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-canal-50 text-canal-600"><Icon className="h-6 w-6" /></span>
      <h2 className="mt-5 text-xl font-extrabold text-ink-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">{description}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-canal-700">Continuer <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
    </Link>
  );
}
