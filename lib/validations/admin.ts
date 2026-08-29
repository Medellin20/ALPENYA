import { z } from 'zod';

export const adminLoginSchema = z.object({
  password: z.string().min(1, 'Merci de saisir le mot de passe.'),
});

export const bankSettingsSchema = z.object({
  beneficiaryName: z.string().trim().min(2, 'Merci d’indiquer le bénéficiaire.'),
  iban: z.string().trim().min(10, 'IBAN invalide.'),
  bic: z.string().trim().min(6, 'BIC invalide.'),
  bankName: z.string().trim().min(2, 'Merci d’indiquer le nom de la banque.'),
  paymentInstructions: z.string().trim().min(5, 'Merci d’indiquer des instructions de paiement.'),
  defaultDepositAmount: z.coerce.number().min(0),
});

export type BankSettingsInput = z.infer<typeof bankSettingsSchema>;
