'use client';

import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import { cn } from '@/lib/utils/cn';

export function FavoriteButton({ propertyId, className }: { propertyId: string; className?: string }) {
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();
  const active = isLoaded && isFavorite(propertyId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(propertyId);
      }}
      aria-label={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-pressed={active}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur-sm transition-transform duration-150 hover:scale-110 active:scale-95',
        className
      )}
    >
      <Heart
        className={cn('h-4.5 w-4.5 transition-colors', active ? 'fill-brick-500 text-brick-500' : 'text-ink-500')}
      />
    </button>
  );
}
