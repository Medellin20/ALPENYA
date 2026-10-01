import type { Metadata } from 'next';
import { LegalPage } from '@/components/shared/legal-page';

export const metadata: Metadata = { title: 'Conditions générales' };

export default function ConditionsGeneralesPage() {
  return (
    <LegalPage title="Conditions générales d’utilisation" updatedAt="21 août 2026">
      <h2>Objet</h2>
      <p>
        Les présentes conditions générales régissent l’utilisation du site ALPENIA et les
        services de mise en relation pour la location de chalets et villas en France.
      </p>

      <h2>Demandes de visite</h2>
      <p>
        Les frais de visite de 50 € sont réglés par virement avant le rendez-vous. Les coordonnées
        bancaires et la référence à indiquer sont communiquées après l’envoi de la demande. Ces frais
        sont remboursés si, lors de la visite, l’intérieur du logement ne correspond pas à ce qui a
        été présenté. Le créneau demandé reste soumis à confirmation par ALPENIA.
      </p>

      <h2>Demandes de réservation</h2>
      <p>
        L’envoi d’une demande de réservation ne vaut pas acceptation définitive et ne nécessite
        aucun paiement sur le site. ALPENIA examine le dossier, communique sa décision et
        organise directement avec le client les éventuelles formalités ultérieures.
      </p>

      <h2>Responsabilité</h2>
      <p>
        ALPENIA agit en tant qu’intermédiaire entre locataires et propriétaires ou
        gestionnaires de biens. Le contrat de location définitif est conclu directement entre le
        locataire et le bailleur du logement concerné.
      </p>

      <h2>Droit applicable</h2>
      <p>Les présentes conditions générales sont soumises au droit néerlandais.</p>
    </LegalPage>
  );
}
