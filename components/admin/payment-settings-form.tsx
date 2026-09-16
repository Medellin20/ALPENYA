'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { updatePaymentSettings } from '@/actions/admin-payment';
import { paymentSettingsSchema, type PaymentSettingsInput } from '@/lib/validations/payment';
import { Input } from '@/components/ui/input';
import { Label, FieldError } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function PaymentSettingsForm({ paymentUrl, available }: { paymentUrl: string; available: boolean }) {
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<PaymentSettingsInput>({
    resolver: zodResolver(paymentSettingsSchema), defaultValues: { paymentUrl },
  });
  return (
    <form className="mt-4 space-y-4" onSubmit={handleSubmit(data => startTransition(async () => {
      try {
        const result = await updatePaymentSettings(data);
        if (result.success) toast.success(result.message);
        else toast.error(result.message);
      } catch {
        toast.error('Impossible d’enregistrer le lien. Veuillez réessayer.');
      }
    }))}>
      {!available && <p role="alert" className="text-sm text-red-700">La configuration des paiements est indisponible. Vérifiez que la migration payment_settings a été appliquée.</p>}
      <div>
        <Label htmlFor="paymentUrl">Lien de paiement des visites et réservations</Label>
        <Input id="paymentUrl" type="url" placeholder="https://…" {...register('paymentUrl')} />
        <FieldError message={errors.paymentUrl?.message} />
        <p className="mt-2 text-xs text-ink-500">Modifiable à tout moment. Laissez ce champ vide pour retirer le bouton de paiement.</p>
      </div>
      <Button type="submit" isLoading={pending}>Enregistrer le lien</Button>
    </form>
  );
}
