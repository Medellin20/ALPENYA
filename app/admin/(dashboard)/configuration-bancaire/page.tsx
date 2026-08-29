import type { Metadata } from 'next';
import { AlertTriangle, Landmark } from 'lucide-react';
import { getBankSettings } from '@/lib/data/bank';
import { BankSettingsForm } from '@/components/admin/bank-settings-form';
import { formatDateTime } from '@/lib/utils/format';

export const metadata: Metadata = { title: 'Configuration bancaire' };
export const dynamic = 'force-dynamic';

export default async function AdminBankSettingsPage() {
  const settings = await getBankSettings();

  if (!settings) {
    return (
      <div>
        <h1 className="text-2xl font-extrabold text-ink-900">Configuration bancaire</h1>
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brick-200 bg-brick-50 p-5 text-sm text-brick-700">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Configuration introuvable</p>
            <p className="mt-1 text-brick-600">
              La table <code>bank_settings</code> ne contient aucune ligne. Exécutez le script
              <code>supabase/schema.sql</code> puis <code>supabase/seed.sql</code> dans le SQL
              Editor de votre projet Supabase.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink-900">
          <Landmark className="h-6 w-6 text-canal-600" />
          Configuration bancaire
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Ces coordonnées sont affichées au client lorsqu’il doit effectuer un virement de garantie.
          Elles sont stockées dans Supabase et ne sont jamais codées en dur dans l’application.
        </p>
        <p className="mt-1 text-xs text-ink-400">
          Dernière modification : {formatDateTime(settings.updated_at)}
        </p>
      </div>

      <div className="max-w-2xl rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
        <BankSettingsForm settings={settings} />
      </div>
    </div>
  );
}
