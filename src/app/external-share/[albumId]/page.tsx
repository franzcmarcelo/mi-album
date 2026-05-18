'use client';

import { use } from 'react';
import Link from 'next/link';
import { useExternalAlbum, ALBUM_UUID_RE } from '@/hooks/useExternalAlbum';
import { useAlbumStats } from '@/hooks/useAlbumStats';
import { getSectionColor } from '@/lib/sectionColors';
import { AVAILABLE_ALBUMS } from '@/hooks/useUserAlbums';
import { StickerWithState } from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupBySection(stickers: StickerWithState[]): Record<string, StickerWithState[]> {
  const map: Record<string, StickerWithState[]> = {};
  for (const s of stickers) {
    if (!map[s.section]) map[s.section] = [];
    map[s.section].push(s);
  }
  return map;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ albumId: string }>;
}

export default function ExternalSharePage({ params }: Props) {
  const { albumId } = use(params);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Minimal header — no user info, no navigation to private areas */}
      <header style={{
        background: 'rgba(7,9,15,0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/favicon.png" alt="Mi Álbum" style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '8px' }} />
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-2)' }}>Mi Álbum · Copa del Mundo 2026</span>
        <span style={{
          marginLeft: 'auto',
          fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
          color: 'rgba(165,180,252,0.8)', borderRadius: '6px', padding: '3px 8px',
        }}>
          Solo lectura
        </span>
      </header>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '16px 16px 48px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <AlbumView albumId={albumId} />
      </main>
    </div>
  );
}

// ─── AlbumView ────────────────────────────────────────────────────────────────

function AlbumView({ albumId }: { albumId: string }) {
  const isValidUUID = ALBUM_UUID_RE.test(albumId);
  const { data, isLoading, error } = useExternalAlbum(albumId);
  const stickers = data?.stickers ?? [];
  const { owned, repeated, missing, progress } = useAlbumStats(stickers);

  if (!isValidUUID) {
    return <InvalidLink />;
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
        <p style={{ color: 'var(--text-3)', fontSize: '14px' }}>Cargando…</p>
      </div>
    );
  }

  if (error || !data) {
    return <InvalidLink />;
  }

  const { albumName, slug } = data;
  const catalogMeta = AVAILABLE_ALBUMS.find((a) => a.slug === slug);
  const publisher = catalogMeta?.publisher ?? 'Panini';
  const isComplete = progress >= 100;
  const bySection = groupBySection(stickers);

  return (
    <>
      {/* Stats card */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ height: '3px', background: 'var(--accent-grad-h)' }} />
        <div className="wc-stripes" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.3 }} />

        <div style={{ padding: '16px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ width: '26px', height: '26px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 }}>⚽</div>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(90deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {publisher}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div>
              <h1 style={{ color: 'var(--text-1)', fontWeight: 800, fontSize: '18px', margin: 0, letterSpacing: '-0.01em' }}>{albumName || 'Copa del Mundo 2026'}</h1>
              {isComplete && <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>ÁLBUM COMPLETO ✦</span>}
            </div>
            <span style={{ fontSize: '30px', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, flexShrink: 0, background: isComplete ? 'linear-gradient(135deg, #f59e0b, #fcd34d)' : 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {progress}%
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: '4px', borderRadius: '99px', background: 'var(--bg-raised)', overflow: 'hidden', marginBottom: '14px', display: 'flex' }}>
            {owned > 0 && (
              <div style={{ width: `${(owned / stickers.length) * 100}%`, background: 'linear-gradient(90deg, #059669, #34d399)', borderRadius: '99px', transition: 'width 0.6s' }} />
            )}
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

      {/* Read-only grid by section */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '16px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: '14px', margin: 0 }}>Figuritas</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'Tengo' },
              { color: '#10b981', bg: 'rgba(16,185,129,0.35)', label: 'Repetida' },
              { color: 'var(--text-3)', bg: 'var(--bg-raised)', label: 'Falta' },
            ].map(({ color, bg, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '9px', height: '9px', borderRadius: '3px', background: bg, border: `1px solid ${color}`, flexShrink: 0 }} />
                <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '3px' }}>
                {items.map((s) => {
                  const isOwned    = s.userState === 'owned';
                  const isRepeated = s.userState === 'repeated';
                  const isCollected = isOwned || isRepeated;
                  return (
                    <div key={s.id} title={`#${s.number} ${s.name}`}
                      style={{
                        aspectRatio: '1', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                        background: isRepeated ? 'rgba(16,185,129,0.28)' : isOwned ? 'rgba(16,185,129,0.14)' : 'var(--bg-raised)',
                        border: `1px solid ${isCollected ? 'rgba(16,185,129,0.35)' : 'var(--bg-border)'}`,
                        color: isCollected ? '#34d399' : 'var(--text-3)',
                        userSelect: 'none',
                      }}>
                      {s.number}
                      {isRepeated && (
                        <span style={{ position: 'absolute', bottom: 1, right: 2, fontSize: '6px', fontWeight: 900, color: '#6ee7b7', lineHeight: 1 }}>
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

      {/* Footer */}
      <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-3)', margin: 0 }}>
        Vista de solo lectura · Creado con{' '}
        <span style={{ fontWeight: 700, background: 'linear-gradient(90deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Mi Álbum
        </span>
      </p>
    </>
  );
}

// ─── InvalidLink ──────────────────────────────────────────────────────────────

function InvalidLink() {
  return (
    <div style={{ textAlign: 'center', padding: '48px 16px' }}>
      <p style={{ fontSize: '32px', marginBottom: '12px' }}>🔗</p>
      <p style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: '16px', margin: '0 0 8px' }}>Enlace inválido o expirado</p>
      <p style={{ color: 'var(--text-3)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
        Este álbum no existe o el enlace no es válido.
      </p>
    </div>
  );
}
