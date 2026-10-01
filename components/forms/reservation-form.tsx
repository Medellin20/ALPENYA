'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
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
import { ReservationPaymentNotice } from '@/components/forms/reservation-payment-notice';
import { ReservationProgress } from '@/components/forms/reservation-progress';
import { formatPrice } from '@/lib/utils/format';
import {
  calculateReservationPayment,
  calculateStayRentalAmount,
  getReservationCleaningFee,
  RESERVATION_GUARANTEE_AMOUNT,
  type ReservationPricing,
} from '@/lib/utils/reservation-payment';

const FORM_STEP_COUNT = 3;
type WeeklyRate = { id: string; label: string; amount: number };

export function ReservationForm({
  propertyId,
  propertySlug,
  propertyTitle,
  pricing,
}: {
  propertyId: string;
  propertySlug: string;
  propertyTitle: string;
  pricing: ReservationPricing & { weeklyRates: WeeklyRate[] };
}) {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [isPending, setIsPending] = React.useState(false);
  const submissionInProgress = React.useRef(false);
  const availableWeeklyRates = pricing.weeklyRates.filter((rate) => rate.amount > 0);
  const [selectedRateId, setSelectedRateId] = React.useState(availableWeeklyRates[0]?.id ?? '');

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      propertyId,
      selectedRateId: availableWeeklyRates[0]?.id,
      durationDays: 7,
      occupantsCount: 1,
      hasPets: false,
      hasCleaningFee: false,
    },
  });

  const values = watch();
  const minDate = new Date().toISOString().split('T')[0];
  const stayDuration = Number(values.durationDays) || 0;
  const availableCleaningFee = getReservationCleaningFee(pricing);
  const cleaningFee = values.hasCleaningFee ? availableCleaningFee : 0;
  const selectedRate = availableWeeklyRates.find((rate) => rate.id === selectedRateId);
  const rentalAmount =
    pricing.propertyType === 'furnished_studio' && pricing.monthlyPrice
      ? calculateStayRentalAmount(pricing.monthlyPrice, stayDuration, 'month')
      : selectedRate
        ? calculateStayRentalAmount(selectedRate.amount, stayDuration, 'week')
        : null;
  const paymentBreakdown =
    rentalAmount === null ? null : calculateReservationPayment(rentalAmount, cleaningFee);

  async function goNext() {
    const fieldsByStep: (keyof ReservationInput)[][] = [
      ['firstName', 'lastName', 'email', 'phone'],
      ['desiredMoveInDate', 'durationDays', 'occupantsCount', 'hasPets', 'hasCleaningFee'],
    ];
    const valid = await trigger(fieldsByStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, FORM_STEP_COUNT - 1));
  }

  async function onSubmit(data: ReservationInput) {
    if (step !== FORM_STEP_COUNT - 1 || submissionInProgress.current) return;

    submissionInProgress.current = true;
    setIsPending(true);
    try {
      const result = await createReservation(data, propertySlug);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      if (!result.data?.confirmationUrl) {
        console.error('La demande de réservation a réussi sans URL de confirmation.');
        toast.error('Votre demande a été enregistrée, mais la page de confirmation est indisponible. Contactez notre équipe.');
        return;
      }

      toast.success(result.message);
      router.push(result.data.confirmationUrl);
    } catch (error) {
      console.error('Échec de l’enregistrement de la demande de réservation.', error);
      toast.error('Impossible d’enregistrer votre demande pour le moment. Merci de réessayer.');
    } finally {
      submissionInProgress.current = false;
      setIsPending(false);
    }
  }

  return (
    <div>
      <ReservationProgress activeStep={step + 1} />

      <form onSubmit={(event) => event.preventDefault()}>
        <input type="hidden" {...register('selectedRateId')} />
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
                {pricing.propertyType !== 'furnished_studio' && availableWeeklyRates.length > 1 && (
                  <div className="sm:col-span-2">
                    <Label htmlFor="reservationRate">Tarif correspondant à votre période de séjour</Label>
                    <Select
                      id="reservationRate"
                      value={selectedRateId}
                      onChange={(event) => {
                        const value = event.target.value;
                        setSelectedRateId(value);
                        setValue('selectedRateId', value, { shouldValidate: true });
                      }}
                    >
                      {availableWeeklyRates.map((rate) => (
                        <option key={rate.id} value={rate.id}>
                          {rate.label} — {formatPrice(rate.amount)} / semaine
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
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
              {availableCleaningFee > 0 && (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-100 bg-sand-100/60 p-4 text-sm font-semibold text-ink-700">
                  <Checkbox {...register('hasCleaningFee')} />
                  <span className="flex flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <span>Ajouter le forfait ménage</span>
                    <span className="text-ink-500">{formatPrice(availableCleaningFee)}</span>
                  </span>
                </label>
              )}
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
                {selectedRate && (
                  <Row label="Période tarifaire" value={`${selectedRate.label} — ${formatPrice(selectedRate.amount)} / semaine`} />
                )}
                {cleaningFee > 0 && (
                  <Row label="Forfait ménage" value={formatPrice(cleaningFee)} />
                )}
              </div>
              <ReservationPaymentNotice
                rentalAmount={paymentBreakdown?.rentalAmount ?? null}
                depositAmount={paymentBreakdown?.depositAmount ?? null}
                guaranteeAmount={paymentBreakdown?.guaranteeAmount ?? RESERVATION_GUARANTEE_AMOUNT}
                cleaningFee={paymentBreakdown?.cleaningFee ?? 0}
                totalAmount={paymentBreakdown?.totalAmount ?? null}
              />
              <p className="rounded-xl bg-canal-50 p-4 text-sm leading-relaxed text-ink-600">
                Le montant affiché est calculé selon le tarif choisi et la durée du séjour. Notre équipe confirmera les modalités de règlement après examen de votre demande.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={cn('w-full sm:w-auto', step === 0 && 'hidden sm:inline-flex sm:invisible')}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>

          {step < FORM_STEP_COUNT - 1 ? (
            <Button key="continue" type="button" onClick={goNext} disabled={isPending} className="w-full sm:w-auto">
              Continuer
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button key="send-request" type="button" onClick={handleSubmit(onSubmit)} isLoading={isPending} className="w-full sm:w-auto">
              Valider et continuer
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
