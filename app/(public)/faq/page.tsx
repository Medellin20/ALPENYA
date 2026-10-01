import type { Metadata } from 'next';
import { Accordion } from '@/components/shared/accordion';
import { FadeIn } from '@/components/ui/fade-in';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Questions fréquentes sur les demandes de visite et de réservation chez ALPENIA.',
};

const CATEGORIES = [
  {
    title: 'Visites',
    items: [
      {
        question: 'Comment réserver une visite ?',
        answer:
          'Depuis la fiche d’un logement, cliquez sur « Réserver une visite », choisissez une date et un créneau, puis envoyez votre demande. Notre équipe vous contacte ensuite pour confirmer le rendez-vous.',
      },
      {
        question: 'Comment régler les frais de visite ?',
        answer:
          'Après l’envoi de votre demande, les coordonnées bancaires et votre référence de virement sont affichées. Les frais de visite sont à régler avant le rendez-vous et vous seront remboursés si l’intérieur du logement ne correspond pas à ce qui vous a été présenté.',
      },
      {
        question: 'Puis-je changer la date de ma visite ?',
        answer:
          'Oui, contactez notre équipe via le formulaire de contact en indiquant votre référence de visite ; nous vous proposerons un nouveau créneau disponible.',
      },
    ],
  },
  {
    title: 'Réservation',
    items: [
      {
        question: 'Que se passe-t-il après l’envoi de ma demande de réservation ?',
        answer:
          'Notre équipe examine votre demande et vos dates de séjour, puis vous contacte pour organiser les formalités suivantes.',
      },
      {
        question: 'Quels documents dois-je fournir ?',
        answer:
          'Selon le logement, une pièce d’identité, un justificatif de revenus et une lettre de recommandation ou de garant peuvent être demandés lors de la finalisation de votre dossier.',
      },
    ],
  },
  {
    title: 'Délais',
    items: [
      {
        question: 'Sous quel délai recevrai-je une réponse à ma demande ?',
        answer:
          'Nous répondons généralement aux demandes de visite et de réservation sous 48 heures ouvrées.',
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
          Tout ce qu’il faut savoir pour demander une visite ou réserver un logement.
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
