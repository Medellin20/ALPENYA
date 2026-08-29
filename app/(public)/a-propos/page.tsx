import type { Metadata } from 'next';
import { ShieldCheck, MapPinned, Users, Clock } from 'lucide-react';
import { FadeIn } from '@/components/ui/fade-in';
import { SectionHeading } from '@/components/ui/section-heading';

export const metadata: Metadata = {
  title: 'À propos',
  description: 'ALPENYA sélectionne et gère des chalets et villas d’exception en France.',
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Confiance',
    description: 'Chaque annonce est vérifiée par notre équipe avant publication.',
  },
  {
    icon: MapPinned,
    title: 'Expertise locale',
    description: 'Une connaissance fine des destinations de montagne, du littoral et de leurs spécificités.',
  },
  {
    icon: Users,
    title: 'Accompagnement',
    description: 'Un suivi personnalisé de la recherche jusqu’à l’emménagement.',
  },
  {
    icon: Clock,
    title: 'Réactivité',
    description: 'Des délais de réponse rapides pour ne pas manquer le bon logement.',
  },
];

export default function AProposPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-ink-950 py-20 sm:py-28">
        <div className="container-app relative">
          <FadeIn>
            <span className="text-eyebrow uppercase text-sand-300">Notre agence</span>
            <h1 className="mt-3 max-w-2xl text-display-md font-extrabold text-white sm:text-display-lg">
              Votre partenaire pour des lieux d’exception en France
            </h1>
            <p className="mt-4 max-w-xl text-sand-200">
              ALPENYA accompagne voyageurs et locataires dans la découverte, la visite et la
              réservation de chalets et villas soigneusement sélectionnés.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-app max-w-3xl">
          <FadeIn>
            <SectionHeading
              eyebrow="Notre mission"
              title="Rendre la location haut de gamme simple et transparente"
            />
            <p className="mt-4 leading-relaxed text-ink-500">
              ALPENYA réunit sur une même plateforme des annonces vérifiées, un processus de visite
              structuré et un suivi rigoureux de chaque réservation, de la première demande jusqu’à
              la remise des clés.
            </p>
            <p className="mt-4 leading-relaxed text-ink-500">
              Nous travaillons avec des propriétaires et gestionnaires dans les destinations les
              plus recherchées de France afin de proposer des chalets et villas adaptés à différents
              projets de séjour.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-ink-100 bg-white py-16 sm:py-20">
        <div className="container-app">
          <FadeIn>
            <SectionHeading eyebrow="Nos valeurs" title="Ce qui nous guide au quotidien" align="center" className="mx-auto" />
          </FadeIn>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, i) => (
              <FadeIn key={value.title} delay={i * 0.06}>
                <div className="rounded-2xl border border-ink-100 bg-white p-6 text-center shadow-soft">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-canal-50 text-canal-700">
                    <value.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-bold text-ink-900">{value.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-500">{value.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
