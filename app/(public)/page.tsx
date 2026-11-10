import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowRight, ShieldCheck, KeyRound, CalendarCheck, Building2, Quote, Star, MapPin, MountainSnow, Palmtree, Caravan } from 'lucide-react';
import { FadeIn } from '@/components/ui/fade-in';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { PropertyCarousel } from '@/components/properties/property-carousel';
import { PropertyCard } from '@/components/properties/property-card';
import { getCityPropertySummaries, getFeaturedProperties } from '@/lib/data/properties';
import { FRENCH_TESTIMONIALS } from '@/lib/data/testimonials';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'LOCAVIA — Biens à louer en France',
  description:
    "Découvrez des chalets, villas, appartements meublés et mobil-homes en France. Visites, réservation et suivi réunis sur une plateforme claire.",
};

const STEPS = [
  {
    icon: Building2,
    title: 'Découvrez nos propriétés',
    description: 'Choisissez votre type de logement, puis filtrez par destination, budget et capacité.',
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
  const [citySummaries, featuredProperties] = await Promise.all([
    getCityPropertySummaries(),
    getFeaturedProperties(9),
  ]);

  return (
    <>
      {/* HERO PANORAMIQUE */}
      <section className="locavia-hero px-3 pb-12 pt-3 sm:px-6 sm:pb-16 lg:px-8">
        <div className="relative mx-auto max-w-[1536px] overflow-hidden rounded-2xl bg-ink-950">
          <Image src="/properties/grand-bornand/IMG_4225.jpeg" alt="Salon lumineux au Grand-Bornand, ouvert sur les montagnes" fill priority sizes="100vw" className="hero-photograph object-cover object-[65%_center]" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/90 via-ink-950/55 to-ink-950/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/50 via-transparent to-transparent" />
          <div className="hero-copy relative mx-auto flex min-h-[570px] max-w-7xl flex-col justify-center px-6 py-16 text-white sm:min-h-[650px] sm:px-12 lg:min-h-[690px] lg:px-16">
            <div>
              <p className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-canal-200 sm:text-xs">L’immobilier, avec attention</p>
              <h1 className="mt-8 max-w-3xl font-serif text-[3.3rem] font-normal leading-[1.02] tracking-[-0.035em] sm:text-7xl lg:text-[6.1rem]">L’art de trouver<span className="block italic text-canal-200">votre place.</span></h1>
              <p className="mt-7 max-w-md text-sm leading-7 text-white/85 sm:text-base">Des chalets, villas, appartements meublés et mobil-homes choisis avec exigence. Un lieu qui vous ressemble, un accompagnement à chaque étape.</p>
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="w-full bg-sand-100 text-ink-950 hover:bg-white min-[430px]:w-auto"><Link href="/appartements">Découvrir nos biens <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild size="lg" variant="outline" className="w-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white min-[430px]:w-auto"><Link href="/comment-ca-marche">L’expérience Locavia</Link></Button>
            </div>
            <div className="absolute bottom-7 right-8 hidden items-center gap-3 text-white/80 lg:flex"><MapPin className="h-4 w-4 text-canal-200" /><span className="text-xs tracking-wide">Le Grand-Bornand · France</span></div>
          </div>
        </div>
        <div className="container-app mt-7 grid grid-cols-1 divide-y divide-ink-200/60 sm:mt-9 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {TRUST_POINTS.map((point) => <div key={point.label} className="flex items-center gap-4 px-3 py-4 sm:justify-center sm:px-5"><span className="shrink-0 font-serif text-3xl text-ink-950">{point.value}</span><span className="max-w-[175px] text-xs leading-relaxed text-ink-600">{point.label}</span></div>)}
        </div>
      </section>

      {/* ACCÈS PAR CATÉGORIE */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container-app grid gap-10">
          <FadeIn>
            <SectionHeading
              eyebrow="Nos collections"
              title="Quatre façons de se sentir chez soi."
              description="Un séjour à la montagne, une villa, un appartement prêt à vivre ou une pause en plein air : trouvez votre lieu."
            />
            <p className="mt-5 text-xs font-medium uppercase tracking-[0.2em] text-ink-500">Collections 01 — 04</p>
          </FadeIn>
          <div className="collection-grid grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FadeIn delay={0.05} className="min-w-0">
              <Link href="/appartements?type=chalet" className="estate-card group relative flex h-full min-h-72 overflow-hidden rounded-2xl bg-ink-900 p-3 text-white shadow-card min-[400px]:min-h-80 sm:min-h-[360px] sm:p-6">
                <Image src="/properties/la-clusaz/IMG_4208.jpeg" alt="Chalet en montagne" fill sizes="(max-width: 1024px) 50vw, 34vw" className="object-cover opacity-55 transition duration-500 motion-safe:group-hover:scale-[1.035] group-hover:opacity-45" />
                <div className="relative mt-auto">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur"><MountainSnow className="h-5 w-5" /></span>
                  <h3 className="mt-4 text-2xl font-extrabold sm:text-3xl">Chalets</h3>
                  <p className="mt-1 max-w-sm text-sm text-white/80 sm:text-base">Montagne, neige, cheminée et séjours chaleureux en famille ou entre amis.</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold sm:text-sm">Découvrir les chalets <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" /></span>
                </div>
              </Link>
            </FadeIn>
            <FadeIn delay={0.1} className="min-w-0">
              <Link href="/appartements?type=villa" className="estate-card group relative flex h-full min-h-72 overflow-hidden rounded-2xl bg-canal-800 p-3 text-white shadow-card min-[400px]:min-h-80 sm:min-h-[360px] sm:p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-canal-500/30 via-transparent to-ink-950/70" />
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10" />
                <div className="absolute -right-4 top-12 h-36 w-36 rounded-full border border-white/10" />
                <div className="relative mt-auto">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur"><Palmtree className="h-5 w-5" /></span>
                  <h3 className="mt-4 text-2xl font-extrabold sm:text-3xl">Villas</h3>
                  <p className="mt-1 max-w-sm text-sm text-white/80 sm:text-base">Littoral, jardin, piscine et espaces privilégiés pour vous retrouver.</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold sm:text-sm">Découvrir les villas <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" /></span>
                </div>
              </Link>
            </FadeIn>
            {[
              { type: 'furnished_studio', title: 'Appartements meublés', description: 'Un appartement équipé et prêt à vivre, pour vous installer simplement.', icon: Building2, image: '/images/categories/appartement-meuble.png', color: 'bg-ink-950 text-white', action: 'Trouver mon appartement' },
              { type: 'mobile_home', title: 'Mobil-homes', description: 'Une terrasse, du grand air et un pied-à-terre pour vos prochaines vacances.', icon: Caravan, image: '/images/categories/mobil-home.png', color: 'bg-ink-950 text-white', action: 'Découvrir les mobil-homes' },
            ].map(({ type, title, description, icon: Icon, image, color, action }, index) => (
              <FadeIn key={type} delay={0.15 + index * 0.05} className="min-w-0">
                <Link href={`/appartements?type=${type}`} className={`estate-card group relative flex h-full min-h-72 flex-col overflow-hidden rounded-2xl p-5 shadow-card sm:min-h-[360px] sm:p-6 ${color}`}>
                  <Image src={image} alt="" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover transition duration-500 motion-safe:group-hover:scale-[1.035]" />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/55 to-ink-950/20" />
                  <Icon className="relative mb-8 h-12 w-12 stroke-1" aria-hidden="true" />
                  <div className="relative mt-auto">
                    <h3 className="break-words text-2xl font-extrabold xl:text-2xl">{title}</h3>
                    <p className="mt-3 text-sm leading-relaxed sm:text-base">{description}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold sm:text-sm">{action}<ArrowRight className="h-4 w-4 shrink-0 transition-transform motion-safe:group-hover:translate-x-1" /></span>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {featuredProperties.length > 0 && (
        <section className="bg-sand-100 py-12 sm:py-20">
          <div className="container-app">
            <FadeIn>
              <div className="flex flex-wrap items-end justify-between gap-5">
                <SectionHeading eyebrow="La sélection Locavia" title="Des lieux à découvrir" description="Explorez nos annonces et trouvez le logement qui vous correspond." />
                <Button asChild variant="outline"><Link href="/appartements">Tous les biens <ArrowRight className="h-4 w-4" /></Link></Button>
              </div>
            </FadeIn>
            <div className="mt-4">
              <PropertyCarousel>
                {featuredProperties.map(property => <PropertyCard key={property.id} property={property} />)}
              </PropertyCarousel>
            </div>
          </div>
        </section>
      )}

      {/* APPARTEMENTS CLASSÉS PAR VILLE */}
      <section className="bg-ink-950 py-16 text-white sm:py-24">
        <div className="container-app">
          <FadeIn>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="France"
                title="Une France à habiter"
                description="Choisissez une destination pour découvrir les biens disponibles."
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

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {citySummaries.map((summary, index) => (
              <FadeIn key={summary.city} className="min-w-0" delay={Math.min(index, 6) * 0.04}>
                <Link
                  href={`/appartements?city=${encodeURIComponent(summary.city)}`}
                  className="estate-card group relative flex min-h-64 overflow-hidden rounded-2xl bg-ink-900 p-5 sm:min-h-80 sm:rounded-3xl sm:p-6"
                >
                  <div className="absolute inset-0 bg-ink-900">
                    {summary.imageUrl ? (
                      <Image src={summary.imageUrl} alt={`Logement à ${summary.city}`} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover opacity-65 transition duration-500 motion-safe:group-hover:scale-[1.035] group-hover:opacity-50" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-canal-500"><MapPin className="h-7 w-7" /></span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/15 to-transparent" />
                  <div className="relative mt-auto min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-canal-200">{summary.count} bien{summary.count > 1 ? 's' : ''}</p>
                    <h3 className="mt-2 truncate text-2xl font-extrabold text-white sm:text-3xl">{summary.city}</h3>
                    <p className="mt-1 text-sm text-white/70">Découvrir les logements</p>
                  </div>
                  <ArrowRight className="relative mt-auto h-6 w-6 shrink-0 text-white transition-transform motion-safe:group-hover:translate-x-1" />
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

          <div className="relative mx-auto mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="hidden" />
            {STEPS.map((step, i) => (
              <FadeIn key={step.title} delay={i * 0.08} className="h-full">
                <div className="relative flex h-full flex-col gap-6 border-t border-ink-200 py-6">
                  <div className="relative z-10 font-serif text-4xl italic text-canal-600">0{i + 1}</div>
                  <div className="grid gap-4">
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
             title="Ce que nos clients disent de LOCAVIA"
              description="Des retours de clients accompagnés dans leur recherche de logement en France. Faites défiler pour consulter les 50 témoignages."
            />
          </FadeIn>

          <div className="mt-9 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5 [scrollbar-width:thin]">
            {FRENCH_TESTIMONIALS.map((testimonial, index) => (
              <article
                key={testimonial.name}
                className="flex min-h-64 w-[calc(100vw-3rem)] max-w-sm shrink-0 snap-start flex-col rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:w-80 sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <Quote className="h-7 w-7 text-canal-500" aria-hidden="true" />
                  <div className="flex gap-0.5 text-amber-400" aria-label="5 étoiles sur 5">
                    {[1, 2, 3, 4, 5].map((star) => <Star key={star} className="h-3.5 w-3.5 fill-current" />)}
                  </div>
                </div>
                <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-ink-600" lang="fr">
                  “{testimonial.text}”
                </blockquote>
                <div className="mt-5 border-t border-ink-100 pt-4">
                  <p className="text-sm font-semibold text-ink-900">{testimonial.name}</p>
                  <p className="mt-1 text-xs text-ink-500">Client de LOCAVIA · Avis {index + 1}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="pb-20">
        <div className="container-app">
          <FadeIn>
            <div className="overflow-hidden rounded-2xl bg-ink-950 px-5 py-11 text-center sm:rounded-3xl sm:px-16 sm:py-14">
              <h2 className="font-serif text-3xl font-normal text-white sm:text-5xl">
                Prêt à découvrir votre prochaine destination ?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sand-200">
                Parcourez nos annonces vérifiées et réservez une visite en quelques minutes.
              </p>
              <Button asChild variant="secondary" size="lg" className="mt-7 h-auto min-h-13 w-full whitespace-normal px-4 py-3 leading-snug sm:w-auto sm:px-7">
                <Link href="/appartements">
                  Voir les biens disponibles
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
