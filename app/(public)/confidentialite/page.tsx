import type { Metadata } from 'next';
import { LegalPage } from '@/components/shared/legal-page';

export const metadata: Metadata = { title: 'Politique de confidentialité' };

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité" updatedAt="21 août 2026">
      <h2>Données collectées</h2>
      <p>
        Dans le cadre de vos démarches (demande de visite, réservation, contact), nous collectons :
        nom, prénom, e-mail, téléphone et informations relatives au séjour demandé
        approximatifs et les informations complémentaires que vous choisissez de nous transmettre.
      </p>

      <h2>Finalités du traitement</h2>
      <p>
        Ces données sont utilisées exclusivement pour traiter vos demandes de visite et de
        réservation, assurer le suivi de votre dossier locataire, et vous contacter dans le cadre de
        ces démarches.
      </p>

      <h2>Conservation des données</h2>
      <p>
        Vos données sont conservées pour la durée nécessaire au traitement de votre dossier, puis
        archivées conformément aux obligations légales applicables.
      </p>

      <h2>Sécurité</h2>
      <p>
        Vos données sont stockées sur une infrastructure Supabase sécurisée, protégée par des
        politiques de sécurité au niveau des lignes (Row Level Security). L’accès aux dossiers est
        réservé à notre équipe administrative.
      </p>

      <h2>Vos droits</h2>
      <p>
        Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d’un
        droit d’accès, de rectification et de suppression de vos données. Pour exercer ces droits,
        contactez-nous à contacts@alpenya.fr.
      </p>

      <h2>Cookies</h2>
      <p>
        Ce site utilise le stockage local de votre navigateur uniquement pour mémoriser vos favoris ;
        aucun cookie de suivi publicitaire n’est utilisé.
      </p>
    </LegalPage>
  );
}
