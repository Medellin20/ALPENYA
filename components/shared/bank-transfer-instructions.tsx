import { AlertTriangle, Landmark } from 'lucide-react';
import type { BankSettings } from '@/types/database';
import { formatPrice } from '@/lib/utils/format';
import { CopyableField } from '@/components/shared/copyable-field';

export function BankTransferInstructions({
  bankSettings,
  reference,
  amount,
  isExample = false,
}: {
  bankSettings: BankSettings;
  reference: string;
  amount: number;
  isExample?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 sm:p-6">
      <div className="flex items-center gap-2 text-ink-700">
        <Landmark className="h-5 w-5 text-canal-600" />
        <h3 className="font-bold">Coordonnées bancaires pour votre virement</h3>
      </div>

      {isExample && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          RIB de démonstration : ne pas effectuer de virement. Remplacez-le dans l’espace administrateur.
        </div>
      )}

      <div className="mt-4 flex flex-col gap-1 rounded-xl bg-ink-700 px-4 py-3.5 text-white min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
        <span className="text-sm font-medium">Montant à verser</span>
        <span className="text-lg font-extrabold">{formatPrice(amount)}</span>
      </div>

      <div className="mt-4 space-y-3">
        <CopyableField label="Bénéficiaire" value={bankSettings.beneficiary_name} />
        <CopyableField label="IBAN" value={bankSettings.iban} mono />
        <CopyableField label="BIC" value={bankSettings.bic} mono />
        <CopyableField label="Banque" value={bankSettings.bank_name} />
        <CopyableField label="Référence à indiquer" value={reference} mono highlight />
      </div>

      {bankSettings.payment_instructions && (
        <p className="mt-4 rounded-xl bg-sand-100/70 p-3.5 text-xs leading-relaxed text-ink-500">
          {bankSettings.payment_instructions}
        </p>
      )}
    </div>
  );
}
