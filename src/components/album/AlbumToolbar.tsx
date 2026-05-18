'use client';

import { useUIStore } from '@/store/uiStore';
import { FilterType } from '@/types';

interface FilterOption {
  value: FilterType;
  label: string;
  icon: React.ReactNode;
  color: string;
  activeBg: string;
}

const FILTERS: FilterOption[] = [
  {
    value: 'all',
    label: 'Todas',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M3 8l5-5m8 0l5 5M3 16l5 5m8 0l5-5M3 12h18" />
      </svg>
    ),
    color: 'rgba(100,116,139,1)',
    activeBg: 'rgba(100,116,139,0.15)',
  },
  {
    value: 'owned',
    label: 'Tengo',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    color: '#10b981',
    activeBg: 'rgba(16,185,129,0.15)',
  },
  {
    value: 'missing',
    label: 'Faltan',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    color: '#f97316',
    activeBg: 'rgba(249,115,22,0.15)',
  },
  {
    value: 'repeated',
    label: 'Repetidas',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M17 2l4 4-4 4" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <path d="M7 22l-4-4 4-4" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
    color: '#eab308',
    activeBg: 'rgba(234,179,8,0.15)',
  },
];

export function AlbumToolbar() {
  const { filter, setFilter } = useUIStore();

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
              className="pressable flex-1 flex items-center justify-center gap-1.5 rounded-[9px] py-1.5 text-xs font-semibold transition-all duration-200"
              style={{
                background: active ? f.activeBg : 'rgba(255,255,255,0.04)',
                color: f.color,
                opacity: active ? 1 : 0.7,
                border: active ? `1px solid ${f.color}` : '1px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              title={f.label}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {f.icon}
              </span>
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
