'use client';

/**
 * useExternalAlbum
 * Carga el álbum compartido públicamente (sin sesión requerida).
 * Combina catálogo estático + inventario del dueño en un único fetch.
 *
 * queryKey: ['external-album', albumId]  staleTime: 60s
 *
 * Consumidores:
 *   - app/external-share/[albumId]/page.tsx  (vista pública de solo lectura)
 *   - app/external-share/[albumId]/opengraph-image.tsx  (OG image — usa fetch REST directo)
 */

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { StickerWithState } from '@/types';
import { catalogPrefix, buildInventoryMap, mergeWithInventory } from '@/lib/catalogHelpers';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function fetchExternalAlbum(albumId: string) {
  const supabase = createClient();

  const { data: albumRow, error: albumErr } = await supabase
    .from('user_albums')
    .select('user_id, name, albums_catalog!inner(slug)')
    .eq('id', albumId)
    .single();

  if (albumErr || !albumRow) throw new Error('not_found');

  const slug = (albumRow.albums_catalog as unknown as { slug: string }).slug;
  const albumName = (albumRow.name as string) ?? '';
  const userId = albumRow.user_id as string;
  const prefix = catalogPrefix(slug);

  // Nombre del dueño desde perfiles públicos
  const { data: profileRow } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .maybeSingle();
  const ownerName = profileRow?.display_name ?? '';

  // Figuras marcadas por el dueño
  const { data: stickerRows, error: stickersErr } = await supabase
    .from('user_stickers')
    .select('state, quantity, stickers_catalog!inner(number)')
    .eq('user_album_id', albumId);

  if (stickersErr) throw stickersErr;

  const inventory = buildInventoryMap(
    (stickerRows ?? []).map((row) => ({
      number: (row.stickers_catalog as unknown as { number: number }).number,
      state: row.state,
      quantity: row.quantity,
    })),
    prefix
  );

  const file = slug.startsWith('3reyes') ? 'treyes' : 'panini';
  const mod = await import(`@/data/${file}.json`);
  const stickers: StickerWithState[] = mergeWithInventory(mod.default, inventory);

  return { slug, albumName, ownerName, stickers };
}

export function useExternalAlbum(albumId: string) {
  const isValidUUID = UUID_RE.test(albumId);
  return useQuery({
    queryKey: ['external-album', albumId],
    enabled: isValidUUID,
    queryFn: () => fetchExternalAlbum(albumId),
    staleTime: 60_000,
    retry: false,
  });
}

export { UUID_RE as ALBUM_UUID_RE };
