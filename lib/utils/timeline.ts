import type { TimelineStep } from '@/components/shared/status-timeline';
import type { ReservationStatus, ViewingStatus } from '@/types/database';

export function getReservationTimelineSteps(status: ReservationStatus): TimelineStep[] {
  const order: ReservationStatus[] = [
    'submitted',
    'under_review',
    'accepted',
    'confirmed',
  ];
  const labels = [
    'Demande envoyée',
    'Dossier en cours d’examen',
    'Demande acceptée',
    'Logement réservé',
  ];

  if (status === 'rejected' || status === 'cancelled') {
    const failedIndex = status === 'rejected' ? 1 : order.indexOf('submitted');
    return labels.map((label, i) => ({
      label,
      state: i < failedIndex ? 'done' : i === failedIndex ? 'failed' : 'upcoming',
    }));
  }

  const effectiveStatus = ['awaiting_guarantee', 'guarantee_paid'].includes(status) ? 'accepted' : status;
  const currentIndex = order.indexOf(effectiveStatus);

  return labels.map((label, i) => ({
    label,
    state: i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming',
  }));
}

export function getViewingTimelineSteps(status: ViewingStatus): TimelineStep[] {
  const order: ViewingStatus[] = ['pending', 'confirmed', 'completed'];
  const labels = ['Demande envoyée', 'Visite confirmée', 'Visite effectuée'];

  if (status === 'cancelled') {
    return labels.map((label, i) => ({ label, state: i === 0 ? 'failed' : 'upcoming' }));
  }

  const effectiveStatus = ['payment_pending', 'paid'].includes(status) ? 'pending' : status;
  const currentIndex = order.indexOf(effectiveStatus);
  return labels.map((label, i) => ({
    label,
    state: i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming',
  }));
}
