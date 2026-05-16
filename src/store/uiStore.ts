'use client';

import { create } from 'zustand';
import { FilterType } from '@/types';

interface UIState {
  activeAlbumSlug: string;
  activeSection: string | null;
  filter: FilterType;
  searchQuery: string;
  shareModalOpen: boolean;

  setActiveAlbum: (slug: string) => void;
  setActiveSection: (section: string | null) => void;
  setFilter: (filter: FilterType) => void;
  setSearchQuery: (q: string) => void;
  openShareModal: () => void;
  closeShareModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeAlbumSlug: 'panini-2024',
  activeSection: null,
  filter: 'all',
  searchQuery: '',
  shareModalOpen: false,

  setActiveAlbum: (slug) => set({ activeAlbumSlug: slug, activeSection: null, filter: 'all' }),
  setActiveSection: (section) => set({ activeSection: section }),
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  openShareModal: () => set({ shareModalOpen: true }),
  closeShareModal: () => set({ shareModalOpen: false }),
}));
