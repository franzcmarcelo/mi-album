'use client';

import { useMemo } from 'react';
import { StickerWithState } from '@/types';
import { getStats } from '@/lib/catalogHelpers';

export function useAlbumStats(stickers: StickerWithState[]) {
  return useMemo(() => getStats(stickers), [stickers]);
}
