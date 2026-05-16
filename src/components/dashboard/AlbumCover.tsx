'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { AlbumCatalog } from '@/types';

interface AlbumCoverProps {
  album: AlbumCatalog;
  instanceId: string;
  customName: string;
  progress: number;
  owned: number;
  total: number;
  onRename: (name: string) => void;
  onDelete: () => void;
}

const COVER_STYLES: Record<string, { grad: string; glow: string; icon: string }> = {
  'panini-2024': {
    grad: 'linear-gradient(155deg, #1d4ed8 0%, #1e1b4b 100%)',
    glow: 'rgba(99,102,241,0.4)',
    icon: '⚽',
  },
  '3reyes-2024': {
    grad: 'linear-gradient(155deg, #065f46 0%, #064e3b 100%)',
    glow: 'rgba(16,185,129,0.4)',
    icon: '🏆',
  },
};

export function AlbumCover({ album, instanceId, customName, progress, owned, total, onRename, onDelete }: AlbumCoverProps) {
  const style = COVER_STYLES[album.slug] ?? {
    grad: 'linear-gradient(155deg, #1f2937 0%, #111827 100%)',
    glow: 'rgba(107,114,128,0.3)',
    icon: '📚',
  };
  const missing = total - owned;
  const isComplete = progress >= 100;
  const progressWidth = `${Math.min(progress, 100)}%`;

  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(customName);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuOpen]);

  // Focus input when editing starts
  useEffect(() => {
    if (editing) {
      setEditName(customName);
      setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 0);
    }
  }, [editing, customName]);

  function openMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen((v) => !v);
  }

  function startEdit(e: React.MouseEvent) {
    e.preventDefault();
    setMenuOpen(false);
    setEditing(true);
  }

  function submitRename() {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== customName) onRename(trimmed);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') submitRename();
    if (e.key === 'Escape') setEditing(false);
  }

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    setMenuOpen(false);
    onDelete();
  }

  return (
    <div className="relative stagger-item">
      {/* Card link */}
      <Link href={`/album/${instanceId}`} className="block pressable" style={{ textDecoration: 'none' }}>
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '18px',
            aspectRatio: '3/4',
            background: style.grad,
            boxShadow: `0 8px 32px ${style.glow}, 0 2px 8px rgba(0,0,0,0.4)`,
            border: '1px solid rgba(255,255,255,0.08)',
            transition: 'box-shadow 200ms var(--ease-out), transform 200ms var(--ease-out)',
          }}
        >
          {/* Diagonal pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 14px, rgba(255,255,255,0.03) 14px, rgba(255,255,255,0.03) 28px)',
            pointerEvents: 'none',
          }} />
          {/* Top glow orb */}
          <div style={{
            position: 'absolute', top: '-20px', right: '-20px',
            width: '120px', height: '120px', borderRadius: '50%',
            background: `radial-gradient(circle, ${style.glow} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
          {/* Content */}
          <div style={{
            position: 'relative', zIndex: 1, height: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            padding: '14px 12px 12px',
          }}>
            {/* Top */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                  {album.publisher}
                </span>
                {isComplete && (
                  <span style={{
                    background: 'var(--gold)', color: '#07090f',
                    fontSize: '7.5px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
                    borderRadius: '5px', padding: '2px 6px',
                  }}>✓ COMPLETO</span>
                )}
              </div>
              <div style={{ fontSize: '30px', lineHeight: 1 }}>{style.icon}</div>
              <h2 style={{
                color: 'white', fontWeight: 800, fontSize: '15px',
                margin: '6px 0 2px', lineHeight: 1.2, letterSpacing: '-0.01em',
              }}>
                {customName}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: '10px', margin: 0 }}>
                {album.name} · {album.year}
              </p>
            </div>
            {/* Bottom */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <div style={{
                  background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: '8px', padding: '4px 8px',
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#34d399', display: 'block', lineHeight: 1 }}>{owned}</span>
                  <span style={{ fontSize: '8px', color: 'rgba(52,211,153,0.6)', fontWeight: 600 }}>tengo</span>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', padding: '4px 8px',
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', display: 'block', lineHeight: 1 }}>{missing}</span>
                  <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>faltan</span>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{owned}/{total}</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'white' }}>{progress}%</span>
                </div>
                <div style={{ height: '3px', borderRadius: '99px', background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '99px', width: progressWidth,
                    background: isComplete
                      ? 'linear-gradient(90deg, #f59e0b, #fcd34d)'
                      : 'linear-gradient(90deg, #6366f1, #06b6d4)',
                    transition: 'width 0.5s var(--ease-out)',
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Actions button — sibling of Link so it sits on top via z-index */}
      <div ref={menuRef} style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
        <button
          onClick={openMenu}
          className="pressable"
          style={{
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            padding: '5px 7px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'rgba(255,255,255,0.75)',
          }}
          title="Acciones"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
          </svg>
        </button>

        {menuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            background: 'white',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.08)',
            overflow: 'hidden',
            minWidth: '148px',
          }}>
            <button
              onClick={startEdit}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                width: '100%', padding: '10px 14px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 500, color: '#111827',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar nombre
            </button>
            <div style={{ height: '1px', background: '#f3f4f6', margin: '0 10px' }} />
            <button
              onClick={handleDelete}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                width: '100%', padding: '10px 14px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 500, color: '#ef4444',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
              Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Rename overlay */}
      {editing && (
        <div
          className="modal-content"
          style={{
            position: 'absolute', inset: 0, zIndex: 20,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '12px', borderRadius: '18px',
            background: 'rgba(7,9,15,0.88)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Editar nombre
          </span>
          <input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '14px', fontWeight: 600,
              color: 'white',
              width: 'calc(100% - 32px)',
              outline: 'none',
              textAlign: 'center',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', width: 'calc(100% - 32px)' }}>
            <button
              onClick={() => setEditing(false)}
              className="pressable flex-1"
              style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '9px', padding: '8px',
                fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
              }}
            >Cancelar</button>
            <button
              onClick={submitRename}
              className="pressable flex-1"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                border: 'none', borderRadius: '9px', padding: '8px',
                fontSize: '12px', fontWeight: 700, color: 'white',
                cursor: 'pointer',
              }}
            >Guardar</button>
          </div>
        </div>
      )}
    </div>
  );
}
