'use client';

import { create } from 'zustand';
import { FilterType } from '@/types';

export type CardSize = 'sm' | 'md' | 'lg';

interface UIState {
  activeAlbumSlug: string;
  activeSection: string | null;
  filter: FilterType;
  searchQuery: string;
  shareModalOpen: boolean;
  cardSize: CardSize;

  setActiveAlbum: (slug: string) => void;
  setActiveSection: (section: string | null) => void;
  setFilter: (filter: FilterType) => void;
  setSearchQuery: (q: string) => void;
  openShareModal: () => void;
  closeShareModal: () => void;
  setCardSize: (size: CardSize) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeAlbumSlug: 'panini-2024',
  activeSection: null,
  filter: 'all',
  searchQuery: '',
  shareModalOpen: false,
  cardSize: 'md',

  setActiveAlbum: (slug) => set({ activeAlbumSlug: slug, activeSection: null, filter: 'all' }),
  setActiveSection: (section) => set({ activeSection: section }),
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  openShareModal: () => set({ shareModalOpen: true }),
  closeShareModal: () => set({ shareModalOpen: false }),
  setCardSize: (cardSize) => set({ cardSize }),
}));
