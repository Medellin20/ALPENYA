import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/utils/site-url';
import { Settings, ShieldCheck, ClipboardCheck, Globe } from 'lucide-react';

export const metadata: Metadata = { title: 'Paramètres' };

export default function AdminParametresPage() {
  const siteUrl = getSiteUrl();

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold text-ink-900">
        <Settings className="h-6 w-6 text-canal-600" />
        Paramètres
      </h1>

      <div className="max-w-2xl space-y-5">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-canal-600" />
            <h2 className="font-bold text-ink-900">Authentification administrateur</h2>
          </div>
          <p className="mt-2 text-sm text-ink-500">
            L’accès administrateur est protégé par un mot de passe défini dans la variable
            d’environnement <code className="rounded bg-sand-200 px-1 py-0.5 text-xs">ADMIN_PASSWORD</code>.
            Le cookie de session est signé avec{' '}
            <code className="rounded bg-sand-200 px-1 py-0.5 text-xs">ADMIN_SESSION_SECRET</code>{' '}
            et expire après 8 heures. Les tentatives de connexion sont limitées à 5 par fenêtre de
            15 minutes par adresse IP.
          </p>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5 text-canal-600" />
            <h2 className="font-bold text-ink-900">Traitement des demandes</h2>
          </div>
          <p className="mt-2 text-sm text-ink-500">
            Les demandes de visite et de réservation sont enregistrées sans paiement. L’équipe
            les examine dans l’espace administrateur et organise manuellement les étapes suivantes.
          </p>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-canal-600" />
            <h2 className="font-bold text-ink-900">URL du site</h2>
          </div>
          <p className="mt-2 text-sm text-ink-500">
            URL publique configurée :{' '}
            <code className="rounded bg-sand-200 px-1 py-0.5 text-xs">{siteUrl}</code>
          </p>
          <p className="mt-1 text-xs text-ink-400">
            Cette valeur est utilisée pour le SEO et les liens de confirmation. Modifiez{' '}
            <code className="rounded bg-sand-200 px-1 py-0.5 text-xs">NEXT_PUBLIC_SITE_URL</code>{' '}
            dans <code>.env.local</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
