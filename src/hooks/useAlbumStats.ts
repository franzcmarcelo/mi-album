'use client';

/**
 * useAlbumStats
 * Calcula estadísticas de progreso (total, owned, repeated, missing, progress)
 * a partir de un array de StickerWithState. Puro — no hace red ni efectos.
 *
 * Consumidores:
 *   - app/(app)/page.tsx            (DashboardPage — vía AlbumCard)
 *   - app/(app)/album/[albumId]/page.tsx
 *   - app/external-share/[albumId]/page.tsx
 */

import { useMemo } from 'react';
import { StickerWithState } from '@/types';
import { getStats } from '@/lib/catalogHelpers';

export function useAlbumStats(stickers: StickerWithState[]) {
  return useMemo(() => getStats(stickers), [stickers]);
}
