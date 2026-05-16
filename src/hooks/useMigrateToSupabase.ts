'use client';

import { useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

const MIGRATED_KEY = 'supabase_migrated_v1';

function wasMigrated(): boolean {
  return localStorage.getItem(MIGRATED_KEY) === 'true';
}

function markMigrated() {
  localStorage.setItem(MIGRATED_KEY, 'true');
}

interface LocalInstance {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
}

interface LocalSticker {
  stickerId: string;
  state: string;
  quantity: number;
  markedAt: string;
}

async function migrate(user: User) {
  if (wasMigrated()) return;

  const supabase = createClient();

  // Leer instancias de localStorage
  let instances: LocalInstance[] = [];
  try {
    instances = JSON.parse(localStorage.getItem('user_album_instances') ?? '[]');
  } catch {
    markMigrated();
    return;
  }

  if (instances.length === 0) {
    markMigrated();
    return;
  }

  // Obtener catálogos de Supabase para mapear slug → id
  const { data: catalogs } = await supabase
    .from('albums_catalog')
    .select('id, slug');

  if (!catalogs) {
    console.error('[migrate] No se pudieron obtener los catálogos');
    return;
  }

  const slugToId = Object.fromEntries(catalogs.map((c) => [c.slug, c.id]));

  for (const inst of instances) {
    const albumCatalogId = slugToId[inst.slug];
    if (!albumCatalogId) continue;

    // Crear user_album en Supabase
    const { data: userAlbum, error: albumError } = await supabase
      .from('user_albums')
      .insert({
        user_id: user.id,
        album_catalog_id: albumCatalogId,
        name: inst.name,
        status: 'active',
        started_at: inst.createdAt,
      })
      .select('id')
      .single();

    if (albumError || !userAlbum) {
      console.error('[migrate] Error al crear user_album:', albumError);
      continue;
    }

    // Leer inventario de localStorage para esta instancia
    let inventory: Record<string, LocalSticker> = {};
    try {
      inventory = JSON.parse(localStorage.getItem(`inventory_${inst.id}`) ?? '{}');
    } catch {
      continue;
    }

    const stickers = Object.values(inventory);
    if (stickers.length === 0) continue;

    // Obtener sticker_catalog_id a partir del stickerId local
    // Los stickers locales tienen id como "panini-1", "treyes-5", etc.
    // En Supabase, stickers_catalog tiene (album_id, number)
    const { data: catalogStickers } = await supabase
      .from('stickers_catalog')
      .select('id, number')
      .eq('album_id', albumCatalogId);

    if (!catalogStickers) continue;

    const numberToStickerCatalogId = Object.fromEntries(
      catalogStickers.map((s) => [s.number, s.id])
    );

    // El stickerId local es el id del catálogo local (ej. "panini-1")
    // Necesitamos mapear al número para cruzar con Supabase
    const { data: localCatalog } = await import(`@/data/${inst.slug.startsWith('3reyes') ? 'treyes' : 'panini'}.json`);
    const localIdToNumber = Object.fromEntries(
      (localCatalog as { id: string; number: number }[]).map((s) => [s.id, s.number])
    );

    const rows = stickers
      .map((s) => {
        const number = localIdToNumber[s.stickerId];
        const stickerCatalogId = number ? numberToStickerCatalogId[number] : null;
        if (!stickerCatalogId) return null;
        return {
          user_album_id: userAlbum.id,
          sticker_catalog_id: stickerCatalogId,
          state: s.state,
          quantity: s.quantity,
          marked_at: s.markedAt,
        };
      })
      .filter(Boolean);

    if (rows.length > 0) {
      await supabase.from('user_stickers').upsert(rows);
    }
  }

  markMigrated();
}

export function useMigrateToSupabase(user: User | null) {
  const ran = useRef(false);

  useEffect(() => {
    if (!user || ran.current) return;
    ran.current = true;
    migrate(user).catch(console.error);
  }, [user]);
}
