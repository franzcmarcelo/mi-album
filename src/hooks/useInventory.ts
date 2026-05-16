'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { InventoryMap, StickerState } from '@/types';

// Keyed by instanceId so two albums del mismo tipo no comparten inventario
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

async function fetchInventory(instanceId: string, userId: string | null): Promise<InventoryMap> {
  if (!userId) return getLocalInventory(instanceId);

  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_stickers')
    .select('sticker_catalog_id, state, quantity, marked_at')
    .eq('user_album_id', instanceId);

  if (error) throw error;

  const map: InventoryMap = {};
  for (const row of data ?? []) {
    map[row.sticker_catalog_id] = {
      stickerId: row.sticker_catalog_id,
      state: row.state as StickerState,
      quantity: row.quantity,
      markedAt: row.marked_at,
    };
  }
  return map;
}

export function useInventory(instanceId: string, userId: string | null) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['inventory', instanceId, userId],
    queryFn: () => fetchInventory(instanceId, userId),
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
        return map;
      }

      const supabase = createClient();
      if (next === null) {
        await supabase.from('user_stickers').delete().eq('sticker_catalog_id', stickerId).eq('user_album_id', instanceId);
      } else {
        await supabase.from('user_stickers').upsert({
          user_album_id: instanceId,
          sticker_catalog_id: stickerId,
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
