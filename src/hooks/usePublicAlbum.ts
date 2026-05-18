'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { InventoryMap, StickerState, StickerWithState } from '@/types';
import { mergeWithInventory } from '@/lib/catalogHelpers';

async function fetchPublicAlbum(instanceId: string) {
  const supabase = createClient();

  const { data: albumRow, error: albumErr } = await supabase
    .from('user_albums')
    .select('name, albums_catalog!inner(slug)')
    .eq('id', instanceId)
    .single();

  if (albumErr || !albumRow) throw new Error('Album not found');

  const slug = (albumRow.albums_catalog as unknown as { slug: string }).slug;
  const albumName = (albumRow.name as string) ?? '';

  const { data: stickerRows, error: stickersErr } = await supabase
    .from('user_stickers')
    .select('state, quantity, stickers_catalog!inner(number)')
    .eq('user_album_id', instanceId);

  if (stickersErr) throw stickersErr;

  const prefix = slug.startsWith('3reyes') ? 'treyes' : 'panini';
  const inventory: InventoryMap = {};
  for (const row of stickerRows ?? []) {
    const sc = row.stickers_catalog as unknown as { number: number };
    const localId = `${prefix}-${sc.number}`;
    inventory[localId] = {
      stickerId: localId,
      state: row.state as StickerState,
      quantity: row.quantity ?? 1,
      markedAt: '',
    };
  }

  const file = slug.startsWith('3reyes') ? 'treyes' : 'panini';
  const mod = await import(`@/data/${file}.json`);
  const stickers: StickerWithState[] = mergeWithInventory(mod.default, inventory);

  return { slug, albumName, stickers };
}

export function usePublicAlbum(instanceId: string) {
  return useQuery({
    queryKey: ['public-album', instanceId],
    enabled: !!instanceId,
    queryFn: () => fetchPublicAlbum(instanceId),
    staleTime: 60_000,
  });
}
