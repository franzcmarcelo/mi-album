'use client';

import { useEffect, useState } from 'react';
import { AlbumCatalog } from '@/types';

interface CreateAlbumModalProps {
  onAdd: (slug: string, name: string) => void;
  onClose: () => void;
}

const AVAILABLE_ALBUMS: AlbumCatalog[] = [
  { id: 'panini-2024', slug: 'panini-2024', name: 'Copa del Mundo 2026', year: 2026, publisher: 'Panini', totalStickers: 145 },
  { id: '3reyes-2024', slug: '3reyes-2024', name: 'Copa del Mundo 2026', year: 2026, publisher: '3 Reyes', totalStickers: 150 },
];

const ALBUM_STYLES: Record<string, { grad: string; glow: string; icon: string }> = {
  'panini-2024': { grad: 'linear-gradient(155deg, #1d4ed8, #1e1b4b)', glow: 'var(--accent-glow)', icon: '⚽' },
  '3reyes-2024': { grad: 'linear-gradient(155deg, #065f46, #064e3b)', glow: 'rgba(16,185,129,0.35)', icon: '🏆' },
};

const SUGGESTED_NAMES = new Set(
  AVAILABLE_ALBUMS.map((a) => `Mi Álbum - ${a.publisher}`)
);

export function CreateAlbumModal({ onAdd, onClose }: CreateAlbumModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [albumName, setAlbumName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  function handleSelectAlbum(slug: string) {
    setSelected(slug);
    const publisher = AVAILABLE_ALBUMS.find((a) => a.slug === slug)!.publisher;
    const suggestion = `Mi Álbum - ${publisher}`;
    // Only auto-fill if the user hasn't typed a custom name
    if (!nameTouched || SUGGESTED_NAMES.has(albumName)) {
      setAlbumName(suggestion);
    }
  }

  function handleConfirm() {
    if (!selected) return;
    const publisher = AVAILABLE_ALBUMS.find((a) => a.slug === selected)!.publisher;
    onAdd(selected, albumName.trim() || `Mi Álbum - ${publisher}`);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchMove={(e) => { if (e.target === e.currentTarget) e.preventDefault(); }}
    >
      <div
        className="modal-content w-full max-w-sm space-y-5 rounded-2xl p-6"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--bg-border-hi)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
            Nuevo álbum
          </h2>
          <button
            onClick={onClose}
            className="pressable flex items-center justify-center rounded-full p-1.5"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--bg-border)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth={2.5} strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Name input */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-2)', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Nombre
          </label>
          <input
            type="text"
            value={albumName}
            onChange={(e) => { setAlbumName(e.target.value); setNameTouched(true); }}
            placeholder="Mi Álbum - Panini"
            style={{
              width: '100%',
              background: 'var(--bg-raised)',
              border: '1px solid var(--bg-border-hi)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-1)',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 150ms',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#1d4ed8'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--bg-border-hi)'; }}
          />
        </div>

        {/* Album type selection */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-2)', marginBottom: '8px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Tipo de álbum
          </label>
          <div className="grid grid-cols-2 gap-3">
            {AVAILABLE_ALBUMS.map((album) => {
              const isSelected = selected === album.slug;
              const s = ALBUM_STYLES[album.slug];
              return (
                <button
                  key={album.slug}
                  onClick={() => handleSelectAlbum(album.slug)}
                  className="pressable relative overflow-hidden rounded-xl p-4 text-left"
                  style={{
                    background: s.grad,
                    border: isSelected ? '2px solid #1d4ed8' : '2px solid transparent',
                    boxShadow: isSelected ? `0 0 0 2px var(--accent-glow), 0 8px 24px ${s.glow}` : `0 4px 16px ${s.glow}`,
                    cursor: 'pointer',
                    transition: 'box-shadow 200ms var(--ease-out), border-color 200ms var(--ease-out)',
                  }}
                >
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <span style={{ fontSize: '24px', display: 'block', lineHeight: 1, marginBottom: '6px' }}>{s.icon}</span>
                    <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 2px' }}>
                      {album.publisher}
                    </p>
                    <p style={{ fontSize: '13px', fontWeight: 800, color: 'white', margin: '0 0 2px', lineHeight: 1.2 }}>
                      {album.name}
                    </p>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                      {album.totalStickers} figuras
                    </p>
                  </div>
                  {isSelected && (
                    <div style={{
                      position: 'absolute', top: '8px', right: '8px',
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: '#1d4ed8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!selected}
          className="pressable w-full rounded-xl py-3 font-bold text-sm"
          style={{
            background: selected ? 'var(--accent-grad)' : 'var(--bg-raised)',
            color: selected ? 'white' : 'var(--text-3)',
            border: 'none',
            cursor: selected ? 'pointer' : 'not-allowed',
            transition: 'background 200ms var(--ease-out)',
            boxShadow: selected ? '0 4px 16px var(--accent-glow)' : 'none',
          }}
        >
          Crear álbum
        </button>
      </div>
    </div>
  );
}
