import { z } from 'zod';

export const refundRequestSchema = z.object({
  guaranteePaymentId: z.string().uuid(),
  reason: z.string().trim().max(2000).optional().or(z.literal('')),
  confirm: z.literal(true, {
    errorMap: () => ({ message: 'Merci de confirmer votre demande de remboursement.' }),
  }),
});

export type RefundRequestInput = z.infer<typeof refundRequestSchema>;

export const declareTransferSchema = z.object({
  guaranteePaymentId: z.string().uuid(),
  transferDate: z.string().min(1, 'Merci d’indiquer la date du virement.'),
  bankName: z.string().trim().min(2, 'Merci d’indiquer votre banque.'),
  reference: z.string().trim().min(2, 'Merci d’indiquer la référence utilisée.'),
});

export type DeclareTransferInput = z.infer<typeof declareTransferSchema>;
