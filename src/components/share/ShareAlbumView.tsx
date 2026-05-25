'use client';

import { useState, useRef } from 'react';
import { useAlbumStats } from '@/hooks/useAlbumStats';
import { getSectionColor, abbreviateSection } from '@/lib/sectionColors';
import { SectionHeader } from '@/components/ui/SectionHeader';
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

const SIZE_CONFIG: Record<CardSize, {
  minWidth: string;
  numSize: string;
  nameFS: string;
  stripH: string;
  stripFS: string;
  badgeFS: string;
  showStrip: boolean;
  showName: boolean;
}> = {
  sm: { minWidth: '36px', numSize: '13px', nameFS: '6px',  stripH: '0',    stripFS: '5px', badgeFS: '7px', showStrip: false, showName: false },
  md: { minWidth: '48px', numSize: '17px', nameFS: '6px',  stripH: '13px', stripFS: '5px', badgeFS: '8px', showStrip: true,  showName: true  },
  lg: { minWidth: '64px', numSize: '26px', nameFS: '7px',  stripH: '20px', stripFS: '7px', badgeFS: '9px', showStrip: true,  showName: true  },
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

export { type CardSize };

const LEGEND = [
  { color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'Tengo' },
  { color: '#f59e0b', bg: 'rgba(245,158,11,0.18)', label: 'Repetida' },
  { color: 'var(--text-3)', bg: 'var(--bg-raised)', label: 'Falta' },
] as const;

/** Barra de controles S/M/L reutilizable fuera del card. */
export function StickerGridControls({ size, onSizeChange }: {
  size: CardSize;
  onSizeChange: (s: CardSize) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-raised)', border: '1px solid var(--bg-border)', borderRadius: '10px', padding: '3px' }}>
      {(['sm', 'md', 'lg'] as CardSize[]).map((s) => (
        <button key={s} onClick={() => onSizeChange(s)}
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
  );
}

// ─── Vista compacta para exportar como imagen ────────────────────────────────

function CompactExport({ stickers, stats, summaryFilter }: {
  stickers: StickerWithState[];
  stats: { owned: number; repeated: number; missing: number; total: number; progress: number };
  summaryFilter: 'all' | 'missing' | 'repeated';
}) {
  const text3   = 'rgba(255,255,255,0.28)';
  const siteUrl = 'mi-album-phi.vercel.app';
  const bySection = groupBySection(stickers);

  const title = summaryFilter === 'all' ? 'Mi Álbum'
    : summaryFilter === 'missing' ? 'Me faltan'
    : 'Repetidas';

  const titleAccent = summaryFilter === 'missing' ? '#f97316'
    : summaryFilter === 'repeated' ? '#fbbf24'
    : '#fff';

  const titleSub = summaryFilter === 'all'
    ? `${stats.owned}/${stats.total} · ${stats.progress}%`
    : summaryFilter === 'missing'
    ? `${stats.missing} figuras`
    : `${stats.repeated} copias`;

  // Construir array plano: por cada sección → celda-etiqueta + N celdas-carta
  type Cell =
    | { kind: 'label'; section: string }
    | { kind: 'card'; s: StickerWithState; section: string };

  const cells: Cell[] = [];
  for (const [section, items] of Object.entries(bySection)) {
    cells.push({ kind: 'label', section });
    for (const s of items) cells.push({ kind: 'card', s, section });
  }

  return (
    <div style={{ background: '#0d1117', padding: '12px', borderRadius: '10px', fontFamily: 'Inter,system-ui,sans-serif' }}>

      {/* ── Cabecera ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        {/* Título izquierda */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
            <span style={{ fontSize: '14px', fontWeight: 900, color: titleAccent, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {title}
            </span>
            <span style={{ fontSize: '9px', fontWeight: 500, color: text3 }}>{titleSub}</span>
          </div>
          <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.18)', marginTop: '2px', display: 'block' }}>
            Copa del Mundo 2026
          </span>
        </div>
        {/* Promo derecha */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '-0.01em', background: 'linear-gradient(90deg,#6366f1,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Mi Álbum
          </div>
          <div style={{ fontSize: '6px', color: text3, marginTop: '1px' }}>Gestiona tu colección</div>
          <div style={{ fontSize: '6px', color: 'rgba(255,255,255,0.18)', marginTop: '1px' }}>{siteUrl}</div>
        </div>
      </div>

      {/* ── Cuadrícula plana: etiquetas de sección inline con las cartas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(14px, 1fr))', gap: '1px' }}>
        {cells.map((cell, idx) => {
          const colors = getSectionColor(cell.section);

          if (cell.kind === 'label') {
            return (
              <div key={`lbl-${cell.section}-${idx}`} style={{ gridColumn: 'span 5' }}>
                <div style={{
                  width: '100%', height: '100%', borderRadius: '2px',
                  background: colors.bg,
                  display: 'flex', alignItems: 'center',
                  padding: '0 4px',
                  overflow: 'hidden',
                }}>
                  <span style={{
                    fontSize: '6px', fontWeight: 900, color: 'rgba(0,0,0,0.75)',
                    textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {abbreviateSection(cell.section)}
                  </span>
                </div>
              </div>
            );
          }

          const { s } = cell;
          const isOwned    = s.userState === 'owned' || s.userState === 'repeated';
          const isRepeated = s.userState === 'repeated';
          const isSpecial  = s.isSpecial === true;

          return (
            <div key={s.id} style={{ aspectRatio: '1', position: 'relative' }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isOwned ? colors.bg + '38' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isOwned ? colors.bg + '65' : colors.bg + '18'}`,
              }}>
                <span style={{ fontSize: '5px', fontWeight: 900, lineHeight: 1, color: isOwned ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.14)' }}>
                  {s.code}
                </span>
                {isRepeated && (
                  <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(245,158,11,0.9)', borderRadius: '1px', fontSize: '4px', fontWeight: 900, color: 'white', padding: '0 1px', lineHeight: '7px' }}>
                    ×{s.quantity ?? 1}
                  </div>
                )}
                {isSpecial && !isOwned && (
                  <div style={{ position: 'absolute', top: 0, right: 1, fontSize: '4px', color: '#fbbf24', lineHeight: 1 }}>✦</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Botón de descarga ────────────────────────────────────────────────────────

function DownloadButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      aria-label="Descargar como imagen"
      className="pressable"
      style={{
        flexShrink: 0,
        width: '30px', height: '30px', borderRadius: '8px',
        background: 'var(--bg-raised)', border: '1px solid var(--bg-border)',
        color: 'var(--text-3)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: loading ? 0.5 : 1, transition: 'opacity 150ms',
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </button>
  );
}

export function StickerGrid({ stickers, size: sizeProp, onSizeChange, hideControls, hideNames, hideProgress, summaryFilter }: {
  stickers: StickerWithState[];
  size?: CardSize;
  onSizeChange?: (s: CardSize) => void;
  hideControls?: boolean;
  hideNames?: boolean;
  hideProgress?: boolean;
  /** Muestra un resumen dentro del card acorde al filtro activo. */
  summaryFilter?: 'all' | 'missing' | 'repeated';
}) {
  const [sizeInternal, setSizeInternal] = useState<CardSize>('md');
  const [downloading, setDownloading]   = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const size = sizeProp ?? sizeInternal;
  const setSize = onSizeChange ?? setSizeInternal;
  const bySection = groupBySection(stickers);
  const cfg = SIZE_CONFIG[size];

  // Estadísticas via hook compartido — misma lógica que el resto de la app
  const stats          = useAlbumStats(stickers);
  // uniqueRepeated: figuras únicas con state='repeated' (para segmentar la barra en "Todas")
  const uniqueRepeated = stickers.filter((s) => s.userState === 'repeated').length;
  const pureOwned      = stats.owned - uniqueRepeated;
  const pctPure        = stats.total > 0 ? (pureOwned      / stats.total) * 100 : 0;
  const pctRep         = stats.total > 0 ? (uniqueRepeated / stats.total) * 100 : 0;

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const { toPng }            = await import('html-to-image');
      const { createRoot }       = await import('react-dom/client');
      const { flushSync }        = await import('react-dom');
      const { createElement }    = await import('react');

      // Contenedor oculto fuera de pantalla, adjunto al DOM para que los estilos resuelvan
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;width:520px;';
      document.body.appendChild(wrapper);

      const root = createRoot(wrapper);

      // flushSync fuerza el commit síncrono en React 18
      flushSync(() => {
        root.render(createElement(CompactExport, { stickers, stats, summaryFilter: summaryFilter! }));
      });

      // Dar un tick adicional para que el navegador pinte los estilos
      await new Promise((r) => setTimeout(r, 80));

      const dataUrl = await toPng(wrapper.firstElementChild as HTMLElement, {
        pixelRatio: 2,
        cacheBust: true,
      });

      root.unmount();
      document.body.removeChild(wrapper);

      const link = document.createElement('a');
      link.download = 'mi-album-resumen.png';
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div ref={containerRef} style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header con controles — solo cuando no se ocultan */}
      {!hideControls && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: '14px', margin: 0, marginRight: 'auto' }}>Figuras</h2>
          <StickerGridControls size={size} onSizeChange={setSize} />
        </div>
      )}

      {/* ── Resumen dinámico ─────────────────────────────────────────────────── */}
      {summaryFilter && (
        <div style={{ padding: '6px 0 16px', borderBottom: '1px solid var(--bg-border)' }}>

          {/* TODAS — tengo | % | faltan + botón descarga + barra */}
          {summaryFilter === 'all' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* Tengo — izquierda */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flex: 1 }}>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: '#34d399', lineHeight: 1 }}>
                    {stats.owned}
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-3)' }}>/{stats.total}</span>
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>tengo</span>
                </div>
                {/* Porcentaje — centro */}
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-2)', flexShrink: 0 }}>
                  {stats.progress}%
                </span>
                {/* Faltan + botón — derecha */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>faltan</span>
                    <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-3)', lineHeight: 1 }}>{stats.missing}</span>
                  </div>
                  <DownloadButton onClick={handleDownload} loading={downloading} />
                </div>
              </div>
              {/* Barra — solo figuras únicas conseguidas, sin repetidas */}
              <div style={{ height: '6px', borderRadius: '99px', background: 'var(--bg-raised)', overflow: 'hidden' }}>
                {pureOwned > 0 && (
                  <div style={{ height: '100%', width: `${pctPure}%`, background: 'linear-gradient(90deg,#059669,#34d399)', borderRadius: '99px', transition: 'width .5s' }} />
                )}
              </div>
            </div>
          )}

          {/* FALTANTES */}
          {summaryFilter === 'missing' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '22px', fontWeight: 900, color: '#f97316', lineHeight: 1 }}>{stats.missing}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>figuras por conseguir</span>
              </div>
              <DownloadButton onClick={handleDownload} loading={downloading} />
            </div>
          )}

          {/* REPETIDAS */}
          {summaryFilter === 'repeated' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '22px', fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>{stats.repeated}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>figuras para intercambiar</span>
              </div>
              <DownloadButton onClick={handleDownload} loading={downloading} />
            </div>
          )}

        </div>
      )}

      {/* Secciones */}
      {Object.entries(bySection).map(([section, items]) => {
        const colors    = getSectionColor(section);
        const collected = items.filter((s) => s.userState === 'owned' || s.userState === 'repeated').length;
        const showAll   = !summaryFilter || summaryFilter === 'all';

        return (
          <div key={section}>
            {/* Encabezado de sección unificado */}
            <div style={{ marginBottom: '6px' }}>
              <SectionHeader
                section={section}
                color={colors.bg}
                collected={collected}
                total={items.length}
                showProgress={showAll}
                showCount={true}
              />
            </div>

            {/* Grid de figuras — mismo aspecto que FiguriteCard */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${cfg.minWidth}, 1fr))`, gap: '4px' }}>
              {items.map((s) => {
                const isOwned    = s.userState === 'owned' || s.userState === 'repeated';
                const isRepeated = s.userState === 'repeated';
                const isSpecial  = s.isSpecial === true;
                const qty        = s.quantity ?? 1;
                const abbrev     = abbreviateSection(s.section);

                return (
                  <div key={s.id} title={`#${s.code} — ${s.name}`} style={{ aspectRatio: '3/4', width: '100%' }}>
                    <div style={{
                      width: '100%', height: '100%',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      display: 'flex', flexDirection: 'column',
                      position: 'relative',
                      userSelect: 'none',
                      border: isOwned
                        ? isSpecial ? '1.5px solid rgba(251,191,36,0.55)' : '1.5px solid rgba(34,197,94,0.4)'
                        : isSpecial ? '1.5px solid rgba(251,191,36,0.3)'  : '1.5px solid rgba(255,255,255,0.07)',
                      background: isOwned
                        ? isSpecial ? 'linear-gradient(160deg, rgba(16,185,129,0.1) 0%, rgba(251,191,36,0.08) 100%)' : 'rgba(16,185,129,0.09)'
                        : isSpecial ? 'rgba(251,191,36,0.04)' : 'rgba(255,255,255,0.03)',
                      boxShadow: isOwned ? '0 2px 10px rgba(16,185,129,0.1)' : '0 1px 4px rgba(0,0,0,0.25)',
                    }}>
                      {/* Insignia dorada — figuras especiales */}
                      {isSpecial && (
                        <div style={{
                          position: 'absolute', top: 3, right: 3, zIndex: 3,
                          fontSize: size === 'lg' ? '10px' : '8px',
                          lineHeight: 1, color: '#fbbf24', pointerEvents: 'none',
                          textShadow: '0 0 6px rgba(251,191,36,0.7)',
                          animation: 'special-star-pulse 2.5s ease-in-out infinite',
                        }}>✦</div>
                      )}

                      {/* Shimmer dorado — especiales no conseguidas */}
                      {isSpecial && !isOwned && (
                        <div style={{ position: 'absolute', inset: 0, zIndex: 1, borderRadius: '8px', overflow: 'hidden', pointerEvents: 'none' }}>
                          <div className="special-shimmer-anim" style={{
                            position: 'absolute', top: '-30%', bottom: '-30%', width: '35%',
                            background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.18) 50%, transparent)',
                            animation: 'special-shimmer 3.5s ease-in-out infinite',
                          }} />
                        </div>
                      )}

                      {/* Strip de sección */}
                      {cfg.showStrip && (
                        <div style={{
                          background: isSpecial
                            ? `linear-gradient(90deg, ${colors.bg}, rgba(251,191,36,0.55))`
                            : colors.bg,
                          minHeight: cfg.stripH, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: '2px 4px',
                          opacity: isOwned ? 1 : 0.4,
                        }}>
                          <span style={{
                            color: 'white', fontSize: cfg.stripFS, fontWeight: 800,
                            letterSpacing: '0.05em', textTransform: 'uppercase',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>{abbrev}</span>
                        </div>
                      )}

                      {/* Número + nombre */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3px 4px', gap: '2px' }}>
                        <span style={{
                          fontSize: cfg.numSize, fontWeight: 900, lineHeight: 1,
                          fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
                          color: isOwned ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.18)',
                        }}>{s.code}</span>
                        {cfg.showName && !hideNames && (
                          <span style={{
                            fontSize: cfg.nameFS, fontWeight: 500, lineHeight: 1.25, textAlign: 'center',
                            color: isOwned ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.1)',
                            maxWidth: '100%', overflow: 'hidden',
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            wordBreak: 'break-word',
                          }}>{s.name}</span>
                        )}
                      </div>

                      {/* Badge de cantidad para repetidas */}
                      {isRepeated && (
                        <div style={{
                          position: 'absolute', bottom: 4, right: 4,
                          background: 'rgba(245,158,11,0.88)',
                          borderRadius: '4px', padding: '1px 4px',
                          fontSize: cfg.badgeFS, fontWeight: 900, color: 'white', lineHeight: 1.4,
                        }}>×{qty}</div>
                      )}
                    </div>
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
