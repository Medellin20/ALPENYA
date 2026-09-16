import { getPaymentSettings } from '@/lib/data/payment-settings';
import { Button } from '@/components/ui/button';

export async function PaymentStep({ reference }: { reference: string }) {
  const { paymentUrl } = await getPaymentSettings();
  const email = 'contacts@alpenia-residences.com';
  const subject = encodeURIComponent(`Justificatif de paiement — ${reference}`);
  return (
    <section aria-labelledby="payment-heading" className="mt-6 space-y-4 rounded-xl border border-canal-200 bg-canal-50 p-5 text-left">
      <p className="text-xs font-semibold uppercase tracking-wide text-canal-700">Étape 4 sur 4</p>
      <h2 id="payment-heading" className="text-lg font-bold text-ink-900">Dernière étape : paiement</h2>
      {paymentUrl ? (
        <Button asChild className="w-full sm:w-auto"><a href={paymentUrl} target="_blank" rel="noopener noreferrer">Accéder au paiement</a></Button>
      ) : (
        <p className="text-sm text-ink-600">Le lien de paiement n’est pas encore disponible. Contactez notre équipe en indiquant votre référence {reference}.</p>
      )}
      <p className="text-sm leading-relaxed text-ink-700">
        Après le paiement, veuillez envoyer une capture d’écran justifiant votre paiement à{' '}
        <a className="break-all font-semibold underline" href={`mailto:${email}?subject=${subject}`}>{email}</a>,
        en indiquant votre référence <strong>{reference}</strong>.
      </p>
      <p className="text-xs text-ink-500">Notre équipe vérifiera votre justificatif et vous contactera pour la confirmation de votre demande.</p>
    </section>
  );
}
