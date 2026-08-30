import { z } from 'zod';

export const reservationSchema = z.object({
  propertyId: z.string().uuid(),
  firstName: z.string().trim().min(2, 'Le prénom doit contenir au moins 2 caractères.'),
  lastName: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  email: z.string().trim().email('Adresse e-mail invalide.'),
  phone: z.string().trim().min(8, 'Numéro de téléphone invalide.').max(20),
  desiredMoveInDate: z.string().min(1, 'Merci d’indiquer une date d’entrée souhaitée.'),
  durationDays: z.coerce
    .number()
    .int()
    .min(1, 'La durée minimale est de 1 jour.')
    .max(365, 'Merci de contacter l’agence pour un séjour supérieur à un an.'),
  occupantsCount: z.coerce
    .number()
    .int()
    .min(1, 'Indiquez au moins un occupant.')
    .max(50, 'Le nombre d’occupants ne peut pas dépasser 50.'),
  hasPets: z.boolean().default(false),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
