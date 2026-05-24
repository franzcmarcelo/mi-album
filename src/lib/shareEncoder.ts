import { SharePayload, StickerWithState } from '@/types';

export function encodeInventory(stickers: StickerWithState[], albumSlug: string): string {
  const owned: string[] = [];
  const repeated: string[] = [];

  for (const s of stickers) {
    if (s.userState === 'owned') owned.push(s.code);
    else if (s.userState === 'repeated') repeated.push(s.code);
  }

  const payload: SharePayload = { albumSlug, owned, repeated };
  const json = JSON.stringify(payload);
  return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function decodeInventory(token: string): SharePayload | null {
  try {
    const padded = token.replace(/-/g, '+').replace(/_/g, '/');
    const pad = padded.length % 4;
    const padded2 = pad ? padded + '='.repeat(4 - pad) : padded;
    const json = atob(padded2);
    return JSON.parse(json) as SharePayload;
  } catch {
    return null;
  }
}
