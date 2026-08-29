export const VIEWING_FEE = 100;
export const PROFESSIONAL_EMAIL = 'contacts@alpenya.fr';

export function getReservationPaymentAmount(monthlyPrice: number): number {
  // 50 % du premier loyer + une caution équivalente à un mois de loyer.
  return Math.round(Number(monthlyPrice) * 1.5 * 100) / 100;
}
