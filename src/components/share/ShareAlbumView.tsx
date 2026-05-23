'use client';

import { useState } from 'react';
import { useAlbumStats } from '@/hooks/useAlbumStats';
import { getSectionColor } from '@/lib/sectionColors';
import { StickerWithState } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShareAlbumMeta {
  ownerName: string;
  albumName: string;
  publisher: string;
  catalogName: string;
}

type CardSize = 'sm' | 'md' | 'lg';

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function groupBySection(stickers: StickerWithState[]): Record<string, StickerWithState[]> {
  const map: Record<string, StickerWithState[]> = {};
  for (const s of stickers) {
    if (!map[s.section]) map[s.section] = [];
    map[s.section].push(s);
  }
  return map;
}

const SIZE_CONFIG: Record<CardSize, { minWidth: string; fontSize: string; badgeFontSize: string }> = {
  sm: { minWidth: '32px', fontSize: '9px',  badgeFontSize: '5px' },
  md: { minWidth: '40px', fontSize: '10px', badgeFontSize: '6px' },
  lg: { minWidth: '52px', fontSize: '12px', badgeFontSize: '7px' },
};

// ─── AlbumStatsCard ───────────────────────────────────────────────────────────

export function AlbumStatsCard({ meta, stickers }: { meta: ShareAlbumMeta; stickers: StickerWithState[] }) {
  const { owned, repeated, missing, progress } = useAlbumStats(stickers);
  const isComplete = progress >= 100;

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ height: '3px', background: 'var(--accent-grad-h)' }} />
      <div className="wc-stripes" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.3 }} />

      <div style={{ padding: '16px', position: 'relative', zIndex: 1 }}>
        {/* Publisher + owner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '26px', height: '26px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 }}>⚽</div>
            <div>
              <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(90deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {meta.publisher} · {meta.catalogName}
              </span>
              {meta.ownerName && (
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', marginTop: '1px' }}>
                  {meta.ownerName}
                </span>
              )}
            </div>
          </div>
          <span style={{ fontSize: '30px', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, flexShrink: 0, background: isComplete ? 'linear-gradient(135deg, #f59e0b, #fcd34d)' : 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {progress}%
          </span>
        </div>

        {/* Album name */}
        <div style={{ marginBottom: '10px' }}>
          <h1 style={{ color: 'var(--text-1)', fontWeight: 800, fontSize: '18px', margin: 0, letterSpacing: '-0.01em' }}>{meta.albumName}</h1>
          {isComplete && <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>ÁLBUM COMPLETO ✦</span>}
        </div>

        {/* Progress bar */}
        <div style={{ height: '4px', borderRadius: '99px', background: 'var(--bg-raised)', overflow: 'hidden', marginBottom: '14px', display: 'flex' }}>
          {owned > 0 && <div style={{ width: `${(owned / stickers.length) * 100}%`, background: 'linear-gradient(90deg, #059669, #34d399)', borderRadius: '99px', transition: 'width 0.6s' }} />}
        </div>

        {/* Stat chips */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {[
            { value: owned,           label: 'Tengo',     color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)' },
            { value: repeated,        label: 'Repetidas', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
            { value: missing,         label: 'Faltan',    color: 'var(--text-2)', bg: 'var(--bg-raised)', border: 'var(--bg-border)' },
            { value: stickers.length, label: 'Total',     color: 'var(--text-3)', bg: 'transparent',     border: 'var(--bg-border)' },
          ].map(({ value, label, color, bg, border }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '10px', padding: '8px 10px' }}>
              <span style={{ display: 'block', fontSize: '20px', fontWeight: 900, color, lineHeight: 1 }}>{value}</span>
              <span style={{ fontSize: '9px', fontWeight: 700, color, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── StickerGrid ──────────────────────────────────────────────────────────────

export function StickerGrid({ stickers }: { stickers: StickerWithState[] }) {
  const [size, setSize] = useState<CardSize>('md');
  const bySection = groupBySection(stickers);
  const cfg = SIZE_CONFIG[size];

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '16px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header: title + size control + legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <h2 style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: '14px', margin: 0, marginRight: 'auto' }}>Figuritas</h2>

        {/* S/M/L toggle */}
        <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-raised)', border: '1px solid var(--bg-border)', borderRadius: '10px', padding: '3px' }}>
          {(['sm', 'md', 'lg'] as CardSize[]).map((s) => (
            <button key={s} onClick={() => setSize(s)}
              style={{
                padding: '3px 8px', borderRadius: '7px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', border: 'none',
                background: size === s ? 'var(--bg-surface)' : 'transparent',
                color: size === s ? 'var(--text-1)' : 'var(--text-3)',
                boxShadow: size === s ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
              }}>
              {s === 'sm' ? 'S' : s === 'md' ? 'M' : 'L'}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'Tengo' },
            { color: '#f59e0b', bg: 'rgba(245,158,11,0.18)', label: 'Repetida' },
            { color: 'var(--text-3)', bg: 'var(--bg-raised)', label: 'Falta' },
          ].map(({ color, bg, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '9px', height: '9px', borderRadius: '3px', background: bg, border: `1px solid ${color}`, flexShrink: 0 }} />
              <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      {Object.entries(bySection).map(([section, items]) => {
        const colors = getSectionColor(section);
        const collected = items.filter((s) => s.userState === 'owned' || s.userState === 'repeated').length;

        return (
          <div key={section}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: colors.bg, flexShrink: 0 }} />
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: colors.bg }}>{section}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-3)', marginLeft: 'auto' }}>{collected}/{items.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${cfg.minWidth}, 1fr))`, gap: '3px' }}>
              {items.map((s) => {
                const isOwned    = s.userState === 'owned';
                const isRepeated = s.userState === 'repeated';
                return (
                  <div key={s.id} title={`#${s.code} ${s.name}`}
                    style={{
                      aspectRatio: '1', borderRadius: '6px', fontWeight: 700,
                      fontSize: cfg.fontSize,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                      background: isRepeated ? 'rgba(245,158,11,0.15)' : isOwned ? 'rgba(16,185,129,0.14)' : 'var(--bg-raised)',
                      border: `1px solid ${isRepeated ? 'rgba(245,158,11,0.4)' : isOwned ? 'rgba(16,185,129,0.35)' : 'var(--bg-border)'}`,
                      color: isRepeated ? '#fbbf24' : isOwned ? '#34d399' : 'var(--text-3)',
                      userSelect: 'none',
                    }}>
                    {s.code}
                    {isRepeated && (
                      <span style={{ position: 'absolute', bottom: 1, right: 2, fontWeight: 900, lineHeight: 1, color: '#fbbf24', fontSize: cfg.badgeFontSize }}>
                        ×{s.quantity ?? 1}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── ShareFooter ──────────────────────────────────────────────────────────────

export function ShareFooter() {
  return (
    <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-3)', margin: 0 }}>
      Vista de solo lectura · Creado con{' '}
      <span style={{ fontWeight: 700, background: 'linear-gradient(90deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        Mi Álbum
      </span>
    </p>
  );
}

// ─── SharePageSkeleton ────────────────────────────────────────────────────────

export function SharePageSkeleton() {
  return (
    <>
      {/* Stats card skeleton */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div className="skeleton" style={{ height: '3px' }} />
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Publisher + owner row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="skeleton" style={{ width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div className="skeleton" style={{ width: '140px', height: '10px', borderRadius: '5px' }} />
                <div className="skeleton" style={{ width: '90px', height: '9px', borderRadius: '5px' }} />
              </div>
            </div>
            <div className="skeleton" style={{ width: '52px', height: '32px', borderRadius: '8px' }} />
          </div>
          {/* Album name */}
          <div className="skeleton" style={{ width: '60%', height: '20px', borderRadius: '8px' }} />
          {/* Progress bar */}
          <div className="skeleton" style={{ height: '4px', borderRadius: '99px' }} />
          {/* Stat chips */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: '52px', borderRadius: '10px' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '16px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="skeleton" style={{ width: '80px', height: '14px', borderRadius: '6px', marginRight: 'auto' }} />
          <div className="skeleton" style={{ width: '72px', height: '26px', borderRadius: '10px' }} />
          <div className="skeleton" style={{ width: '130px', height: '14px', borderRadius: '6px' }} />
        </div>
        {/* Sections */}
        {[12, 10, 8].map((cols, i) => (
          <div key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <div className="skeleton" style={{ width: '7px', height: '7px', borderRadius: '50%' }} />
              <div className="skeleton" style={{ width: '80px', height: '9px', borderRadius: '4px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '3px' }}>
              {Array.from({ length: cols }).map((_, j) => (
                <div key={j} className="skeleton" style={{ aspectRatio: '1', borderRadius: '6px' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
