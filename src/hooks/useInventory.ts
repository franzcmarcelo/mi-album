'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { InventoryMap, StickerState } from '@/types';

const LOCAL_KEY = (instanceId: string) => `inventory_${instanceId}`;

function getLocalInventory(instanceId: string): InventoryMap {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY(instanceId)) ?? '{}');
  } catch {
    return {};
  }
}

function setLocalInventory(instanceId: string, map: InventoryMap) {
  localStorage.setItem(LOCAL_KEY(instanceId), JSON.stringify(map));
}

// Fetches localId → sticker_catalog_id UUID for every sticker in the album.
// Cached indefinitely — catalog never changes at runtime.
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
    .select('id, number')
    .eq('album_id', userAlbum.album_catalog_id);

  const map: Record<string, string> = {};
  for (const s of catalogStickers ?? []) {
    map[`${prefix}-${s.number}`] = s.id;
  }
  return map;
}

export function useInventory(instanceId: string, userId: string | null) {
  const qc = useQueryClient();

  // UUID map is cached indefinitely — only refetches if evicted from cache.
  useQuery({
    queryKey: ['catalog-uuids', instanceId],
    enabled: !!instanceId && !!userId,
    staleTime: Infinity,
    queryFn: () => fetchCatalogUUIDs(instanceId),
  });

  const query = useQuery({
    queryKey: ['inventory', instanceId, userId],
    enabled: !!instanceId,
    queryFn: async () => {
      if (!userId) return getLocalInventory(instanceId);

      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_stickers')
        .select('sticker_catalog_id, state, quantity, marked_at, stickers_catalog!inner(number, album_id, albums_catalog!inner(slug))')
        .eq('user_album_id', instanceId);

      if (error) throw error;

      // Build inventory map keyed by local sticker id (e.g. "panini-1")
      // so mergeWithInventory works unchanged.
      const map: InventoryMap = {};
      for (const row of data ?? []) {
        const sc = row.stickers_catalog as unknown as {
          number: number;
          album_id: string;
          albums_catalog: { slug: string };
        };
        const prefix = sc.albums_catalog.slug.startsWith('3reyes') ? 'treyes' : 'panini';
        const localId = `${prefix}-${sc.number}`;
        map[localId] = {
          stickerId: localId,
          state: row.state as StickerState,
          quantity: row.quantity,
          markedAt: row.marked_at,
        };
      }
      return map;
    },
  });

  const toggle = useMutation({
    onMutate: async ({ stickerId, currentState }) => {
      const queryKey = ['inventory', instanceId, userId];
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<InventoryMap>(queryKey);

      const next: StickerState | null =
        currentState === undefined ? 'owned' : currentState === 'owned' ? 'repeated' : null;

      qc.setQueryData<InventoryMap>(queryKey, (old = {}) => {
        const updated = { ...old };
        if (next === null) {
          delete updated[stickerId];
        } else {
          updated[stickerId] = {
            stickerId,
            state: next,
            quantity: 1,
            markedAt: new Date().toISOString(),
          };
        }
        return updated;
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        qc.setQueryData(['inventory', instanceId, userId], context.previous);
      }
      // Sync with server after a failed write
      qc.invalidateQueries({ queryKey: ['inventory', instanceId] });
    },
    mutationFn: async ({
      stickerId,
      currentState,
    }: {
      stickerId: string;
      currentState: StickerState | undefined;
    }) => {
      const next: StickerState | null =
        currentState === undefined ? 'owned' : currentState === 'owned' ? 'repeated' : null;

      if (!userId) {
        const map = getLocalInventory(instanceId);
        if (next === null) {
          delete map[stickerId];
        } else {
          map[stickerId] = {
            stickerId,
            state: next,
            quantity: 1,
            markedAt: new Date().toISOString(),
          };
        }
        setLocalInventory(instanceId, map);
        return;
      }

      let uuidMap = qc.getQueryData<Record<string, string>>(['catalog-uuids', instanceId]);
      if (!uuidMap) {
        uuidMap = await fetchCatalogUUIDs(instanceId);
        qc.setQueryData(['catalog-uuids', instanceId], uuidMap);
      }

      const stickerCatalogId = uuidMap[stickerId];
      if (!stickerCatalogId) {
        console.error('[toggle] UUID not found for', stickerId);
        return;
      }

      const supabase = createClient();
      if (next === null) {
        await supabase
          .from('user_stickers')
          .delete()
          .eq('sticker_catalog_id', stickerCatalogId)
          .eq('user_album_id', instanceId);
      } else {
        await supabase.from('user_stickers').upsert({
          user_album_id: instanceId,
          sticker_catalog_id: stickerCatalogId,
          state: next,
          quantity: 1,
        });
      }
    },
  });

  return { ...query, toggle };
}
