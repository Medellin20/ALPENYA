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

export default async function HomePage() {
  const citySummaries = await getCityPropertySummaries();

  return (
    <>
      {/* HERO ÉDITORIAL */}
      <section className="overflow-hidden bg-sand-100 pb-12 pt-8 sm:pb-16 sm:pt-12">
        <div className="container-app grid items-stretch gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-7">
          <FadeIn className="flex flex-col justify-between rounded-[2rem] bg-ink-950 p-7 text-white sm:p-10 lg:min-h-[620px] lg:p-12">
            <div>
              <p className="text-eyebrow uppercase text-canal-300">Lieux choisis · France</p>
              <h1 className="mt-7 max-w-xl text-5xl font-extrabold leading-[0.96] tracking-[-0.05em] sm:text-7xl lg:text-[5.25rem]">
                L’ailleurs,
                <span className="block font-light italic text-canal-300">autrement.</span>
              </h1>
              <p className="mt-8 max-w-md text-base leading-relaxed text-sand-200 sm:text-lg">
                Des chalets et villas singuliers, sélectionnés avec exigence. De la première visite à la remise des clés, nous avançons avec vous.
              </p>
            </div>
            <div className="mt-12 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link href="/appartements">Explorer la sélection <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link href="/comment-ca-marche">Notre approche</Link>
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={0.08} className="relative min-h-[440px] overflow-hidden rounded-[2rem] sm:min-h-[560px] lg:min-h-[620px]">
            <Image src="/properties/la-clusaz/IMG_4208.jpeg" alt="Chalet sélectionné par ALPENIA à La Clusaz" fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/65 via-transparent to-transparent" />
            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 rounded-2xl border border-white/20 bg-white/10 p-5 text-white backdrop-blur-md sm:inset-x-7 sm:bottom-7 sm:p-6">
              <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">À la une</p><p className="mt-1 text-xl font-bold sm:text-2xl">La Clusaz</p></div>
              <Link href="/appartements?city=La%20Clusaz" aria-label="Voir les biens à La Clusaz" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-ink-950 transition-transform hover:rotate-[-12deg]"><ArrowRight className="h-5 w-5" /></Link>
            </div>
          </FadeIn>
        </div>

        <div className="container-app mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-ink-200 sm:grid-cols-3">
          {TRUST_POINTS.map((point) => <div key={point.label} className="flex items-baseline gap-3 bg-white/90 px-6 py-5"><span className="text-2xl font-extrabold text-ink-950">{point.value}</span><span className="text-sm text-ink-500">{point.label}</span></div>)}
        </div>
      </section>

      {/* ACCÈS PAR CATÉGORIE */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container-app grid gap-9 lg:grid-cols-[0.65fr_1.35fr] lg:gap-12">
          <FadeIn>
            <SectionHeading
              eyebrow="Nos collections"
              title="Deux façons de prendre le large."
              description="L’altitude ou le grand air : choisissez le décor, nous vous présentons les lieux qui ont une âme."
            />
            <p className="mt-7 hidden text-sm font-semibold uppercase tracking-[0.18em] text-ink-300 lg:block">Collection 01 — 02</p>
          </FadeIn>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <FadeIn delay={0.05}>
              <Link href="/appartements?type=chalet" className="group relative flex min-h-80 overflow-hidden rounded-[2rem] bg-ink-900 p-6 text-white shadow-card sm:min-h-[430px] sm:p-8">
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
              <Link href="/appartements?type=villa" className="group relative flex min-h-80 overflow-hidden rounded-[2rem] bg-canal-800 p-6 text-white shadow-card sm:mt-14 sm:min-h-[430px] sm:p-8">
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

      {/* APPARTEMENTS CLASSÉS PAR VILLE */}
      <section className="bg-ink-950 py-16 text-white sm:py-24">
        <div className="container-app">
          <FadeIn>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="France"
                title="Une France à habiter"
                description="Choisissez une destination pour découvrir les chalets et villas disponibles."
                className="[&_h2]:text-white [&_p]:text-sand-300"
              />
              <Button asChild variant="secondary">
                <Link href="/appartements">
                  Voir tous les biens
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeIn>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {citySummaries.map((summary, index) => (
              <FadeIn key={summary.city} delay={Math.min(index, 6) * 0.04}>
                <Link
                  href={`/appartements?city=${encodeURIComponent(summary.city)}`}
                  className="group relative flex min-h-72 overflow-hidden rounded-3xl bg-ink-900 p-6 sm:min-h-80"
                >
                  <div className="absolute inset-0 bg-ink-900">
                    {summary.imageUrl ? (
                      <Image src={summary.imageUrl} alt={`Chalet ou villa à ${summary.city}`} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover opacity-65 transition duration-500 group-hover:scale-105 group-hover:opacity-50" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-canal-500"><MapPin className="h-7 w-7" /></span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/15 to-transparent" />
                  <div className="relative mt-auto min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-canal-200">{summary.count} bien{summary.count > 1 ? 's' : ''}</p>
                    <h3 className="mt-2 truncate text-2xl font-extrabold text-white sm:text-3xl">{summary.city}</h3>
                    <p className="mt-1 text-sm text-white/70">Dès {formatPrice(summary.averagePrice)} / semaine</p>
                  </div>
                  <ArrowRight className="relative mt-auto h-6 w-6 shrink-0 text-white transition-transform group-hover:translate-x-1" />
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

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

          <div className="relative mx-auto mt-12 max-w-4xl">
            <div className="absolute bottom-10 left-5 top-10 hidden w-px bg-ink-100 sm:block" />
            {STEPS.map((step, i) => (
              <FadeIn key={step.title} delay={i * 0.08}>
                <div className="relative mb-4 grid gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:grid-cols-[2.5rem_1fr] sm:items-center sm:gap-6 sm:p-6">
                  <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ink-950 text-sm font-bold text-white">{i + 1}</div>
                  <div className="grid gap-3 sm:grid-cols-[3rem_1fr] sm:items-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-canal-50 text-canal-700">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div><h3 className="text-base font-bold text-ink-900">{step.title}</h3><p className="mt-1 text-sm leading-relaxed text-ink-500">{step.description}</p></div>
                  </div>
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
