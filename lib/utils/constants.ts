import type { GuaranteeStatus, RefundStatus, ReservationStatus, ViewingStatus } from '@/types/database';

export const DESTINATION_CITIES = [
  'La Clusaz',
  'Chamonix-Mont-Blanc',
  'Megève',
  'Courchevel',
  'Méribel',
  'Val-d’Isère',
  'Annecy',
  'Cannes',
  'Nice',
  'Saint-Tropez',
  'Biarritz',
] as const;

export type DestinationCity = (typeof DESTINATION_CITIES)[number];

export const PROPERTY_TYPES = [
  { value: 'chalet', label: 'Chalet' },
  { value: 'villa', label: 'Villa' },
] as const;

export const PROPERTY_STATUS_LABELS: Record<string, { label: string; colorClass: string }> = {
  draft: { label: 'Brouillon', colorClass: 'bg-status-draft' },
  available: { label: 'Disponible', colorClass: 'bg-status-available' },
  reserved: { label: 'Réservé', colorClass: 'bg-status-reserved' },
  rented: { label: 'Loué', colorClass: 'bg-status-rented' },
  unavailable: { label: 'Indisponible', colorClass: 'bg-status-draft' },
};

export const VIEWING_STATUS_LABELS: Record<string, string> & Record<ViewingStatus, string> = {
  pending: 'En attente',
  payment_pending: 'Paiement en attente',
  paid: 'Payée',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
  completed: 'Terminée',
};

export const RESERVATION_STATUS_LABELS: Record<string, string> & Record<ReservationStatus, string> = {
  submitted: 'Envoyée',
  under_review: 'En cours d’examen',
  accepted: 'Acceptée',
  rejected: 'Refusée',
  awaiting_guarantee: 'En attente de garantie',
  guarantee_paid: 'Garantie reçue',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
};

export const GUARANTEE_STATUS_LABELS: Record<string, string> & Record<GuaranteeStatus, string> = {
  awaiting_payment: 'En attente de virement',
  payment_declared: 'Virement déclaré',
  payment_received: 'Virement reçu',
  reservation_confirmed: 'Réservation confirmée',
  refund_requested: 'Remboursement demandé',
  refund_processing: 'Remboursement en cours',
  refunded: 'Remboursée',
  cancelled: 'Annulée',
};

export const REFUND_STATUS_LABELS: Record<string, string> & Record<RefundStatus, string> = {
  requested: 'Demandé',
  approved: 'Approuvé',
  processing: 'En cours de traitement',
  refunded: 'Remboursé',
  rejected: 'Refusé',
};

export const TIME_SLOTS = [
  '09:00 - 09:30',
  '10:00 - 10:30',
  '11:00 - 11:30',
  '13:00 - 13:30',
  '14:00 - 14:30',
  '15:00 - 15:30',
  '16:00 - 16:30',
  '17:00 - 17:30',
];

export const AMENITY_ICON_MAP: Record<string, string> = {
  wifi: 'Wifi',
  heating: 'Flame',
  equipped_kitchen: 'CookingPot',
  washing_machine: 'WashingMachine',
  dishwasher: 'Utensils',
  parking: 'SquareParking',
  balcony: 'DoorOpen',
  elevator: 'ArrowUpDown',
  garden: 'Trees',
  cellar: 'Warehouse',
  bike_storage: 'Bike',
  air_conditioning: 'Wind',
};

export const ADMIN_SESSION_COOKIE = 'renl_admin_session';
export const FAVORITES_COOKIE = 'renl_favorites';
