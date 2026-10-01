'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function ReservationConfirmationToast() {
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    toast.success('Vous recevrez un mail de confirmation dans un instant.');
  }, []);

  return null;
}
