'use client';

import * as React from 'react';
import { usePendingAction } from '@/hooks/use-pending-action';
import Image from 'next/image';
import { toast } from 'sonner';
import { UploadCloud, Star, Trash2, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import {
  uploadPropertyImages,
  deletePropertyImage,
  setPrimaryPropertyImage,
  reorderPropertyImages,
} from '@/actions/admin-images';
import type { PropertyImage } from '@/types/database';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

export function ImageUploader({ propertyId, initialImages }: { propertyId: string; initialImages: PropertyImage[] }) {
  const [images, setImages] = React.useState<PropertyImage[]>(
    [...initialImages].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [isUploading, setIsUploading] = React.useState(false);
  const [pendingCount, setPendingCount] = React.useState(0);
  const [imageToDelete, setImageToDelete] = React.useState<PropertyImage | null>(null);
  const [isPending, runAction] = usePendingAction();
  const uploadLock = React.useRef(false);
  const busy = isUploading || isPending;
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0 || uploadLock.current || isPending) return;
    uploadLock.current = true;
    setIsUploading(true);
    setPendingCount(fileList.length);

    try {
      let added = 0;
      for (const file of Array.from(fileList)) {
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type) || file.size === 0 || file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} : choisissez une image JPG, PNG, WebP ou AVIF de 10 Mo maximum.`);
          continue;
        }
        // Une requête par photo pour ne pas dépasser la limite du serveur avec un lot.
        const formData = new FormData();
        formData.append('images', file);
        const result = await uploadPropertyImages(propertyId, formData);
        if (result.success && result.data) {
          setImages((prev) => [...prev, ...result.data!].sort((a, b) => a.sort_order - b.sort_order));
          added += result.data.length;
        } else {
          toast.error(result.message);
        }
      }
      if (added > 0) toast.success(`${added} image(s) ajoutée(s).`);
    } catch {
      toast.error('Envoi interrompu. Les photos déjà ajoutées sont conservées.');
    } finally {
      uploadLock.current = false;
      setIsUploading(false);
      setPendingCount(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleDelete() {
    if (!imageToDelete || busy || uploadLock.current) return;
    const imageId = imageToDelete.id;
    const previousImages = images;
    setImageToDelete(null);

    runAction(async () => {
      const wasPrimary = previousImages.find((i) => i.id === imageId)?.is_primary;
      const remaining = previousImages.filter((i) => i.id !== imageId);
      setImages(wasPrimary && remaining[0] ? remaining.map((img, i) => (i === 0 ? { ...img, is_primary: true } : img)) : remaining);

      try {
        const result = await deletePropertyImage(imageId);
        if (result.success) {
          toast.success(result.message);
        } else {
          setImages(previousImages);
          toast.error(result.message);
        }
      } catch {
        setImages(previousImages);
        toast.error('Connexion impossible. La photo n’a pas été supprimée.');
      }
    });
  }

  function handleSetPrimary(imageId: string) {
    if (busy || uploadLock.current) return;
    const previousImages = images;
    setImages((prev) => prev.map((img) => ({ ...img, is_primary: img.id === imageId })));
    runAction(async () => {
      try {
        const result = await setPrimaryPropertyImage(propertyId, imageId);
        if (!result.success) {
          setImages(previousImages);
          toast.error(result.message);
        }
      } catch {
        setImages(previousImages);
        toast.error('Connexion impossible. L’image principale n’a pas été modifiée.');
      }
    });
  }

  function move(index: number, direction: -1 | 1) {
    if (busy || uploadLock.current) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    const next = [...images];
    const previousImages = images;
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    setImages(next.map((image, sort_order) => ({ ...image, sort_order })));
    runAction(async () => {
      try {
        const result = await reorderPropertyImages(propertyId, next.map((i) => i.id));
        if (!result.success) {
          setImages(previousImages);
          toast.error(result.message);
        }
      } catch {
        setImages(previousImages);
        toast.error('Connexion impossible. L’ordre des photos n’a pas été modifié.');
      }
    });
  }

  return (
    <div>
      <label
        htmlFor="property-images-input"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-200 bg-sand-100/50 px-4 py-8 text-center transition-colors hover:border-ink-300 hover:bg-sand-100',
          busy && 'opacity-70'
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-ink-500" />
            <p className="text-sm font-medium text-ink-600">
              Téléversement de {pendingCount} image{pendingCount > 1 ? 's' : ''} en cours...
            </p>
          </>
        ) : (
          <>
            <UploadCloud className="h-6 w-6 text-ink-400" />
            <p className="text-sm font-medium text-ink-600">
              Cliquez pour sélectionner des photos, ou glissez-déposez ici
            </p>
            <p className="text-xs text-ink-400">JPG, PNG, WebP ou AVIF — 10 Mo max. par image</p>
          </>
        )}
      </label>
      <input
        ref={inputRef}
        id="property-images-input"
        type="file"
        multiple
        disabled={busy}
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {images.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={cn(
                'group relative aspect-[4/3] overflow-hidden rounded-xl border-2',
                image.is_primary ? 'border-canal-500' : 'border-transparent'
              )}
            >
              <Image src={image.url} alt="" fill sizes="200px" className="object-cover" />

              {image.is_primary && (
                <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-canal-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  <Star className="h-2.5 w-2.5 fill-white" />
                  Principale
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 flex min-h-11 flex-wrap items-center justify-center gap-1 bg-ink-950/55 px-1.5 py-1.5 opacity-100 transition-all [@media(hover:hover)_and_(pointer:fine)]:inset-0 [@media(hover:hover)_and_(pointer:fine)]:bg-ink-950/0 [@media(hover:hover)_and_(pointer:fine)]:opacity-0 group-hover:bg-ink-950/50 group-hover:opacity-100 group-focus-within:bg-ink-950/50 group-focus-within:opacity-100">
                {!image.is_primary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(image.id)}
                    disabled={busy}
                    title="Définir comme image principale"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-ink-700 hover:bg-white"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={busy || index === 0}
                  title="Déplacer vers la gauche"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-ink-700 hover:bg-white disabled:opacity-40"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={busy || index === images.length - 1}
                  title="Déplacer vers la droite"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-ink-700 hover:bg-white disabled:opacity-40"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setImageToDelete(image)}
                  disabled={busy}
                  title="Supprimer"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-brick-500 hover:bg-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={imageToDelete !== null}
        onClose={() => setImageToDelete(null)}
        title="Supprimer cette photo ?"
      >
        <p className="text-sm text-ink-500">
          La photo sera retirée du logement et supprimée définitivement du stockage.
        </p>
        <div className="mt-6 flex gap-2.5">
          <Button variant="outline" className="flex-1" onClick={() => setImageToDelete(null)}>
            Annuler
          </Button>
          <Button variant="destructive" className="flex-1" disabled={busy} onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
