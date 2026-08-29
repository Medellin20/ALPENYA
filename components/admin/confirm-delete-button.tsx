'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { ActionResult } from '@/types';
import { cn } from '@/lib/utils/cn';

export function ConfirmDeleteButton({
  action,
  confirmTitle,
  confirmDescription,
  label = 'Supprimer',
  size = 'sm',
  className,
}: {
  action: () => Promise<ActionResult>;
  confirmTitle: string;
  confirmDescription: string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        const result = await action();
        if (result.success) {
          toast.success(result.message);
          setOpen(false);
          router.refresh();
        } else toast.error(result.message);
      } catch {
        toast.error('Connexion impossible. Merci de réessayer.');
      }
    });
  }

  return (
    <>
      <Button variant="destructive" size={size} className={cn(className)} onClick={() => setOpen(true)}>
        <Trash2 className="h-3.5 w-3.5" />
        {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={confirmTitle}>
        <p className="text-sm text-ink-500">{confirmDescription}</p>
        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row">
          <Button variant="outline" className="w-full flex-1" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button variant="destructive" className="w-full flex-1" isLoading={isPending} onClick={handleConfirm}>
            Confirmer la suppression
          </Button>
        </div>
      </Modal>
    </>
  );
}
