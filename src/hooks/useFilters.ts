'use client';

/**
 * useFilters
 * Aplica el filtro activo (all/owned/missing/repeated), la sección activa
 * y el texto de búsqueda del uiStore a un array de StickerWithState.
 * Puro — no hace red ni efectos.
 *
 * Consumidores:
 *   - app/(app)/album/[albumId]/page.tsx
 */

import { useMemo } from 'react';
import { useUIStore } from '@/store/uiStore';
import { StickerWithState } from '@/types';
import { applyFilter } from '@/lib/catalogHelpers';

export function useFilters(stickers: StickerWithState[]) {
  const { filter, searchQuery, activeSection } = useUIStore();

  return useMemo(() => {
    let result = applyFilter(stickers, filter);

    if (activeSection) {
      result = result.filter((s) => s.section === activeSection);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
      );
    }

    return result;
  }, [stickers, filter, searchQuery, activeSection]);
}
