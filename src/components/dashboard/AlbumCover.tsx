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
  repeated: number;
  total: number;
  onRename: (name: string) => void;
  onDelete: () => void;
}

const COVER_STYLES: Record<string, {
  grad: string;
  glow: string;
  /**
   * 'multiply' → white bg × dark gradient = dark (transparent-looking). Good for
   *              logos with white background on a dark cover gradient.
   * 'screen'   → dark bg × bright gradient = shows logo colors. Good for logos
   *              with dark/transparent background.
   */
  logoSrc: string;
  logoBlend: 'multiply' | 'screen';
  labelColor: string;
}> = {
  'panini-2024': {
    grad: 'linear-gradient(160deg, #04102e 0%, #0d2a7a 38%, #1a44c8 65%, #081840 100%)',
    glow: 'rgba(29,78,216,0.55)',
    logoSrc: '/images/world-cup-logo-2.png',
    logoBlend: 'multiply',   // white bg disappears on the dark blue gradient
    labelColor: '#93c5fd',
  },
  '3reyes-2024': {
    grad: 'linear-gradient(160deg, #011a0c 0%, #065236 38%, #059669 65%, #022b1a 100%)',
    glow: 'rgba(5,150,105,0.55)',
    logoSrc: '/images/world-cup-logo-2.png',
    logoBlend: 'screen',     // dark bg disappears on the green gradient
    labelColor: '#6ee7b7',
  },
};

const FALLBACK_STYLE = {
  grad: 'linear-gradient(160deg, #111827 0%, #1f2937 100%)',
  glow: 'rgba(107,114,128,0.3)',
  logoSrc: '',
  logoBlend: 'screen' as const,
  labelColor: 'rgba(255,255,255,0.5)',
};

export function AlbumCover({
  album, instanceId, customName, progress, owned, repeated, total, onRename, onDelete,
}: AlbumCoverProps) {
  const style = COVER_STYLES[album.slug] ?? FALLBACK_STYLE;
  const missing = total - owned;
  const isComplete = progress >= 100;
  const progressWidth = `${Math.min(progress, 100)}%`;

  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(customName);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (menuOpen || editing || !tiltRef.current || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    tiltRef.current.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 8}deg) scale(1.02)`;
  }

  function handleMouseLeave() {
    setHovered(false);
    if (tiltRef.current) {
      tiltRef.current.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
    }
  }

  const isHovering = hovered && !menuOpen && !editing;

  return (
    <div
      ref={cardRef}
      className="relative stagger-item"
      style={{ perspective: '900px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* ── Pages stack (same gradient as cover so no ugly color bleed) ── */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, borderRadius: '18px',
        background: style.grad,
        transform: 'translateX(5px) translateY(7px)',
        opacity: 0.4,
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, borderRadius: '18px',
        background: style.grad,
        transform: 'translateX(3px) translateY(4px)',
        opacity: 0.6,
      }} />

      {/* ── Rotating book cover ── */}
      <div ref={tiltRef} style={{
        position: 'relative', zIndex: 1,
        transformStyle: 'preserve-3d',
        transition: 'transform 320ms cubic-bezier(0.23, 1, 0.32, 1)',
      }}>
        <Link href={`/album/${instanceId}`} style={{ display: 'block', textDecoration: 'none' }}>
          <div style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '18px',
            aspectRatio: '3/4',
            background: style.grad,
            boxShadow: isHovering
              ? `0 40px 80px ${style.glow}, 0 20px 48px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.12)`
              : `0 18px 48px ${style.glow}, 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)`,
            transition: 'box-shadow 420ms cubic-bezier(0.23, 1, 0.32, 1)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {/* ── Spine ── */}
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px',
              background: 'rgba(255,255,255,0.08)',
              zIndex: 3,
            }} />

            {/* Hex pattern overlay */}
            <div className="wc-hex" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

            {/* Top ambient glow */}
            <div style={{
              position: 'absolute', top: '-30px', right: '-30px',
              width: '130px', height: '130px', borderRadius: '50%',
              background: `radial-gradient(circle, ${style.glow} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />

            {/* Specular highlight on hover */}
            {isHovering && (
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 55%)',
              }} />
            )}

            {/* Foil sweep — completed albums */}
            {isComplete && (
              <div className="foil-sweep" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }} />
            )}

            {/* ── Visual area (top ~55%) ── */}
            <div style={{
              position: 'relative', zIndex: 2,
              height: '55%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              paddingLeft: '10px',
            }}>
              {/* Publisher + badge row */}
              <div style={{
                position: 'absolute', top: '10px', left: '18px', right: '10px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{
                  fontSize: '8px', fontWeight: 900, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: style.labelColor,
                }}>
                  {album.publisher}
                </span>
                {isComplete ? (
                  <span style={{
                    background: 'var(--accent-grad)', color: '#07090f',
                    fontSize: '7px', fontWeight: 900, letterSpacing: '0.06em',
                    textTransform: 'uppercase', borderRadius: '4px', padding: '2px 5px',
                  }}>
                    ✓ COMPLETO
                  </span>
                ) : (
                  <span style={{ fontSize: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.25)' }}>
                    {album.year}
                  </span>
                )}
              </div>

              {/* Main logo — no container, blend mode handles background removal */}
              {style.logoSrc ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={style.logoSrc}
                  alt=""
                  style={{
                    width: 'clamp(52px, 17vw, 88px)',
                    height: 'auto',
                    objectFit: 'contain',
                    mixBlendMode: style.logoBlend,
                    filter: isHovering
                      ? 'drop-shadow(0 10px 28px rgba(0,0,0,0.75)) brightness(1.08)'
                      : 'drop-shadow(0 5px 16px rgba(0,0,0,0.55))',
                    transform: isHovering ? 'translateY(-3px)' : 'translateY(0)',
                    transition: 'filter 420ms ease, transform 420ms ease',
                  }}
                />
              ) : (
                /* Fallback emoji */
                <div style={{
                  fontSize: '52px', lineHeight: 1,
                  transform: isHovering ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'transform 420ms ease',
                }}>
                  📚
                </div>
              )}

              <p style={{
                fontSize: '7px', fontWeight: 800, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
                margin: '8px 0 0', textAlign: 'center',
              }}>
                FIFA World Cup
              </p>
            </div>

            {/* Gold divider */}
            <div style={{
              height: '1px', marginLeft: '14px', marginRight: '10px',
              background: 'linear-gradient(90deg, rgba(99,102,241,0.18), rgba(99,102,241,0.18))',
              position: 'relative', zIndex: 2,
            }} />

            {/* ── Info area (bottom ~45%) ── */}
            <div style={{
              position: 'relative', zIndex: 2,
              padding: '10px 10px 12px 14px',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              height: 'calc(45% - 1px)',
            }}>
              <h2 style={{
                color: 'white', fontWeight: 800, fontSize: '13px',
                margin: 0, lineHeight: 1.2, letterSpacing: '-0.01em',
              }}>
                {customName}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {/* Stat chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  <div style={{
                    background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.22)',
                    borderRadius: '7px', padding: '3px 6px', flex: '1 1 32%', minWidth: '64px',
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#34d399', display: 'block', lineHeight: 1 }}>
                      {owned}
                    </span>
                    <span style={{ fontSize: '6.5px', color: 'rgba(52,211,153,0.5)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      tengo
                    </span>
                  </div>
                  {repeated > 0 && (
                    <div style={{
                      background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)',
                      borderRadius: '7px', padding: '3px 6px', flex: 1,
                    }}>
                      <span style={{ fontSize: '13px', fontWeight: 900, color: '#fbbf24', display: 'block', lineHeight: 1 }}>
                        {repeated}
                      </span>
                      <span style={{ fontSize: '6.5px', color: 'rgba(251,191,36,0.5)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        repet.
                      </span>
                    </div>
                  )}
                  <div style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '7px', padding: '3px 6px', flex: 1,
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', display: 'block', lineHeight: 1 }}>
                      {missing}
                    </span>
                    <span style={{ fontSize: '6.5px', color: 'rgba(255,255,255,0.22)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      faltan
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <span style={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.28)', fontWeight: 500 }}>
                      {owned} / {total}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 900, color: 'white' }}>
                      {progress}%
                    </span>
                  </div>
                  <div style={{ height: '3px', borderRadius: '99px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '99px', width: progressWidth,
                      background: isComplete
                        ? 'linear-gradient(90deg, #a5b4fc, #a5b4fc)'
                        : 'var(--accent-grad)',
                      transition: 'width 0.5s var(--ease-out)',
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* ⋮ Actions button — sibling of tiltRef so it's unaffected by 3D transform and independent of Link */}
      <div ref={menuRef} style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
        <button
          onClick={openMenu}
          className="pressable"
          style={{
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '5px 7px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
          </svg>
        </button>

        {menuOpen && (
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: '4px',
            background: 'var(--bg-raised)', borderRadius: '12px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            border: '1px solid var(--bg-border-hi)',
            overflow: 'hidden', minWidth: '160px',
          }}>
            <button
              onClick={startEdit}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                width: '100%', padding: '10px 14px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 500, color: 'var(--text-1)', textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar nombre
            </button>
            <div style={{ height: '1px', background: 'var(--bg-border)', margin: '0 10px' }} />
            <button
              onClick={handleDelete}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                width: '100%', padding: '10px 14px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 500, color: '#ef4444', textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
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
        <div className="modal-content" style={{
          position: 'absolute', inset: 0, zIndex: 20,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '12px', borderRadius: '18px',
          background: 'rgba(4,16,46,0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(29,78,216,0.25)',
        }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#a5b4fc',
          }}>
            Editar nombre
          </span>
          <input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: '10px', padding: '8px 12px',
              fontSize: '13px', fontWeight: 600, color: 'white',
              width: 'calc(100% - 32px)', outline: 'none', textAlign: 'center',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', width: 'calc(100% - 32px)' }}>
            <button
              onClick={() => setEditing(false)}
              className="pressable flex-1"
              style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '9px', padding: '8px',
                fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.55)', cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={submitRename}
              className="pressable flex-1"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8, #d97706)',
                border: 'none', borderRadius: '9px', padding: '8px',
                fontSize: '12px', fontWeight: 700, color: 'white', cursor: 'pointer',
              }}
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
