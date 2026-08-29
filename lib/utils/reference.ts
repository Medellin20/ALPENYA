import { customAlphabet } from 'nanoid';

// Alphabet sans caractères ambigus (0/O, 1/I) pour des références lisibles.
const nanoidNumeric = customAlphabet('0123456789', 6);

/**
 * Génère une référence lisible du type PREFIX-YYYY-000123.
 * Exemples : VIS-2026-000123, REN-2026-000123
 */
export function generateReference(prefix: 'VIS' | 'REN' | 'CTC'): string {
  const year = new Date().getFullYear();
  const sequence = nanoidNumeric();
  return `${prefix}-${year}-${sequence}`;
}

/** Génère la référence de garantie liée à une réservation : GUARANTEE-REN-000123 */
export function generateGuaranteeReference(reservationReference: string): string {
  const shortRef = reservationReference.replace(/^REN-\d{4}-/, '');
  return `GUARANTEE-REN-${shortRef}`;
}

/** Génère la référence de remboursement liée à une réservation : REFUND-REN-000123 */
export function generateRefundReference(reservationReference: string): string {
  const shortRef = reservationReference.replace(/^REN-\d{4}-/, '');
  return `REFUND-REN-${shortRef}`;
}
