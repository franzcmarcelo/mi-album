import { Sticker, InventoryMap, StickerWithState, FilterType } from '@/types';

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
