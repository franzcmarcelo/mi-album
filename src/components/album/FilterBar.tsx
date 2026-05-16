'use client';

import { useUIStore, CardSize } from '@/store/uiStore';
import { FilterType } from '@/types';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all',      label: 'Todas'    },
  { value: 'owned',    label: 'Tengo'    },
  { value: 'missing',  label: 'Me falta' },
  { value: 'repeated', label: 'Repetidas'},
];

const SIZES: { value: CardSize; label: string }[] = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
];

export function FilterBar() {
  const { filter, setFilter, cardSize, setCardSize } = useUIStore();

  return (
    <div className="flex items-center gap-2">
      {/* Filter pills */}
      <div
        className="flex flex-1 gap-0.5 rounded-xl p-1"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className="pressable flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors"
            style={{
              background: filter === f.value ? 'var(--bg-raised)' : 'transparent',
              color: filter === f.value ? 'var(--text-1)' : 'var(--text-3)',
              border: filter === f.value ? '1px solid var(--bg-border-hi)' : '1px solid transparent',
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Size pills */}
      <div
        className="flex shrink-0 gap-0.5 rounded-xl p-1"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}
      >
        {SIZES.map((s) => (
          <button
            key={s.value}
            onClick={() => setCardSize(s.value)}
            className="pressable rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors"
            style={{
              background: cardSize === s.value ? 'var(--bg-raised)' : 'transparent',
              color: cardSize === s.value ? 'var(--text-1)' : 'var(--text-3)',
              border: cardSize === s.value ? '1px solid var(--bg-border-hi)' : '1px solid transparent',
              cursor: 'pointer',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
