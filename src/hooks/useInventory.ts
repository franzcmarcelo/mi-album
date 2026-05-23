'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { InventoryMap, StickerState } from '@/types';

async function fetchCatalogUUIDs(instanceId: string): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: userAlbum } = await supabase
    .from('user_albums')
    .select('album_catalog_id, albums_catalog!inner(slug)')
    .eq('id', instanceId)
    .single();

  if (!userAlbum) return {};

  const slug = (userAlbum.albums_catalog as unknown as { slug: string }).slug;
  const prefix = slug.startsWith('3reyes') ? 'treyes' : 'panini';

  const { data: catalogStickers } = await supabase
    .from('stickers_catalog')
    .select('id, code')
    .eq('album_id', userAlbum.album_catalog_id);

  const map: Record<string, string> = {};
  for (const s of catalogStickers ?? []) {
    map[`${prefix}-${s.code}`] = s.id;
  }
  return map;
}

async function fetchInventory(instanceId: string): Promise<InventoryMap> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_stickers')
    .select('sticker_catalog_id, state, quantity, marked_at, stickers_catalog!inner(code, album_id, albums_catalog!inner(slug))')
    .eq('user_album_id', instanceId);

  if (error) throw error;

  const map: InventoryMap = {};
  for (const row of data ?? []) {
    const sc = row.stickers_catalog as unknown as {
      code: string;
      albums_catalog: { slug: string };
    };
    const prefix = sc.albums_catalog.slug.startsWith('3reyes') ? 'treyes' : 'panini';
    const localId = `${prefix}-${sc.code}`;
    map[localId] = {
      stickerId: localId,
      state: row.state as StickerState,
      quantity: row.quantity,
      markedAt: row.marked_at,
    };
  }
  return map;
}

export function useInventory(instanceId: string, userId: string | null) {
  const qc = useQueryClient();

  useQuery({
    queryKey: ['catalog-uuids', instanceId],
    enabled: !!instanceId && !!userId,
    staleTime: Infinity,
    queryFn: () => fetchCatalogUUIDs(instanceId),
  });

  const query = useQuery({
    queryKey: ['inventory', instanceId, userId],
    enabled: !!instanceId && !!userId,
    queryFn: () => fetchInventory(instanceId),
  });

  const update = useMutation({
    onMutate: async ({ stickerId, state, quantity = 1 }) => {
      const queryKey = ['inventory', instanceId, userId];
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<InventoryMap>(queryKey);

      qc.setQueryData<InventoryMap>(queryKey, (old = {}) => {
        const updated = { ...old };
        if (state === null) {
          delete updated[stickerId];
        } else {
          updated[stickerId] = { stickerId, state, quantity, markedAt: new Date().toISOString() };
        }
        return updated;
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        qc.setQueryData(['inventory', instanceId, userId], context.previous);
      }
      qc.invalidateQueries({ queryKey: ['inventory', instanceId] });
    },
    mutationFn: async ({
      stickerId,
      state,
      quantity = 1,
    }: {
      stickerId: string;
      state: StickerState | null;
      quantity?: number;
    }) => {
      if (!userId) return;

      let uuidMap = qc.getQueryData<Record<string, string>>(['catalog-uuids', instanceId]);
      if (!uuidMap) {
        uuidMap = await fetchCatalogUUIDs(instanceId);
        qc.setQueryData(['catalog-uuids', instanceId], uuidMap);
      }

      const stickerCatalogId = uuidMap[stickerId];
      if (!stickerCatalogId) {
        console.error('[update] UUID not found for', stickerId);
        return;
      }

      const supabase = createClient();
      if (state === null) {
        await supabase
          .from('user_stickers')
          .delete()
          .eq('sticker_catalog_id', stickerCatalogId)
          .eq('user_album_id', instanceId);
      } else {
        await supabase.from('user_stickers').upsert(
          { user_album_id: instanceId, sticker_catalog_id: stickerCatalogId, state, quantity },
          { onConflict: 'user_album_id,sticker_catalog_id' }
        );
      }
    },
  });

  return { ...query, update };
}
