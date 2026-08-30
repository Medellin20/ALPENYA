import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowRight, ShieldCheck, KeyRound, CalendarCheck, Building2, Quote, Star, MapPin, MountainSnow, Palmtree } from 'lucide-react';
import { FadeIn } from '@/components/ui/fade-in';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { getCityPropertySummaries } from '@/lib/data/properties';
import { formatPrice } from '@/lib/utils/format';
import { FRENCH_TESTIMONIALS } from '@/lib/data/testimonials';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'ALPENIA — Chalets et villas d’exception en France',
  description:
    "Découvrez des chalets et villas soigneusement sélectionnés en France. Visites, réservation et suivi réunis sur une plateforme claire.",
};

const STEPS = [
  {
    icon: Building2,
    title: 'Découvrez nos propriétés',
    description: 'Choisissez entre chalets et villas, puis filtrez par destination, budget et capacité.',
  },
  {
    icon: CalendarCheck,
    title: 'Réservez une visite',
    description: 'Choisissez une date et un créneau, puis envoyez gratuitement votre demande à l’agence.',
  },
  {
    icon: ShieldCheck,
    title: 'Envoyez votre réservation',
    description: 'Transmettez votre projet de location ; notre équipe examine ensuite votre dossier.',
  },
  {
    icon: KeyRound,
    title: 'Emménagez',
    description: 'Votre dossier validé, récupérez les clés de votre nouveau logement.',
  },
];

const TRUST_POINTS = [
  { value: '6', label: 'villes couvertes en France' },
  { value: '100%', label: 'annonces vérifiées par l’agence' },
  { value: '48h', label: 'délai moyen de réponse à une demande' },
];

const HERO_SLIDES = [
  {
    src: '/properties/la-clusaz/IMG_4208.jpeg',
    alt: 'Chalet enneigé à La Clusaz sous un ciel bleu',
  },
  {
    src: '/properties/megeve-mont-arbois/IMG_4259.jpeg',
    alt: 'Chalet de montagne au Mont d’Arbois à Megève',
  },
  {
    src: '/properties/grand-bornand/IMG_4225.jpeg',
    alt: 'Salon chaleureux avec vue sur les montagnes au Grand-Bornand',
  },
] as const;

export default async function HomePage() {
  const citySummaries = await getCityPropertySummaries();

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-ink-950">
        <div aria-hidden="true" className="absolute inset-0 -z-20">
          {HERO_SLIDES.map((slide, index) => (
            <Image
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="hero-slide object-cover"
            />
          ))}
        </div>
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950/90 via-ink-900/72 to-canal-900/45" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950/55 via-transparent to-ink-950/20" />

        <div className="container-app relative flex min-h-[480px] flex-col items-center justify-center py-20 text-center sm:min-h-[580px] sm:py-24">
          <FadeIn className="flex flex-col items-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-7xl lg:text-8xl">
              ALPENIA
            </h1>
            <p className="mt-4 max-w-3xl text-lg font-semibold leading-relaxed text-white drop-shadow-md sm:text-2xl">
              <span className="block">Nous sélectionnons des chalets et villas d’exception.</span>
              <span className="block">Nous vous accompagnons de la visite jusqu’à la réservation.</span>
            </p>
            <p className="mt-6 inline-flex items-center rounded-full border border-white/25 bg-white/15 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-sm sm:text-base">
              Annonces vérifiées&nbsp; · &nbsp;Réponse sous 48 h
            </p>
          </FadeIn>

        </div>
      </section>

      {/* ACCÈS PAR CATÉGORIE */}
      <section className="bg-white py-12 sm:py-16">
        <div className="container-app">
          <FadeIn>
            <SectionHeading
              eyebrow="Nos collections"
              title="Quel lieu recherchez-vous ?"
              description="Accédez directement à la catégorie qui correspond à votre prochain séjour."
              align="center"
              className="mx-auto"
            />
          </FadeIn>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <FadeIn delay={0.05}>
              <Link href="/appartements?type=chalet" className="group relative flex min-h-52 overflow-hidden rounded-3xl bg-ink-900 p-6 text-white shadow-card sm:min-h-64 sm:p-8">
                <Image src="/properties/la-clusaz/IMG_4208.jpeg" alt="Chalet en montagne" fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover opacity-55 transition duration-500 group-hover:scale-105 group-hover:opacity-45" />
                <div className="relative mt-auto">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur"><MountainSnow className="h-5 w-5" /></span>
                  <h3 className="mt-4 text-2xl font-extrabold sm:text-3xl">Chalets</h3>
                  <p className="mt-1 max-w-sm text-sm text-white/80 sm:text-base">Montagne, neige, cheminée et séjours chaleureux en famille ou entre amis.</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">Découvrir les chalets <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </div>
              </Link>
            </FadeIn>
            <FadeIn delay={0.1}>
              <Link href="/appartements?type=villa" className="group relative flex min-h-52 overflow-hidden rounded-3xl bg-canal-800 p-6 text-white shadow-card sm:min-h-64 sm:p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-canal-500/30 via-transparent to-ink-950/70" />
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10" />
                <div className="absolute -right-4 top-12 h-36 w-36 rounded-full border border-white/10" />
                <div className="relative mt-auto">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur"><Palmtree className="h-5 w-5" /></span>
                  <h3 className="mt-4 text-2xl font-extrabold sm:text-3xl">Villas</h3>
                  <p className="mt-1 max-w-sm text-sm text-white/80 sm:text-base">Littoral, jardin, piscine et espaces privilégiés pour vous retrouver.</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">Découvrir les villas <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </div>
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CHIFFRES DE CONFIANCE */}
      <section className="border-b border-ink-100 bg-white py-8">
        <div className="container-app grid grid-cols-1 gap-6 sm:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <div key={point.label} className="flex items-center gap-4">
              <span className="text-3xl font-extrabold text-ink-900">{point.value}</span>
              <span className="text-sm text-ink-500">{point.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* APPARTEMENTS CLASSÉS PAR VILLE */}
      <section className="py-16 sm:py-20">
        <div className="container-app">
          <FadeIn>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="France"
                title="Villes populaires"
                description="Choisissez une destination pour découvrir les chalets et villas disponibles."
              />
              <Button asChild variant="outline">
                <Link href="/appartements">
                  Voir tous les biens
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeIn>

          <div className="mt-9 max-w-3xl divide-y divide-ink-100">
            {citySummaries.map((summary, index) => (
              <FadeIn key={summary.city} delay={Math.min(index, 6) * 0.04}>
                <Link
                  href={`/appartements?city=${encodeURIComponent(summary.city)}`}
                  className="group flex items-center gap-4 py-4 sm:gap-6 sm:py-5"
                >
                  <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-sand-200 sm:h-28 sm:w-44 animate-float">
                    {summary.imageUrl ? (
                      <Image src={summary.imageUrl} alt={`Chalet ou villa à ${summary.city}`} fill sizes="(max-width: 640px) 112px, 176px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-canal-500"><MapPin className="h-7 w-7" /></span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xl font-extrabold text-canal-700 sm:text-2xl">{summary.city}</h3>
                    <p className="mt-1 text-sm text-ink-600 sm:text-base">{summary.count} bien{summary.count > 1 ? 's' : ''}</p>
                    <p className="mt-0.5 text-sm text-ink-500 sm:text-base">À partir de {formatPrice(summary.averagePrice)} / semaine</p>
                  </div>
                  <ArrowRight className="h-7 w-7 shrink-0 text-canal-500 transition-transform group-hover:translate-x-1 sm:h-8 sm:w-8" />
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <div className="container-app">
        <div className="canal-divider" />
      </div>

      {/* COMMENT ÇA MARCHE */}
      <section className="py-16 sm:py-20">
        <div className="container-app">
          <FadeIn>
            <SectionHeading
              eyebrow="Processus"
              title="Comment ça marche"
              description="De la recherche à l’emménagement, un parcours pensé pour vous simplifier la vie."
              align="center"
              className="mx-auto"
            />
          </FadeIn>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <FadeIn key={step.title} delay={i * 0.08}>
                <div className="relative rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
                  <span className="text-eyebrow text-ink-300">Étape {i + 1}</span>
                  <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-canal-50 text-canal-700">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-ink-900">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3} className="mt-10 text-center">
            <Button asChild variant="ghost">
              <Link href="/comment-ca-marche">
                En savoir plus sur notre processus
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* TÉMOIGNAGES CLIENTS */}
      <section className="border-y border-ink-100 bg-sand-100/60 py-16 sm:py-20">
        <div className="container-app">
          <FadeIn>
            <SectionHeading
              eyebrow="Témoignages"
             title="Ce que nos clients disent d'ALPENIA"
              description="Des retours de clients accompagnés dans leur recherche de logement en France. Faites défiler pour consulter les 50 témoignages."
            />
          </FadeIn>

          <div className="mt-9 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5 [scrollbar-width:thin]">
            {FRENCH_TESTIMONIALS.map((testimonial, index) => (
              <article
                key={index}
                className="flex min-h-64 w-[85vw] max-w-sm shrink-0 snap-start flex-col rounded-2xl border border-ink-100 bg-white p-6 shadow-soft sm:w-80"
              >
                <div className="flex items-center justify-between gap-3">
                  <Quote className="h-7 w-7 text-canal-500" aria-hidden="true" />
                  <div className="flex gap-0.5 text-amber-400" aria-label="5 étoiles sur 5">
                    {[1, 2, 3, 4, 5].map((star) => <Star key={star} className="h-3.5 w-3.5 fill-current" />)}
                  </div>
                </div>
                <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-ink-600" lang="nl">
                  “{testimonial}”
                </blockquote>
                <p className="mt-5 border-t border-ink-100 pt-4 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Client d'ALPENIA · Avis {index + 1}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="pb-20">
        <div className="container-app">
          <FadeIn>
            <div className="overflow-hidden rounded-3xl bg-ink-700 px-6 py-14 text-center sm:px-16 animate-float">
              <h2 className="text-display-sm font-extrabold text-white sm:text-display-md">
                Prêt à découvrir votre prochaine destination ?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sand-200">
                Parcourez nos annonces vérifiées et réservez une visite en quelques minutes.
              </p>
              <Button asChild variant="secondary" size="lg" className="mt-7">
                <Link href="/appartements">
                  Voir les chalets et villas disponibles
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
