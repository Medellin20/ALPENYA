import { z } from 'zod';

export const paymentLinkSchema = z.string().trim().max(2048).url('Saisissez un lien de paiement valide.').refine(value => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}, 'Le lien de paiement doit commencer par https://.');

export const paymentSettingsSchema = z.object({ paymentUrl: z.union([z.literal(''), paymentLinkSchema]) });
export type PaymentSettingsInput = z.infer<typeof paymentSettingsSchema>;
