'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function ReservationConfirmationToast({ emailSent }: { emailSent: boolean }) {
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    if (emailSent) {
      toast.success('Vous recevrez un e-mail dans un instant.');
    } else {
      toast.message('Votre demande est enregistrée, mais l’e-mail de confirmation n’a pas pu être envoyé.');
    }
  }, [emailSent]);

  return null;
}
