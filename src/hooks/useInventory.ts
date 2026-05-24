'use client';

/**
 * useInventory
 * Lee y escribe el inventario de figuras del usuario para una instancia de álbum.
 *
 * Acepta `slug` y `albumCatalogId` opcionales: si se proveen (caso normal desde
 * dashboard y página de álbum), se evitan queries extra a user_albums.
 * El mapa UUID (stickers_catalog) se carga de forma lazy en la primera escritura.
 *
 * queryKeys:
 *   ['album-prefix',     instanceId]  staleTime: Infinity
 *   ['album-catalog-id', instanceId]  staleTime: Infinity
 *   ['catalog-uuids',    instanceId]  staleTime: Infinity  (lazy, solo en escritura)
 *   ['inventory',        instanceId, userId]  staleTime: 30s
 *
 * Consumidores:
 *   - app/(app)/page.tsx            (DashboardPage — vía AlbumCard, solo lectura)
 *   - app/(app)/album/[albumId]/page.tsx  (lectura + escritura)
 */

import { useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { InventoryMap, StickerState } from '@/types';
import { catalogPrefix, buildInventoryMap } from '@/lib/catalogHelpers';

// Solo se llama si el prefijo no se conoce de antemano (caso: navegación directa por URL)
async function fetchAlbumPrefix(instanceId: string): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase
    .from('user_albums')
    .select('albums_catalog!inner(slug)')
    .eq('id', instanceId)
    .single();
  if (!data) return '';
  return catalogPrefix((data.albums_catalog as unknown as { slug: string }).slug);
}

// Solo se llama si el albumCatalogId no se conoce de antemano (caso: navegación directa por URL)
async function fetchAlbumCatalogId(instanceId: string): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase
    .from('user_albums')
    .select('album_catalog_id')
    .eq('id', instanceId)
    .single();
  return data?.album_catalog_id ?? '';
}

// Mapea localId → UUID de stickers_catalog (necesario para escribir en user_stickers)
async function fetchCatalogUUIDs(albumCatalogId: string, prefix: string): Promise<Record<string, string>> {
  const supabase = createClient();

  const { data: catalogStickers } = await supabase
    .from('stickers_catalog')
    .select('id, number')
    .eq('album_id', albumCatalogId);

  const map: Record<string, string> = {};
  for (const s of catalogStickers ?? []) {
    map[`${prefix}-${s.number}`] = s.id;
  }
  return map;
}

// Devuelve el inventario del usuario como InventoryMap (localId → UserSticker)
async function fetchInventory(instanceId: string, prefix: string): Promise<InventoryMap> {
  const supabase = createClient();

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

interface UseInventoryOptions {
  /** Slug del álbum — si se conoce, evita un query a user_albums para obtener el prefijo */
  slug?: string;
  /** ID del catálogo del álbum — si se conoce, evita un query a user_albums en fetchCatalogUUIDs */
  albumCatalogId?: string;
}

export function useInventory(
  instanceId: string,
  userId: string | null,
  { slug, albumCatalogId }: UseInventoryOptions = {}
) {
  const qc = useQueryClient();
  const invalidateTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => clearTimeout(invalidateTimerRef.current);
  }, []);

  // Prefijo del álbum — si slug se conoce se usa initialData y nunca se hace un query a DB
  const { data: prefix = '' } = useQuery({
    queryKey: ['album-prefix', instanceId],
    enabled: !!instanceId && !!userId && !slug,
    staleTime: Infinity,
    initialData: slug ? catalogPrefix(slug) : undefined,
    queryFn: () => fetchAlbumPrefix(instanceId),
  });

  // albumCatalogId cacheado — si viene por prop se usa initialData, sin query a DB
  const { data: resolvedAlbumCatalogId = '' } = useQuery({
    queryKey: ['album-catalog-id', instanceId],
    enabled: !!instanceId && !!userId && !albumCatalogId,
    staleTime: Infinity,
    initialData: albumCatalogId,
    queryFn: () => fetchAlbumCatalogId(instanceId),
  });

  // Mapa UUID — se carga de forma lazy en la primera mutación (no en la carga inicial).
  // Cacheado para siempre con staleTime: Infinity; el fallback en mutationFn lo obtiene
  // bajo demanda si todavía no está en cache cuando el usuario marca su primera figura.

  // Inventario del usuario — solo consulta user_stickers
  const query = useQuery({
    queryKey: ['inventory', instanceId, userId],
    enabled: !!instanceId && !!userId && !!prefix,
    queryFn: () => fetchInventory(instanceId, prefix),
    staleTime: 30_000,
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
    },
    // Debounce: N mutaciones rápidas consecutivas generan un solo refetch al terminar
    onSettled: () => {
      clearTimeout(invalidateTimerRef.current);
      invalidateTimerRef.current = setTimeout(() => {
        qc.invalidateQueries({ queryKey: ['inventory', instanceId] });
      }, 300);
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
        uuidMap = await fetchCatalogUUIDs(resolvedAlbumCatalogId, prefix);
        qc.setQueryData(['catalog-uuids', instanceId], uuidMap);
      }

      const stickerCatalogId = uuidMap[stickerId];
      if (!stickerCatalogId) {
        throw new Error(`UUID no encontrado para la figura ${stickerId}`);
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
