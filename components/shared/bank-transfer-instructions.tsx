import { AlertTriangle, Landmark, ScrollText } from 'lucide-react';
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
  reference?: string;
  amount: number | null;
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

      {amount !== null ? (
        <div className="mt-4 flex flex-col gap-1 rounded-xl bg-ink-700 px-4 py-3.5 text-white min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
          <span className="text-sm font-medium">Montant à verser</span>
          <span className="text-lg font-extrabold">{formatPrice(amount)}</span>
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">
          Le montant sera confirmé par notre équipe avant le virement.
        </p>
      )}

      <div className="mt-4 space-y-3">
        <CopyableField label="Bénéficiaire" value={bankSettings.beneficiary_name} />
        <CopyableField label="IBAN" value={bankSettings.iban} mono />
        <CopyableField label="BIC" value={bankSettings.bic} mono />
        {reference && <CopyableField label="Référence à indiquer" value={reference} mono highlight />}
      </div>

      {bankSettings.payment_instructions.trim() && (
        <section
          aria-labelledby="transfer-instructions-heading"
          className="mt-5 overflow-hidden rounded-xl border border-canal-100 bg-gradient-to-br from-canal-50/80 to-white"
        >
          <div className="flex items-center gap-2 border-b border-canal-100 px-4 py-3">
            <ScrollText className="h-4 w-4 shrink-0 text-canal-700" />
            <h4 id="transfer-instructions-heading" className="text-sm font-bold text-ink-800">
              Instructions pour votre virement
            </h4>
          </div>
          <p className="whitespace-pre-line break-words px-4 py-4 text-sm leading-6 text-ink-600">
            {bankSettings.payment_instructions.trim()}
          </p>
        </section>
      )}
    </div>
  );
}
