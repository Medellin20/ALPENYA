'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Pencil, Eye, EyeOff } from 'lucide-react';
import { togglePropertyPublish, deleteProperty, updatePropertyStatus } from '@/actions/admin-properties';
import { ConfirmDeleteButton } from '@/components/admin/confirm-delete-button';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import type { PropertyStatus } from '@/types/database';

export function PropertyRowActions({
  id,
  isPublished,
  status,
}: {
  id: string;
  isPublished: boolean;
  status: PropertyStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  function handleTogglePublish() {
    startTransition(async () => {
      try {
        const result = await togglePropertyPublish(id, !isPublished);
        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else toast.error(result.message);
      } catch {
        toast.error('Connexion impossible. Merci de réessayer.');
      }
    });
  }

  function handleStatusChange(newStatus: PropertyStatus) {
    startTransition(async () => {
      try {
        const result = await updatePropertyStatus(id, newStatus);
        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else toast.error(result.message);
      } catch {
        toast.error('Connexion impossible. Merci de réessayer.');
      }
    });
  }

  return (
    <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:min-w-[17rem]">
      <div>
        <Select
          value={status}
          aria-label="Modifier le statut du bien"
          onChange={(e) => handleStatusChange(e.target.value as PropertyStatus)}
          disabled={isPending}
          className="!h-10 w-full min-w-0 text-xs"
        >
          <option value="draft">Brouillon</option>
          <option value="available">Disponible</option>
          <option value="reserved">Réservé</option>
          <option value="rented">Loué</option>
          <option value="unavailable">Indisponible</option>
        </Select>
      </div>

      <Button className="w-full" variant={isPublished ? 'outline' : 'secondary'} size="sm" onClick={handleTogglePublish} disabled={isPending}>
        {isPublished ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {isPublished ? 'Dépublier' : 'Publier'}
      </Button>

      <Button asChild className="w-full" variant="outline" size="sm">
        <Link href={`/admin/appartements/${id}`}>
          <Pencil className="h-3.5 w-3.5" />
          Modifier
        </Link>
      </Button>

      <ConfirmDeleteButton
        action={() => deleteProperty(id)}
        confirmTitle="Supprimer ce bien ?"
        confirmDescription="Cette action est irréversible et supprimera également toutes les photos associées."
        className="w-full"
      />
    </div>
  );
}
