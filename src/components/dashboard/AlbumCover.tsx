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

/* ── Color palettes taken from the real covers ──────────────────── */
const PANINI_BLOBS = ['#ef4444','#f97316','#facc15','#4ade80','#60a5fa','#a78bfa','#fb7185','#22d3ee','#a3e635'];
const TREYES_STRIPES = ['#16a34a','#0891b2','#ca8a04','#dc2626','#7c3aed'];

const COVER_META: Record<string, {
  bg: string;
  glow: string;
  variant: 'panini' | '3reyes';
  accent: string;
}> = {
  'panini-2024': {
    bg: 'linear-gradient(170deg, #05112a 0%, #0c2260 45%, #060e22 100%)',
    glow: 'rgba(29,78,216,0.6)',
    variant: 'panini',
    accent: '#93c5fd',
  },
  '3reyes-2024': {
    bg: 'linear-gradient(170deg, #030e14 0%, #083d28 45%, #021008 100%)',
    glow: 'rgba(5,150,105,0.6)',
    variant: '3reyes',
    accent: '#6ee7b7',
  },
};

const FALLBACK_META = {
  bg: 'linear-gradient(160deg, #111827 0%, #1f2937 100%)',
  glow: 'rgba(107,114,128,0.3)',
  variant: 'panini' as const,
  accent: 'rgba(255,255,255,0.5)',
};

export function AlbumCover({
  album, instanceId, customName, progress, owned, repeated, total, onRename, onDelete,
}: AlbumCoverProps) {
  const meta    = COVER_META[album.slug] ?? FALLBACK_META;
  const missing = total - owned;
  const isComplete = progress >= 100;

  const [hovered,  setHovered]  = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [editName, setEditName] = useState(customName);

  const menuRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tiltRef  = useRef<HTMLDivElement>(null);
  const cardRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function outside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [menuOpen]);

  useEffect(() => {
    if (editing) {
      setEditName(customName);
      setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 0);
    }
  }, [editing, customName]);

  function openMenu(e: React.MouseEvent) { e.preventDefault(); e.stopPropagation(); setMenuOpen(v => !v); }
  function startEdit(e: React.MouseEvent) { e.preventDefault(); setMenuOpen(false); setEditing(true); }
  function submitRename() {
    const t = editName.trim();
    if (t && t !== customName) onRename(t);
    setEditing(false);
  }
  function handleDelete(e: React.MouseEvent) { e.preventDefault(); setMenuOpen(false); onDelete(); }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (menuOpen || editing || !tiltRef.current || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    tiltRef.current.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 7}deg) scale(1.025)`;
  }
  function handleMouseLeave() {
    setHovered(false);
    if (tiltRef.current) tiltRef.current.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
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
      {/* Page stack */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: '18px', background: meta.bg, transform: 'translateX(5px) translateY(7px)', opacity: 0.35 }} />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: '18px', background: meta.bg, transform: 'translateX(3px) translateY(4px)', opacity: 0.6 }} />

      {/* Tilt wrapper */}
      <div ref={tiltRef} style={{ position: 'relative', zIndex: 1, transformStyle: 'preserve-3d', transition: 'transform 300ms cubic-bezier(0.23,1,0.32,1)' }}>
        <Link href={`/album/${instanceId}`} style={{ display: 'block', textDecoration: 'none' }}>
          <div style={{
            position: 'relative', overflow: 'hidden', borderRadius: '18px',
            aspectRatio: '3/4', background: meta.bg,
            boxShadow: isHovering
              ? `0 36px 72px ${meta.glow}, 0 16px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.12)`
              : `0 14px 40px ${meta.glow}, 0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)`,
            transition: 'box-shadow 350ms cubic-bezier(0.23,1,0.32,1)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>

            {/* ── Spine ── */}
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', background: 'rgba(255,255,255,0.08)', zIndex: 3 }} />

            {/* ── Cover decoration — variant-specific ── */}
            {meta.variant === 'panini' ? (
              <PaniniDecoration isHovering={isHovering} />
            ) : (
              <TreyesDecoration isHovering={isHovering} />
            )}

            {/* Hover specular */}
            {isHovering && (
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4, background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 55%)' }} />
            )}

            {/* Foil sweep — completed */}
            {isComplete && (
              <div className="foil-sweep" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }} />
            )}

            {/* ── Info area (bottom) ── */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 5,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
              padding: '28px 11px 11px',
            }}>
              {/* Album name */}
              <p style={{ margin: '0 0 7px', fontSize: '12px', fontWeight: 800, color: 'white', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                {customName}
              </p>

              {/* Stat chips */}
              <div style={{ display: 'flex', gap: '3px', marginBottom: '7px' }}>
                <StatChip value={owned} label="tengo" color="#34d399" bg="rgba(16,185,129,0.2)" />
                {repeated > 0 && <StatChip value={repeated} label="repet." color="#fbbf24" bg="rgba(245,158,11,0.18)" />}
                <StatChip value={missing} label="faltan" color="rgba(255,255,255,0.35)" bg="rgba(255,255,255,0.06)" />
              </div>

              {/* Progress bar */}
              <div style={{ height: '3px', borderRadius: '99px', background: 'rgba(255,255,255,0.12)', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${(owned / total) * 100}%`,    background: '#10b981', transition: 'width 0.5s var(--ease-out)' }} />
                <div style={{ width: `${(repeated / total) * 100}%`, background: '#f59e0b', transition: 'width 0.5s var(--ease-out)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.28)', fontWeight: 500 }}>{owned + repeated} / {total}</span>
                <span style={{ fontSize: '10px', fontWeight: 900, color: isComplete ? '#fbbf24' : 'white' }}>{progress}%</span>
              </div>
            </div>

          </div>
        </Link>
      </div>

      {/* ⋮ Menu */}
      <div ref={menuRef} style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
        <button onClick={openMenu} className="pressable" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '5px 7px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.7)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
        </button>
        {menuOpen && (
          <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: 'var(--bg-raised)', borderRadius: '12px', boxShadow: '0 16px 48px rgba(0,0,0,0.6)', border: '1px solid var(--bg-border-hi)', overflow: 'hidden', minWidth: '160px' }}>
            <MenuBtn icon="edit" label="Editar nombre" onClick={startEdit} />
            <div style={{ height: '1px', background: 'var(--bg-border)', margin: '0 10px' }} />
            <MenuBtn icon="delete" label="Eliminar" onClick={handleDelete} danger />
          </div>
        )}
      </div>

      {/* Rename overlay */}
      {editing && (
        <div className="modal-content" style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', borderRadius: '18px', background: 'rgba(4,16,46,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(29,78,216,0.25)' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a5b4fc' }}>Editar nombre</span>
          <input ref={inputRef} value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') setEditing(false); }} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', fontWeight: 600, color: 'white', width: 'calc(100% - 32px)', outline: 'none', textAlign: 'center' }} />
          <div style={{ display: 'flex', gap: '8px', width: 'calc(100% - 32px)' }}>
            <button onClick={() => setEditing(false)} className="pressable flex-1" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', padding: '8px', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }}>Cancelar</button>
            <button onClick={submitRename} className="pressable flex-1" style={{ background: 'linear-gradient(135deg, #1d4ed8, #d97706)', border: 'none', borderRadius: '9px', padding: '8px', fontSize: '12px', fontWeight: 700, color: 'white', cursor: 'pointer' }}>Guardar</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Panini decoration: colorful blob strips on both sides ───────── */
function PaniniDecoration({ isHovering }: { isHovering: boolean }) {
  return (
    <>
      {/* Publisher badge */}
      <div style={{ position: 'absolute', top: '10px', left: '14px', zIndex: 3 }}>
        <span style={{ fontSize: '7px', fontWeight: 900, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(147,197,253,0.7)' }}>PANINI</span>
      </div>
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 3 }}>
        <span style={{ fontSize: '7px', fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)' }}>2026</span>
      </div>

      {/* Left blob strip */}
      <div style={{ position: 'absolute', left: 3, top: 0, bottom: 0, width: '18%', display: 'flex', flexDirection: 'column', zIndex: 2, opacity: isHovering ? 0.85 : 0.7, transition: 'opacity 350ms' }}>
        {PANINI_BLOBS.map((c, i) => (
          <div key={i} style={{ flex: 1, background: c, borderRadius: '0 45% 45% 0' }} />
        ))}
      </div>

      {/* Right blob strip — mirrored, more faded */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '18%', display: 'flex', flexDirection: 'column', zIndex: 2, opacity: isHovering ? 0.55 : 0.4, transition: 'opacity 350ms' }}>
        {[...PANINI_BLOBS].reverse().map((c, i) => (
          <div key={i} style={{ flex: 1, background: c, borderRadius: '45% 0 0 45%' }} />
        ))}
      </div>

      {/* Central content */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '30%' }}>
        {/* "OFFICIAL STICKER COLLECTION" */}
        <p style={{ margin: '0 0 8px', fontSize: '6.5px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
          OFFICIAL STICKER COLLECTION
        </p>

        {/* Large "26" */}
        <div style={{ position: 'relative', lineHeight: 1, marginBottom: '4px' }}>
          <span style={{
            fontSize: 'clamp(52px, 14vw, 72px)', fontWeight: 900, letterSpacing: '-0.06em',
            background: 'linear-gradient(135deg, #93c5fd 0%, #e0f2fe 50%, #bfdbfe 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            display: 'block', textAlign: 'center',
          }}>
            26
          </span>
        </div>

        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/world-cup-logo-2.png" alt="" style={{ width: 'clamp(36px, 10vw, 52px)', height: 'auto', mixBlendMode: 'screen', marginBottom: '6px' }} />

        {/* "FIFA WORLD CUP" */}
        <p style={{ margin: 0, fontSize: '7px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
          FIFA WORLD CUP
        </p>
      </div>
    </>
  );
}

/* ── 3 Reyes decoration: diagonal multicolor bands ───────────────── */
function TreyesDecoration({ isHovering }: { isHovering: boolean }) {
  return (
    <>
      {/* Publisher badge */}
      <div style={{ position: 'absolute', top: '10px', left: '14px', zIndex: 4, display: 'flex', alignItems: 'center', gap: '5px' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#6ee7b7" opacity={0.8}>
          <path d="M2 19h20M5 19V9l7-7 7 7v10M10 19v-6h4v6" />
        </svg>
        <span style={{ fontSize: '7px', fontWeight: 900, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(110,231,183,0.7)' }}>3 REYES</span>
      </div>

      {/* Diagonal stripe bands */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1, opacity: isHovering ? 0.32 : 0.22, transition: 'opacity 350ms' }}>
        {TREYES_STRIPES.map((c, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${i * 22 - 8}%`, left: '-30%', right: '-30%',
            height: '28%',
            background: c,
            transform: 'skewY(-18deg)',
          }} />
        ))}
      </div>

      {/* Central content */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '28%' }}>
        {/* "STICKER ÁLBUM" */}
        <p style={{ margin: '0 0 4px', fontSize: '6.5px', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(110,231,183,0.4)', textAlign: 'center' }}>
          STICKER ÁLBUM
        </p>

        {/* "COPA" */}
        <p style={{ margin: '0 0 -4px', fontSize: '13px', fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
          COPA
        </p>

        {/* Large "26" */}
        <span style={{
          fontSize: 'clamp(52px, 14vw, 72px)', fontWeight: 900, letterSpacing: '-0.06em', lineHeight: 1,
          background: 'linear-gradient(135deg, #6ee7b7 0%, #a7f3d0 50%, #34d399 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          display: 'block', textAlign: 'center', marginBottom: '4px',
        }}>
          26
        </span>

        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/world-cup-logo-2.png" alt="" style={{ width: 'clamp(32px, 9vw, 46px)', height: 'auto', mixBlendMode: 'screen', marginBottom: '6px' }} />

        {/* "MUNDIAL 2026" */}
        <p style={{ margin: 0, fontSize: '7.5px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(110,231,183,0.5)', textAlign: 'center' }}>
          MUNDIAL 2026
        </p>
      </div>
    </>
  );
}

/* ── Small helpers ───────────────────────────────────────────────── */
function StatChip({ value, label, color, bg }: { value: number; label: string; color: string; bg: string }) {
  return (
    <div style={{ background: bg, borderRadius: '6px', padding: '3px 6px', flex: 1 }}>
      <span style={{ display: 'block', fontSize: 'clamp(11px, 3vw, 13px)', fontWeight: 900, color, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: '6px', color, opacity: 0.65, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </div>
  );
}

function MenuBtn({ icon, label, onClick, danger }: { icon: 'edit' | 'delete'; label: string; onClick: (e: React.MouseEvent) => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: danger ? '#ef4444' : 'var(--text-1)', textAlign: 'left' }}
      onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      {icon === 'edit' ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
        </svg>
      )}
      {label}
    </button>
  );
}
