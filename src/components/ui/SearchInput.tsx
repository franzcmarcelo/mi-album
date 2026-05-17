'use client';

import { useUIStore } from '@/store/uiStore';

export function SearchInput() {
  const { searchQuery, setSearchQuery } = useUIStore();

  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
        style={{ color: 'var(--text-3)' }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Buscar figurita..."
        style={{
          width: '100%',
          background: 'var(--bg-surface)',
          border: '1px solid var(--bg-border)',
          borderRadius: '12px',
          padding: '9px 16px 9px 36px',
          fontSize: '14px',
          color: 'var(--text-1)',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 150ms',
        }}
        onFocus={(e) => { e.target.style.borderColor = '#1d4ed8'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--bg-border)'; }}
      />
    </div>
  );
}
