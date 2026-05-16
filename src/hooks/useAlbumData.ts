'use client';

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
    queryFn: () => fetchCatalog(albumSlug),
    staleTime: Infinity,
  });
}
