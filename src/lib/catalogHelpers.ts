import { Sticker, InventoryMap, StickerState, StickerWithState, FilterType } from '@/types';

/**
 * Deriva el prefijo de ID local a partir del slug del álbum.
 * Centraliza la única fuente de verdad del patrón "treyes-{n}" / "panini-{n}".
 */
export function catalogPrefix(slug: string): string {
  return slug.startsWith('3reyes') ? 'treyes' : 'panini';
}

/**
 * Construye un InventoryMap a partir de las filas devueltas por Supabase.
 * Cada fila debe incluir el número secuencial interno de la figura.
 * Este es el único lugar donde se construye la clave `${prefix}-${number}`.
 */
export function buildInventoryMap(
  entries: Array<{
    number: number;
    state: string;
    quantity?: number | null;
    markedAt?: string | null;
  }>,
  prefix: string
): InventoryMap {
  const map: InventoryMap = {};
  for (const entry of entries) {
    const localId = `${prefix}-${entry.number}`;
    map[localId] = {
      stickerId: localId,
      state: entry.state as StickerState,
      quantity: entry.quantity ?? 1,
      markedAt: entry.markedAt ?? '',
    };
  }
  return map;
}

export function mergeWithInventory(
  catalog: Sticker[],
  inventory: InventoryMap
): StickerWithState[] {
  return catalog.map((sticker) => {
    const entry = inventory[sticker.id];
    return {
      ...sticker,
      userState: entry?.state,
      quantity: entry?.quantity,
    };
  });
}

export function applyFilter(stickers: StickerWithState[], filter: FilterType): StickerWithState[] {
  switch (filter) {
    case 'owned':
      // Repeated stickers are still "tengo" — you have them, just more than one
      return stickers.filter((s) => s.userState === 'owned' || s.userState === 'repeated');
    case 'missing':
      return stickers.filter((s) => !s.userState);
    case 'repeated':
      return stickers.filter((s) => s.userState === 'repeated');
    default:
      return stickers;
  }
}

export function getStats(stickers: StickerWithState[]) {
  const total = stickers.length;
  const owned = stickers.filter((s) => s.userState === 'owned' || s.userState === 'repeated').length;
  const repeated = stickers
    .filter((s) => s.userState === 'repeated')
    .reduce((sum, sticker) => sum + (sticker.quantity ?? 1), 0);
  const missing = total - owned;
  const progress = total > 0 ? Math.round((owned / total) * 100) : 0;

  return { total, owned, repeated, missing, progress };
}

export function getSections(stickers: Sticker[]): string[] {
  return [...new Set(stickers.map((s) => s.section))];
}

export function getSectionStats(stickers: StickerWithState[], section: string) {
  const sectionStickers = stickers.filter((s) => s.section === section);
  return getStats(sectionStickers);
}
