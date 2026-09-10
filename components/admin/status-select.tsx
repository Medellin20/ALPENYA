'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Select } from '@/components/ui/select';
import type { ActionResult } from '@/types';

export function StatusSelect<T extends string>({
  value,
  options,
  entityId,
  onUpdate,
}: {
  value: T;
  options: { value: T; label: string }[];
  entityId: string;
  onUpdate: (id: string, newStatus: T) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  function handleChange(newStatus: T) {
    startTransition(async () => {
      try {
        const result = await onUpdate(entityId, newStatus);
        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error('Connexion impossible. Merci de réessayer.');
      }
    });
  }

  return (
    <Select
      value={value}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value as T)}
      aria-label="Modifier le statut"
      className="!h-10 w-full min-w-0 text-xs sm:w-auto sm:min-w-[10rem]"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Select>
  );
}
