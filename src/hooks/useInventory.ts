'use client';

import { useRef } from 'react';
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

export function useInventory(instanceId: string, userId: string | null) {
  const qc = useQueryClient();
  // Maps local sticker id (e.g. "panini-1") → sticker_catalog_id UUID
  const catalogMapRef = useRef<Record<string, string>>({});

  const query = useQuery({
    queryKey: ['inventory', instanceId, userId],
    queryFn: async () => {
      if (!userId) return getLocalInventory(instanceId);

      const supabase = createClient();

      const [{ data: userStickers, error }, { data: userAlbum }] = await Promise.all([
        supabase
          .from('user_stickers')
          .select('sticker_catalog_id, state, quantity, marked_at, stickers_catalog!inner(number)')
          .eq('user_album_id', instanceId),
        supabase
          .from('user_albums')
          .select('album_catalog_id, albums_catalog!inner(slug)')
          .eq('id', instanceId)
          .single(),
      ]);

      if (error) throw error;
      if (!userAlbum) return {};

      const slug = (userAlbum.albums_catalog as unknown as { slug: string }).slug;
      const prefix = slug.startsWith('3reyes') ? 'treyes' : 'panini';

      // Build full localId → UUID map so the toggle can write without extra queries
      const { data: catalogStickers } = await supabase
        .from('stickers_catalog')
        .select('id, number')
        .eq('album_id', userAlbum.album_catalog_id);

      const localIdToUUID: Record<string, string> = {};
      for (const s of catalogStickers ?? []) {
        localIdToUUID[`${prefix}-${s.number}`] = s.id;
      }
      catalogMapRef.current = localIdToUUID;

      // Build inventory map keyed by local sticker id (matches mergeWithInventory)
      const map: InventoryMap = {};
      for (const row of userStickers ?? []) {
        const number = (row.stickers_catalog as unknown as { number: number }).number;
        const localId = `${prefix}-${number}`;
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

      const stickerCatalogId = catalogMapRef.current[stickerId];
      if (!stickerCatalogId) {
        console.error('[toggle] UUID not found for', stickerId, '- inventory not yet loaded?');
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory', instanceId] });
    },
  });

  return { ...query, toggle };
}
