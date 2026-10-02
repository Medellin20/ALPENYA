'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function ReservationConfirmationToast() {
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    toast.success('Votre demande est enregistrée et en attente de confirmation.');
  }, []);

  return null;
}
