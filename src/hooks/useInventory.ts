'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { InventoryMap, StickerState } from '@/types';
import { catalogPrefix, buildInventoryMap } from '@/lib/catalogHelpers';

// Mapea localId → UUID de stickers_catalog (necesario para escribir en user_stickers)
async function fetchCatalogUUIDs(instanceId: string): Promise<Record<string, string>> {
  const supabase = createClient();

  const { data: albumRow } = await supabase
    .from('user_albums')
    .select('album_catalog_id, albums_catalog!inner(slug)')
    .eq('id', instanceId)
    .single();

  if (!albumRow) return {};

  const slug = (albumRow.albums_catalog as unknown as { slug: string }).slug;
  const prefix = catalogPrefix(slug);

  const { data: catalogStickers } = await supabase
    .from('stickers_catalog')
    .select('id, number')
    .eq('album_id', albumRow.album_catalog_id);

  const map: Record<string, string> = {};
  for (const s of catalogStickers ?? []) {
    map[`${prefix}-${s.number}`] = s.id;
  }
  return map;
}

// Devuelve el inventario del usuario como InventoryMap (localId → UserSticker)
async function fetchInventory(instanceId: string): Promise<InventoryMap> {
  const supabase = createClient();

  // Obtener slug para derivar el prefijo
  const { data: albumRow } = await supabase
    .from('user_albums')
    .select('albums_catalog!inner(slug)')
    .eq('id', instanceId)
    .single();

  if (!albumRow) return {};
  const prefix = catalogPrefix(
    (albumRow.albums_catalog as unknown as { slug: string }).slug
  );

  // Obtener figuras marcadas por el usuario
  const { data, error } = await supabase
    .from('user_stickers')
    .select('state, quantity, marked_at, stickers_catalog!inner(number)')
    .eq('user_album_id', instanceId);

  if (error) throw error;

  return buildInventoryMap(
    (data ?? []).map((row) => ({
      number: (row.stickers_catalog as unknown as { number: number }).number,
      state: row.state,
      quantity: row.quantity,
      markedAt: row.marked_at,
    })),
    prefix
  );
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
