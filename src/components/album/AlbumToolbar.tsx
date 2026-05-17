'use client';

import { useUIStore, CardSize } from '@/store/uiStore';
import { FilterType } from '@/types';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all',      label: 'Todas'  },
  { value: 'owned',    label: 'Tengo'  },
  { value: 'missing',  label: 'Faltan' },
  { value: 'repeated', label: 'Repet.' },
];

const SIZES: { value: CardSize; label: string }[] = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
];

export function AlbumToolbar() {
  const { filter, setFilter, cardSize, setCardSize } = useUIStore();

  return (
    <div
      className="flex items-center gap-2"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--bg-border)',
        borderRadius: '14px',
        padding: '5px',
      }}
    >
      {/* Filter pills */}
      <div className="flex flex-1 gap-0.5">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="pressable flex-1 rounded-[9px] py-1.5 text-xs font-semibold transition-colors"
              style={{
                background: active ? 'var(--bg-raised)' : 'transparent',
                color: active ? 'var(--text-1)' : 'var(--text-3)',
                border: active ? '1px solid var(--bg-border-hi)' : '1px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '20px', background: 'var(--bg-border-hi)', flexShrink: 0 }} />

      {/* Size toggle */}
      <div className="flex gap-0.5 shrink-0">
        {SIZES.map((s) => {
          const active = cardSize === s.value;
          return (
            <button
              key={s.value}
              onClick={() => setCardSize(s.value)}
              className="pressable rounded-[9px] px-2 py-1.5 text-xs font-bold"
              style={{
                background: active ? 'var(--bg-raised)' : 'transparent',
                color: active ? 'var(--text-1)' : 'var(--text-3)',
                border: active ? '1px solid var(--bg-border-hi)' : '1px solid transparent',
                cursor: 'pointer',
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
