'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { bankSettingsSchema, type BankSettingsInput } from '@/lib/validations/admin';
import { updateBankSettings } from '@/actions/admin-bank';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label, FieldError } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { BankSettings } from '@/types/database';

export function BankSettingsForm({ settings }: { settings: BankSettings }) {
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BankSettingsInput>({
    resolver: zodResolver(bankSettingsSchema),
    defaultValues: {
      beneficiaryName: settings.beneficiary_name,
      iban: settings.iban,
      bic: settings.bic,
      bankName: settings.bank_name,
      paymentInstructions: settings.payment_instructions,
      defaultDepositAmount: settings.default_deposit_amount,
    },
  });

  function onSubmit(data: BankSettingsInput) {
    startTransition(async () => {
      const result = await updateBankSettings(data);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="beneficiaryName">Nom du bénéficiaire</Label>
          <Input id="beneficiaryName" {...register('beneficiaryName')} />
          <FieldError message={errors.beneficiaryName?.message} />
        </div>
        <div>
          <Label htmlFor="iban">IBAN</Label>
          <Input id="iban" {...register('iban')} className="font-mono tracking-tight" />
          <FieldError message={errors.iban?.message} />
        </div>
        <div>
          <Label htmlFor="bic">BIC / SWIFT</Label>
          <Input id="bic" {...register('bic')} className="font-mono" />
          <FieldError message={errors.bic?.message} />
        </div>
        <div>
          <Label htmlFor="bankName">Nom de la banque</Label>
          <Input id="bankName" {...register('bankName')} />
          <FieldError message={errors.bankName?.message} />
        </div>
        <div>
          <Label htmlFor="defaultDepositAmount">Montant par défaut de la garantie (€)</Label>
          <Input id="defaultDepositAmount" type="number" step="1" {...register('defaultDepositAmount')} />
          <FieldError message={errors.defaultDepositAmount?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="paymentInstructions">Instructions de paiement (affichées au client)</Label>
        <Textarea id="paymentInstructions" rows={4} {...register('paymentInstructions')} />
        <FieldError message={errors.paymentInstructions?.message} />
      </div>

      <Button type="submit" isLoading={isPending} className="w-full sm:w-auto">
        <Save className="h-4 w-4" />
        Enregistrer
      </Button>
    </form>
  );
}
