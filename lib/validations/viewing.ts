import { z } from 'zod';

export const viewingRequestSchema = z.object({
  propertyId: z.string().uuid(),
  requestedDate: z
    .string()
    .min(1, 'Merci de choisir une date.')
    .refine((val) => new Date(val) >= new Date(new Date().toDateString()), {
      message: 'La date doit être aujourd’hui ou dans le futur.',
    }),
  requestedTimeSlot: z.string().min(1, 'Merci de choisir un créneau horaire.'),
  firstName: z.string().trim().min(2, 'Le prénom doit contenir au moins 2 caractères.'),
  lastName: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  email: z.string().trim().email('Adresse e-mail invalide.'),
  phone: z
    .string()
    .trim()
    .min(8, 'Numéro de téléphone invalide.')
    .max(20, 'Numéro de téléphone invalide.'),
});

export type ViewingRequestInput = z.infer<typeof viewingRequestSchema>;
