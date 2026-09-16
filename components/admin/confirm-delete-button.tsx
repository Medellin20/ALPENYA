'use client';

import * as React from 'react';
import { usePendingAction } from '@/hooks/use-pending-action';
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
  disabled,
}: {
  action: () => Promise<ActionResult>;
  confirmTitle: string;
  confirmDescription: string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isPending, runAction] = usePendingAction();

  function handleConfirm() {
    runAction(async () => {
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
      <Button variant="destructive" size={size} className={cn(className)} disabled={disabled || isPending} onClick={() => setOpen(true)}>
        <Trash2 className="h-3.5 w-3.5" />
        {label}
      </Button>
      <Modal open={open} onClose={() => { if (!isPending) setOpen(false); }} title={confirmTitle}>
        <p className="text-sm text-ink-500">{confirmDescription}</p>
        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row">
          <Button variant="outline" disabled={isPending} className="w-full flex-1" onClick={() => setOpen(false)}>
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
