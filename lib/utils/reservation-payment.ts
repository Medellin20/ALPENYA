import type { PropertyType } from '@/types/database';

export const RESERVATION_DEPOSIT_RATE = 0.4;
export const RESERVATION_GUARANTEE_AMOUNT = 300;

export interface ReservationPricing {
  propertyType: PropertyType;
  monthlyPrice: number;
  depositAmount: number;
  viewingFee: number;
  serviceCharges: number;
}

export function getReservationRate(
  pricing: ReservationPricing,
  selectedRateId?: string
): { amount: number; unit: 'week' | 'month' } | null {
  if (pricing.propertyType === 'furnished_studio') {
    return pricing.monthlyPrice > 0 ? { amount: pricing.monthlyPrice, unit: 'month' } : null;
  }

  const rates: Record<string, number> = pricing.propertyType === 'chalet'
    ? {
        lowSeason: pricing.monthlyPrice,
        holidays: pricing.depositAmount,
        winter: pricing.viewingFee,
      }
    : pricing.propertyType === 'villa'
      ? {
          summer: pricing.monthlyPrice,
          earlySummer: pricing.depositAmount,
          september: pricing.viewingFee,
          lateSpring: pricing.serviceCharges,
        }
      : { weekly: pricing.monthlyPrice };

  const amount = selectedRateId ? rates[selectedRateId] : undefined;
  return amount && amount > 0 ? { amount, unit: 'week' } : null;
}

export function calculateReservationPayment(rentalAmount: number) {
  const rentalAmountCents = Math.round(rentalAmount * 100);
  const depositAmount = Math.round(rentalAmountCents * RESERVATION_DEPOSIT_RATE) / 100;

  return {
    rentalAmount: rentalAmountCents / 100,
    depositAmount,
    guaranteeAmount: RESERVATION_GUARANTEE_AMOUNT,
    totalAmount: depositAmount + RESERVATION_GUARANTEE_AMOUNT,
  };
}

export function calculateStayRentalAmount(
  rate: number,
  durationDays: number,
  unit: 'week' | 'month'
) {
  if (!Number.isFinite(rate) || rate <= 0 || !Number.isFinite(durationDays) || durationDays < 1) {
    return null;
  }

  const daysPerUnit = unit === 'week' ? 7 : 30;
  return Math.round((rate * durationDays * 100) / daysPerUnit) / 100;
}
