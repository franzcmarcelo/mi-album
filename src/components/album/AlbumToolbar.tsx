'use client';

import { useUIStore, CardSize } from '@/store/uiStore';
import { FilterType } from '@/types';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all',      label: 'Todas'    },
  { value: 'owned',    label: 'Tengo'    },
  { value: 'missing',  label: 'Faltan'   },
  { value: 'repeated', label: 'Repet.'   },
];

const SIZES: { value: CardSize; label: string }[] = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
];

interface AlbumToolbarProps {
  onShare: () => void;
}

export function AlbumToolbar({ onShare }: AlbumToolbarProps) {
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
      {/* Filter pills — flex-1 so they fill available space */}
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

      {/* Divider */}
      <div style={{ width: '1px', height: '20px', background: 'var(--bg-border-hi)', flexShrink: 0 }} />

      {/* Share button */}
      <button
        onClick={onShare}
        className="pressable shrink-0 flex items-center gap-1.5 rounded-[9px] px-2.5 py-1.5"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '11px',
          fontWeight: 700,
          boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
          whiteSpace: 'nowrap',
        }}
        title="Compartir álbum"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Compartir
      </button>
    </div>
  );
}
