import { z } from 'zod';
export const propertySchema = z.object({
  title: z.string().trim().min(5, 'Le titre doit contenir au moins 5 caractères.'),
  description: z.string().trim().min(40, 'Décrivez le bien, sa capacité, ses couchages et sa situation.'),
  slug: z
    .string()
    .trim()
    .min(5, 'Le slug doit contenir au moins 5 caractères.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Le slug ne doit contenir que des minuscules, chiffres et tirets.'),
  propertyType: z.enum(['chalet', 'villa', 'furnished_studio', 'mobile_home']),

  surfaceM2: z.coerce.number().positive('La surface doit être supérieure à 0.').optional(),
  city: z.string().trim().min(2, 'Merci d’indiquer la ville du bien.'),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),

  monthlyPrice: z.coerce.number().positive('Le tarif principal doit être supérieur à 0.'),
  serviceCharges: z.coerce.number().min(0, 'Le tarif ne peut pas être négatif.').default(0),
  depositAmount: z.coerce.number().min(0, 'Le tarif ne peut pas être négatif.').default(0),
  viewingFee: z.coerce.number().min(0, 'Le tarif ne peut pas être négatif.').default(0),

  bedrooms: z.coerce.number().int('Le nombre de chambres doit être entier.').min(0, 'Le nombre de chambres ne peut pas être négatif.'),
  bathrooms: z.coerce.number().int('Le nombre de salles de bain doit être entier.').min(0, 'Le nombre de salles de bain ne peut pas être négatif.'),
  rooms: z.coerce.number().int().min(0).optional(),
  floor: z.union([
    z.literal('').transform(() => null),
    z.coerce.number().int('Le nombre d’étages doit être entier.').min(0, 'Le nombre d’étages ne peut pas être négatif.').nullable(),
  ]).optional(),
  contractType: z.string().trim().min(2),
  interiorType: z.string().trim().min(2),
  maintenanceCondition: z.string().trim().min(2),

  hasElevator: z.boolean().default(false),
  hasBalcony: z.boolean().default(false),
  hasTerrace: z.boolean().default(false),
  hasParking: z.boolean().default(false),
  hasGarage: z.boolean().default(false),
  hasGarden: z.boolean().default(false),
  isFurnished: z.boolean().default(false),

  availableFrom: z.string().optional().or(z.literal('')),
  minimumStayMonths: z.coerce.number().int('Le séjour minimum doit être un nombre entier.').min(1, 'La durée minimale doit être supérieure ou égale à 1.').default(12),

  status: z.enum(['draft', 'available', 'reserved', 'rented', 'unavailable']),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),

  amenityIds: z.array(z.string().uuid()).default([]),
}).superRefine((data, ctx) => {
  if (data.propertyType === 'furnished_studio') {
    if (!data.isFurnished) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['isFurnished'], message: 'Un appartement meublé doit être déclaré meublé.' });
    if (data.interiorType !== 'Meublé') ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['interiorType'], message: 'Sélectionnez un intérieur meublé.' });
    if (data.contractType !== 'Location au mois') ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['contractType'], message: 'Sélectionnez une location au mois.' });
  }
  if (data.propertyType === 'mobile_home' && data.contractType !== 'Location saisonnière à la semaine') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['contractType'], message: 'Sélectionnez une location à la semaine.' });
  }
  if (['furnished_studio', 'mobile_home'].includes(data.propertyType) && !data.surfaceM2) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['surfaceM2'], message: 'Indiquez la surface du bien.' });
  }
});

export type PropertyInput = z.infer<typeof propertySchema>;
