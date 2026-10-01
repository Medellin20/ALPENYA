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

      <h2>Demandes déjà enregistrées</h2>
      <p>
        Les demandes de visite et de réservation soumises auparavant restent suivies par ALPENIA
        selon les informations communiquées lors de leur enregistrement. Pour toute question sur un
        dossier existant ou une annonce, utilisez le formulaire de contact du site.
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
