export const RESERVATION_DEPOSIT_RATE = 0.4;
export const RESERVATION_GUARANTEE_AMOUNT = 300;

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
