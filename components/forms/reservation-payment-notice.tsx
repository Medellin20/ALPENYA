import { formatPrice } from '@/lib/utils/format';

export function ReservationPaymentNotice({
  rentalAmount,
  depositAmount,
  guaranteeAmount,
  totalAmount,
}: {
  rentalAmount: number | null;
  depositAmount: number | null;
  guaranteeAmount: number;
  totalAmount: number | null;
}) {
  return (
    <section aria-labelledby="reservation-payment-heading" className="rounded-2xl border border-canal-200 bg-canal-50 p-4 sm:p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 id="reservation-payment-heading" className="font-bold text-ink-900">Montant à prévoir</h3>
          <p className="mt-1 text-xs text-ink-500">Récapitulatif estimatif pour votre séjour</p>
        </div>
        {totalAmount !== null && (
          <p className="text-2xl font-extrabold tracking-tight text-canal-800">{formatPrice(totalAmount)}</p>
        )}
      </div>

      {rentalAmount !== null && depositAmount !== null && totalAmount !== null ? (
        <dl className="mt-4 space-y-2 border-t border-canal-200 pt-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-600">Montant du séjour</dt>
            <dd className="font-semibold text-ink-800">{formatPrice(rentalAmount)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-600">Acompte (40 %)</dt>
            <dd className="font-semibold text-ink-800">{formatPrice(depositAmount)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-600">Caution</dt>
            <dd className="font-semibold text-ink-800">{formatPrice(guaranteeAmount)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-canal-200 pt-2 font-bold">
            <dt className="text-ink-900">Total à régler</dt>
            <dd className="text-canal-800">{formatPrice(totalAmount)}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-4 border-t border-canal-200 pt-3 text-sm font-medium text-ink-700">
          Le tarif de cette période est à confirmer auprès de notre équipe. Le total sera calculé dès que le prix du séjour sera défini.
        </p>
      )}

      <p className="mt-3 text-xs leading-relaxed text-ink-500">
        Le calcul comprend l’acompte de 40 % du séjour et la caution de {formatPrice(guaranteeAmount)}. Le montant définitif sera confirmé avec les coordonnées bancaires après l’envoi de votre demande.
      </p>
    </section>
  );
}
