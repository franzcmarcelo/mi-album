'use client';

import { create } from 'zustand';
import { FilterType } from '@/types';

export type CardSize = 'sm' | 'md' | 'lg';

interface UIState {
  activeSection: string | null;
  filter: FilterType;
  searchQuery: string;
  cardSize: CardSize;
  /** true mientras el usuario está en una página de detalle de álbum */
  albumPageActive: boolean;
  /** true cuando el modal de compartir debe estar abierto */
  albumShareOpen: boolean;

  setActiveSection: (section: string | null) => void;
  setFilter: (filter: FilterType) => void;
  setSearchQuery: (q: string) => void;
  setCardSize: (size: CardSize) => void;
  setAlbumPageActive: (v: boolean) => void;
  setAlbumShareOpen: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeSection: null,
  filter: 'all',
  searchQuery: '',
  cardSize: 'md',
  albumPageActive: false,
  albumShareOpen: false,

  setActiveSection: (section) => set({ activeSection: section }),
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setCardSize: (cardSize) => set({ cardSize }),
  setAlbumPageActive: (v) => set({ albumPageActive: v }),
  setAlbumShareOpen: (v) => set({ albumShareOpen: v }),
}));
