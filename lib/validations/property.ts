import { z } from 'zod';
export const propertySchema = z.object({
  title: z.string().trim().min(5, 'Le titre doit contenir au moins 5 caractères.'),
  description: z.string().trim().min(40, 'Décrivez le bien, sa capacité, ses couchages et sa situation.'),
  slug: z
    .string()
    .trim()
    .min(5, 'Le slug doit contenir au moins 5 caractères.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Le slug ne doit contenir que des minuscules, chiffres et tirets.'),
  propertyType: z.enum(['chalet', 'villa']),

  city: z.string().trim().min(2, 'Merci d’indiquer la ville du bien.'),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),

  monthlyPrice: z.coerce.number().positive('Le prix mensuel doit être positif.'),
  serviceCharges: z.coerce.number().min(0).default(0),
  depositAmount: z.coerce.number().min(0).default(0),
  viewingFee: z.coerce.number().min(0).default(0),

  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  rooms: z.coerce.number().int().min(0).optional(),
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
  minimumStayMonths: z.coerce.number().int().min(1).default(12),

  status: z.enum(['draft', 'available', 'reserved', 'rented', 'unavailable']),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),

  amenityIds: z.array(z.string().uuid()).default([]),
});

export type PropertyInput = z.infer<typeof propertySchema>;
