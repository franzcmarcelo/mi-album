'use client';

import { useCallback } from 'react';
import { StickerWithState } from '@/types';
import { encodeInventory, decodeInventory } from '@/lib/shareEncoder';

export function useShare(stickers: StickerWithState[], albumSlug: string) {
  const generateUrl = useCallback(() => {
    const token = encodeInventory(stickers, albumSlug);
    return `${window.location.origin}/share/${token}`;
  }, [stickers, albumSlug]);

  return { generateUrl };
}

export function useDecodeShare(token: string) {
  return decodeInventory(token);
}
