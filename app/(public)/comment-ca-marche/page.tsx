import type { Metadata } from 'next';
import { Search, CalendarClock, FileCheck2, KeyRound, Building2, PenTool } from 'lucide-react';
import { FadeIn } from '@/components/ui/fade-in';
import { SectionHeading } from '@/components/ui/section-heading';

export const metadata: Metadata = {
  title: 'Comment ça marche',
  description: 'Découvrez les étapes pour trouver, visiter et réserver votre chalet ou villa avec ALPENIA.',
};

const STEPS = [
  {
    icon: Search,
    title: 'Recherchez un logement',
    description:
      'Filtrez notre catalogue par ville, budget, nombre de chambres et type de logement pour trouver les annonces qui vous correspondent.',
  },
  {
    icon: Building2,
    title: 'Choisissez un chalet ou une villa',
    description:
      'Consultez les photos, la description détaillée, les équipements et la localisation approximative de chaque logement.',
  },
  {
    icon: CalendarClock,
    title: 'Réservez une visite',
    description:
      'Sélectionnez une date et un créneau horaire, renseignez vos coordonnées, puis envoyez votre demande.',
  },
  {
    icon: PenTool,
    title: 'Effectuez les formalités',
    description:
      'Indiquez simplement vos coordonnées, la date souhaitée et la durée de votre séjour.',
  },
  {
    icon: FileCheck2,
    title: 'Réservez le logement',
    description:
      'Une fois votre dossier examiné et accepté par notre équipe, votre demande de réservation est validée.',
  },
  {
    icon: KeyRound,
    title: 'Emménagez',
    description: 'Votre dossier validé, l’agence organise manuellement les formalités et la remise des clés.',
  },
];

export default function CommentCaMarchePage() {
  return (
    <div className="container-app py-14 sm:py-20">
      <FadeIn>
        <SectionHeading
          eyebrow="Notre processus"
          title="Comment ça marche"
          description="De la première recherche à la remise des clés, voici comment se déroule votre parcours avec ALPENIA."
        />
      </FadeIn>

      <div className="mt-14 space-y-8">
        {STEPS.map((step, i) => (
          <FadeIn key={step.title} delay={i * 0.05}>
            <div className="flex gap-5 sm:gap-8">
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink-700 text-white sm:h-14 sm:w-14">
                  <step.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                {i < STEPS.length - 1 && <div className="mt-2 w-px flex-1 bg-ink-100" />}
              </div>
              <div className="pb-8">
                <span className="text-eyebrow text-canal-600">Étape {i + 1}</span>
                <h2 className="mt-1 text-lg font-bold text-ink-900 sm:text-xl">{step.title}</h2>
                <p className="mt-2 max-w-2xl leading-relaxed text-ink-500">{step.description}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
