'use client';

import { useUIStore } from '@/store/uiStore';
import { FilterType } from '@/types';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'owned', label: 'Tengo' },
  { value: 'missing', label: 'Me falta' },
  { value: 'repeated', label: 'Repetidas' },
];

export function FilterBar() {
  const { filter, setFilter } = useUIStore();

  return (
    <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => setFilter(f.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === f.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
