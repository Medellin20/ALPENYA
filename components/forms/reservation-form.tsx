'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, ClipboardList, FileCheck2, User } from 'lucide-react';
import { reservationSchema, type ReservationInput } from '@/lib/validations/reservation';
import { createReservation } from '@/actions/reservations';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label, FieldError } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

const STEPS = ['Vos coordonnées', 'Votre projet de location', 'Récapitulatif'] as const;

export function ReservationForm({
  propertyId,
  propertySlug,
  propertyTitle,
}: {
  propertyId: string;
  propertySlug: string;
  propertyTitle: string;
}) {
  const [step, setStep] = React.useState(0);
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      propertyId,
      durationDays: 7,
      occupantsCount: 1,
      hasPets: false,
    },
  });

  const values = watch();
  const minDate = new Date().toISOString().split('T')[0];

  async function goNext() {
    const fieldsByStep: (keyof ReservationInput)[][] = [
      ['firstName', 'lastName', 'email', 'phone'],
      ['desiredMoveInDate', 'durationDays', 'occupantsCount', 'hasPets'],
    ];
    const valid = await trigger(fieldsByStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function onSubmit(data: ReservationInput) {
    startTransition(async () => {
      const result = await createReservation(data, propertySlug);
      if (result && !result.success) {
        toast.error(result.message);
      }
    });
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  i < step ? 'bg-canal-600 text-white' : i === step ? 'bg-ink-700 text-white' : 'bg-ink-100 text-ink-400'
                )}
              >
                {i + 1}
              </span>
              <span className={cn('hidden text-sm font-medium sm:block', i === step ? 'text-ink-900' : 'text-ink-400')}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-ink-100" />}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="s0"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-ink-700">
                <User className="h-5 w-5 text-canal-600" />
                <h3 className="font-bold">Vos coordonnées</h3>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" {...register('firstName')} />
                  <FieldError message={errors.firstName?.message} />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" {...register('lastName')} />
                  <FieldError message={errors.lastName?.message} />
                </div>
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" {...register('email')} />
                <FieldError message={errors.email?.message} />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" type="tel" placeholder="+33 6 12 34 56 78" {...register('phone')} />
                <FieldError message={errors.phone?.message} />
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-ink-700">
                <ClipboardList className="h-5 w-5 text-canal-600" />
                <h3 className="font-bold">Votre projet de location</h3>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="desiredMoveInDate">Date de réservation</Label>
                  <Input id="desiredMoveInDate" type="date" min={minDate} {...register('desiredMoveInDate')} />
                  <FieldError message={errors.desiredMoveInDate?.message} />
                </div>
                <div>
                  <Label htmlFor="durationDays">Durée du séjour (jours)</Label>
                  <Input id="durationDays" type="number" min={1} max={365} {...register('durationDays')} />
                  <FieldError message={errors.durationDays?.message} />
                </div>
                <div>
                  <Label htmlFor="occupantsCount">Nombre d’occupants</Label>
                  <Select id="occupantsCount" {...register('occupantsCount')}>
                    {Array.from({ length: 20 }, (_, index) => index + 1).map((count) => (
                      <option key={count} value={count}>{count}</option>
                    ))}
                  </Select>
                  <FieldError message={errors.occupantsCount?.message} />
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-100 bg-sand-100/60 p-4 text-sm font-semibold text-ink-700">
                <Checkbox {...register('hasPets')} />
                Je voyage avec un ou plusieurs animaux de compagnie
              </label>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-ink-700">
                <FileCheck2 className="h-5 w-5 text-canal-600" />
                <h3 className="font-bold">Récapitulatif de votre demande</h3>
              </div>
              <div className="space-y-2 rounded-xl border border-ink-100 bg-sand-100/60 p-4 text-sm">
                <Row label="Logement" value={propertyTitle} />
                <Row label="Nom" value={`${values.firstName || ''} ${values.lastName || ''}`.trim() || '—'} />
                <Row label="E-mail" value={values.email || '—'} />
                <Row label="Date de réservation" value={values.desiredMoveInDate || '—'} />
                <Row label="Durée" value={values.durationDays ? `${values.durationDays} jour${values.durationDays > 1 ? 's' : ''}` : '—'} />
                <Row label="Nombre d’occupants" value={String(values.occupantsCount || '—')} />
                <Row label="Animaux de compagnie" value={values.hasPets ? 'Oui' : 'Non'} />
              </div>
              <p className="rounded-xl bg-canal-50 p-4 text-sm leading-relaxed text-ink-600">
                Cette étape transmet uniquement votre demande de réservation. Aucun paiement ni
                justificatif bancaire n’est demandé sur le site. L’agence vous contactera pour la suite.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={cn('w-full sm:w-auto', step === 0 && 'hidden sm:inline-flex sm:invisible')}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext} className="w-full sm:w-auto">
              Continuer
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" isLoading={isPending} className="w-full sm:w-auto">
              Envoyer la demande de réservation
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-ink-400">{label}</span>
      <span className="break-words font-medium text-ink-700 sm:text-right">{value}</span>
    </div>
  );
}
