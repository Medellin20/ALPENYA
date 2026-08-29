'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'renl_favorites';

/**
 * Favoris stockés côté navigateur (pas de compte client obligatoire).
 * Utilise localStorage : simple, suffisant pour un visiteur anonyme qui
 * compare des logements avant de créer un dossier de réservation.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {
      // localStorage indisponible (navigation privée stricte, etc.)
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const persist = useCallback((next: string[]) => {
    setFavorites(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const toggleFavorite = useCallback(
    (propertyId: string) => {
      persist(
        favorites.includes(propertyId)
          ? favorites.filter((id) => id !== propertyId)
          : [...favorites, propertyId]
      );
    },
    [favorites, persist]
  );

  const isFavorite = useCallback((propertyId: string) => favorites.includes(propertyId), [favorites]);

  return { favorites, isFavorite, toggleFavorite, isLoaded };
}
