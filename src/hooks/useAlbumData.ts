'use client';

/**
 * useAlbumData
 * Carga el catálogo estático de figuras (JSON local) para un álbum dado.
 *
 * staleTime: Infinity — el catálogo nunca cambia en runtime.
 * queryKey: ['catalog', albumSlug]
 *
 * Consumidores:
 *   - app/(app)/page.tsx            (DashboardPage — vía AlbumCard, para merge con inventario)
 *   - app/(app)/album/[albumId]/page.tsx
 */

import { useQuery } from '@tanstack/react-query';
import { Sticker } from '@/types';

async function fetchCatalog(slug: string): Promise<Sticker[]> {
  const file = slug.startsWith('3reyes') ? 'treyes' : 'panini';
  const mod = await import(`@/data/${file}.json`);
  return mod.default as Sticker[];
}

export function useAlbumData(albumSlug: string) {
  return useQuery({
    queryKey: ['catalog', albumSlug],
    enabled: !!albumSlug,
    queryFn: () => fetchCatalog(albumSlug),
    staleTime: Infinity,
  });
}
