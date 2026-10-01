import type { Metadata } from 'next';
import { Accordion } from '@/components/shared/accordion';
import { FadeIn } from '@/components/ui/fade-in';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Questions fréquentes sur les annonces ALPENIA et la prise de contact avec notre équipe.',
};

const CATEGORIES = [
  {
    title: 'Annonces',
    items: [
      {
        question: 'Où trouver les informations sur un logement ?',
        answer:
          'Chaque fiche présente les photos, équipements, tarifs et principales caractéristiques du logement.',
      },
      {
        question: 'Comment obtenir des renseignements complémentaires ?',
        answer:
          'Utilisez le formulaire de contact pour envoyer votre question à notre équipe.',
      },
    ],
  },
  {
    title: 'Délais',
    items: [
      {
        question: 'Sous quel délai recevrai-je une réponse à ma demande ?',
        answer:
          'Nous répondons généralement aux messages envoyés via le formulaire de contact sous 48 heures ouvrées.',
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="container-app py-14 sm:py-20">
      <FadeIn>
        <span className="text-eyebrow uppercase text-canal-600">Aide</span>
        <h1 className="mt-2 text-display-sm font-extrabold text-ink-900 sm:text-display-md">
          Questions fréquentes
        </h1>
        <p className="mt-3 max-w-xl text-ink-500">
          Tout ce qu’il faut savoir pour consulter nos annonces et contacter l’agence.
        </p>
      </FadeIn>

      <div className="mt-12 max-w-3xl space-y-10">
        {CATEGORIES.map((category, i) => (
          <FadeIn key={category.title} delay={i * 0.05}>
            <h2 className="mb-4 text-lg font-bold text-ink-900">{category.title}</h2>
            <Accordion items={category.items} />
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
