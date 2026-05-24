export type StickerState = 'owned' | 'repeated';

export interface Sticker {
  id: string;
  albumId: string;
  number: number;    // orden secuencial interno (1, 2, 3…) — no se muestra al usuario
  code: string;      // identificador visible: "1", "A", "T1", "E67"
  name: string;
  section: string;
  imageUrl?: string | null;
  isSpecial?: boolean; // true para figuras especiales (letras A-F, ESCUDOS TROQUELADOS)
}

export interface UserSticker {
  stickerId: string;
  state: StickerState;
  quantity: number;
  markedAt: string;
}

export interface UserAlbum {
  id: string;
  albumCatalogId: string;
  status: 'active' | 'completed' | 'archived';
  startedAt: string;
  updatedAt: string;
}

export interface AlbumCatalog {
  id: string;
  slug: string;
  name: string;
  year: number;
  publisher: string;
  totalStickers: number;
}

export type FilterType = 'all' | 'owned' | 'missing' | 'repeated';

export interface InventoryMap {
  [stickerId: string]: UserSticker;
}

export interface StickerWithState extends Sticker {
  userState?: StickerState;
  quantity?: number;
}

export interface UserAlbumInstance {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
}

export interface SharePayload {
  albumSlug: string;
  owned: string[];
  repeated: string[];
}
