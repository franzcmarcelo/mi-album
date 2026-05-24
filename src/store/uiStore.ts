'use client';

import { create } from 'zustand';
import { FilterType } from '@/types';

export type CardSize = 'sm' | 'md' | 'lg';

interface UIState {
  activeSection: string | null;
  filter: FilterType;
  searchQuery: string;
  cardSize: CardSize;

  setActiveSection: (section: string | null) => void;
  setFilter: (filter: FilterType) => void;
  setSearchQuery: (q: string) => void;
  setCardSize: (size: CardSize) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeSection: null,
  filter: 'all',
  searchQuery: '',
  cardSize: 'md',

  setActiveSection: (section) => set({ activeSection: section }),
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setCardSize: (cardSize) => set({ cardSize }),
}));
