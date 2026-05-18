'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/hooks/useSession';
import { useUserAlbums, AVAILABLE_ALBUMS } from '@/hooks/useUserAlbums';
import { useAlbumData } from '@/hooks/useAlbumData';
import { useInventory } from '@/hooks/useInventory';
import { useAlbumStats } from '@/hooks/useAlbumStats';
import { mergeWithInventory } from '@/lib/catalogHelpers';
import { encodeInventory, decodeInventory } from '@/lib/shareEncoder';
import { getSectionColor } from '@/lib/sectionColors';
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

function buildFaltantesText(publisher: string, stickers: StickerWithState[]): string {
  const faltantes = stickers.filter((s) => !s.userState);
  if (faltantes.length === 0) return '';
  const bySection = groupBySection(faltantes);
  const lines: string[] = ['Me faltan estas figuras:\n', `📘 Álbum: ${publisher}\n`];
  for (const [section, items] of Object.entries(bySection)) {
    lines.push(`📌 ${section}: ${items.map((s) => `#${s.number}`).join(', ')}`);
  }
  lines.push('\n¡Si tienes alguna, avísame! 🙌');
  return lines.join('\n');
}

function buildRepetidasText(publisher: string, stickers: StickerWithState[]): string {
  const repetidas = stickers.filter((s) => s.userState === 'repeated');
  if (repetidas.length === 0) return '';
  const bySection = groupBySection(repetidas);
  const lines: string[] = ['Tengo repetidas:\n', `📘 Álbum: ${publisher}\n`];
  for (const [section, items] of Object.entries(bySection)) {
    const nums = items
      .map((s) => ((s.quantity ?? 1) > 1 ? `#${s.number} ×${s.quantity}` : `#${s.number}`))
      .join(', ');
    lines.push(`🔄 ${section}: ${nums}`);
  }
  lines.push('\n¡Las ofrezco para intercambio! 🤝');
  return lines.join('\n');
}

// ─── CopyCard ────────────────────────────────────────────────────────────────

function CopyCard({
  icon,
  title,
  description,
  content,
  waContent,
  preview,
}: {
  icon: string;
  title: string;
  description: string;
  content: string;
  waContent?: string;
  preview: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleWA() {
    window.open(`https://wa.me/?text=${encodeURIComponent(waContent ?? content)}`, '_blank');
  }

  return (
    <div
      style={{
        borderRadius: '12px',
        border: '1px solid var(--bg-border)',
        overflow: 'hidden',
        background: 'var(--bg-surface)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 14px 8px',
          background: 'var(--bg-raised)',
          borderBottom: '1px solid var(--bg-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '14px' }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-1)' }}>
            {title}
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-3)', marginTop: '1px' }}>
            {description}
          </p>
        </div>
      </div>

      {/* Content row */}
      <div
        style={{
          padding: '10px 12px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <p
          style={{
            flex: 1,
            margin: 0,
            fontSize: '11px',
            color: 'var(--text-3)',
            fontFamily: 'monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {preview}
        </p>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="pressable shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold"
          style={{
            background: copied ? 'rgba(16,185,129,0.15)' : 'var(--bg-raised)',
            border: `1px solid ${copied ? 'rgba(16,185,129,0.35)' : 'var(--bg-border-hi)'}`,
            color: copied ? '#34d399' : 'var(--text-1)',
            cursor: 'pointer',
            transition: 'all 200ms',
            whiteSpace: 'nowrap',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>

        {/* WA button */}
        <button
          onClick={handleWA}
          className="pressable shrink-0 flex items-center justify-center rounded-lg p-1.5"
          style={{
            background: 'rgba(37,211,102,0.12)',
            border: '1px solid rgba(37,211,102,0.25)',
            color: '#25D366',
            cursor: 'pointer',
          }}
          title="Enviar por WhatsApp"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── ShareContent ─────────────────────────────────────────────────────────────

function ShareContent({
  stickers,
  publisher,
  label,
}: {
  stickers: StickerWithState[];
  publisher: string;
  label: string;
}) {
  const { owned, repeated, missing, progress } = useAlbumStats(stickers);
  const isComplete = progress >= 100;
  const repetidasList = stickers.filter((s) => s.userState === 'repeated');

  return (
    <>
      {/* Header card */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--bg-border)',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gold top bar */}
        <div style={{ height: '3px', background: 'var(--accent-grad-h)' }} />

        {/* WC stripes */}
        <div
          className="wc-stripes"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.3 }}
        />

        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '180px',
            background:
              'radial-gradient(circle at top right, rgba(29,78,216,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ padding: '16px', position: 'relative', zIndex: 1 }}>
          {/* Brand row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                flexShrink: 0,
              }}
            >
              ⚽
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {label}
            </span>
          </div>

          {/* Title + % */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px',
            }}
          >
            <div>
              <h1
                style={{
                  color: 'var(--text-1)',
                  fontWeight: 800,
                  fontSize: '18px',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Copa del Mundo 2026
              </h1>
              {isComplete && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'var(--gold)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  ÁLBUM COMPLETO ✦
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: '30px',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                flexShrink: 0,
                background: isComplete
                  ? 'linear-gradient(135deg, #f59e0b, #fcd34d)'
                  : 'linear-gradient(135deg, #6366f1, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {progress}%
            </span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              height: '4px',
              borderRadius: '99px',
              background: 'var(--bg-raised)',
              overflow: 'hidden',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: '99px',
                width: `${progress}%`,
                background: isComplete
                  ? 'linear-gradient(90deg, #f59e0b, #fcd34d)'
                  : 'var(--accent-grad-h)',
              }}
            />
          </div>

          {/* Stat chips */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '6px',
            }}
          >
            {[
              {
                value: owned,
                label: 'Tengo',
                color: '#10b981',
                bg: 'rgba(16,185,129,0.1)',
                border: 'rgba(16,185,129,0.2)',
              },
              {
                value: repeated,
                label: 'Repetidas',
                color: '#f59e0b',
                bg: 'rgba(245,158,11,0.1)',
                border: 'rgba(245,158,11,0.2)',
              },
              {
                value: missing,
                label: 'Faltan',
                color: 'var(--text-2)',
                bg: 'var(--bg-raised)',
                border: 'var(--bg-border)',
              },
              {
                value: stickers.length,
                label: 'Total',
                color: 'var(--text-3)',
                bg: 'transparent',
                border: 'var(--bg-border)',
              },
            ].map(({ value, label, color, bg, border }) => (
              <div
                key={label}
                style={{
                  background: bg,
                  border: `1px solid ${border}`,
                  borderRadius: '10px',
                  padding: '8px 10px',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: '20px',
                    fontWeight: 900,
                    color,
                    lineHeight: 1,
                  }}
                >
                  {value}
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color,
                    opacity: 0.65,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Repetidas grouped by section */}
      {repetidasList.length > 0 && (() => {
        const bySection = groupBySection(repetidasList);
        return (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--bg-border)',
              borderRadius: '16px',
              padding: '14px 16px',
            }}
          >
            <h2
              style={{
                color: 'var(--text-1)',
                fontWeight: 700,
                fontSize: '14px',
                margin: '0 0 12px',
              }}
            >
              Repetidas · {repeated}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(bySection).map(([section, items]) => {
                const c = getSectionColor(section);
                return (
                  <div key={section}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        marginBottom: '6px',
                      }}
                    >
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: c.bg,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: c.bg,
                        }}
                      >
                        {section}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {items.map((s) => (
                        <span
                          key={s.id}
                          style={{
                            background: `${c.bg}18`,
                            border: `1px solid ${c.bg}40`,
                            color: c.bg,
                            borderRadius: '7px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          #{s.number}
                          <span style={{ opacity: 0.7, marginLeft: '3px' }}>
                            ×{s.quantity ?? 1}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Full grid */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--bg-border)',
          borderRadius: '16px',
          padding: '14px 16px',
        }}
      >
        <h2
          style={{
            color: 'var(--text-1)',
            fontWeight: 700,
            fontSize: '14px',
            margin: '0 0 10px',
          }}
        >
          Todas las figuras
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(42px, 1fr))',
            gap: '4px',
          }}
        >
          {stickers.map((s) => (
            <div
              key={s.id}
              title={`#${s.number} ${s.name}`}
              style={{
                aspectRatio: '1',
                borderRadius: '7px',
                fontSize: '10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  s.userState === 'owned'
                    ? 'rgba(16,185,129,0.15)'
                    : s.userState === 'repeated'
                    ? 'rgba(245,158,11,0.15)'
                    : 'var(--bg-raised)',
                border: `1px solid ${
                  s.userState === 'owned'
                    ? 'rgba(16,185,129,0.3)'
                    : s.userState === 'repeated'
                    ? 'rgba(245,158,11,0.3)'
                    : 'var(--bg-border)'
                }`,
                color:
                  s.userState === 'owned'
                    ? '#10b981'
                    : s.userState === 'repeated'
                    ? '#f59e0b'
                    : 'var(--text-3)',
              }}
            >
              {s.number}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '14px', marginTop: '12px' }}>
          {[
            { color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'Tengo' },
            { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Repetida' },
            { color: 'var(--text-3)', bg: 'var(--bg-raised)', label: 'Falta' },
          ].map(({ color, bg, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '3px',
                  background: bg,
                  border: `1px solid ${color}`,
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-3)', margin: 0 }}>
        Creado con{' '}
        <span
          style={{
            fontWeight: 700,
            background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Mi Álbum
        </span>{' '}
        · Copa del Mundo 2026
      </p>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ token: string }>;
}

export default function SharePage({ params }: Props) {
  const { token } = use(params);

  // Mode detection
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
  const isLocalId = /^\d{10,}-[a-z0-9]+$/.test(token);
  const ownerMode = isUUID || isLocalId;

  return (
    <div
      style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '16px 16px 48px' }}
    >
      <div
        style={{
          margin: '0 auto',
          maxWidth: '640px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {ownerMode ? (
          <OwnerView instanceId={token} />
        ) : (
          <TokenView token={token} />
        )}
      </div>
    </div>
  );
}

// ─── Owner view ───────────────────────────────────────────────────────────────

function OwnerView({ instanceId }: { instanceId: string }) {
  const { user, loading: sessionLoading } = useSession();
  const { getInstanceById, isLoading: albumsLoading } = useUserAlbums(user);
  const instance = getInstanceById(instanceId);
  const catalogMeta = instance
    ? AVAILABLE_ALBUMS.find((a) => a.slug === instance.slug) ?? null
    : null;

  const { data: catalog = [], isLoading: catalogLoading } = useAlbumData(
    instance?.slug ?? ''
  );
  const { data: inventory = {} } = useInventory(instanceId, user?.id ?? null);

  const stickers = mergeWithInventory(catalog, inventory);
  const stats = useAlbumStats(stickers);

  const shareToken =
    typeof window !== 'undefined' && stickers.length > 0
      ? encodeInventory(stickers, instance?.slug ?? '')
      : '';
  const shareUrl =
    typeof window !== 'undefined' && shareToken
      ? `${window.location.origin}/share/${shareToken}`
      : '';

  const isLoading = sessionLoading || albumsLoading || catalogLoading;
  const publisher = catalogMeta?.publisher ?? 'Panini';
  const albumName = instance?.name ?? 'Mi Álbum';

  const faltantesText = buildFaltantesText(publisher, stickers);
  const repetidasText = buildRepetidasText(publisher, stickers);
  const waUrlText = `Mira mi álbum "${albumName}" 🏆 ${shareUrl}`;

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
        }}
      >
        <p style={{ color: 'var(--text-3)', fontSize: '14px' }}>Cargando…</p>
      </div>
    );
  }

  if (!instance) {
    return (
      <p style={{ color: 'var(--text-3)', fontSize: '15px', textAlign: 'center' }}>
        Álbum no encontrado
      </p>
    );
  }

  return (
    <>
      {/* Back link */}
      <Link
        href={`/album/${instanceId}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: 500,
          color: 'rgba(241,245,249,0.56)',
          textDecoration: 'none',
          padding: '4px 0',
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Mi álbum
      </Link>

      {/* Share actions panel */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--bg-border)',
          borderRadius: '16px',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <h2
          style={{
            color: 'var(--text-1)',
            fontWeight: 700,
            fontSize: '14px',
            margin: '0 0 2px',
          }}
        >
          Compartir
        </h2>

        {/* Enlace */}
        {shareUrl && (
          <CopyCard
            icon="🔗"
            title="Enlace"
            description="Cualquiera con el link puede ver tu progreso completo"
            content={shareUrl}
            waContent={waUrlText}
            preview={waUrlText.length > 52 ? `${waUrlText.slice(0, 52)}…` : waUrlText}
          />
        )}

        {/* Faltantes */}
        {stats.missing > 0 && faltantesText && (
          <CopyCard
            icon="❌"
            title={`Faltantes · ${stats.missing} figuras`}
            description="Texto listo para pedir figuras a tus contactos"
            content={faltantesText}
            preview={`Me faltan ${stats.missing} figuras del álbum "${albumName}"…`}
          />
        )}

        {/* Repetidas */}
        {stats.repeated > 0 && repetidasText && (
          <CopyCard
            icon="🔄"
            title={`Repetidas · ${stats.repeated} figuras`}
            description="Texto para ofrecer tus repetidas e intercambiar"
            content={repetidasText}
            preview={`Tengo ${stats.repeated} repetidas del álbum "${albumName}"…`}
          />
        )}
      </div>

      {/* Progress header + grid */}
      <ShareContent
        stickers={stickers}
        publisher={publisher}
        label={`Tu progreso · ${publisher}`}
      />
    </>
  );
}

// ─── Token (public) view ──────────────────────────────────────────────────────

function TokenView({ token }: { token: string }) {
  const payload = decodeInventory(token);

  const albumSlug = payload?.albumSlug ?? '';
  const { data: catalog = [], isLoading } = useAlbumData(albumSlug);

  if (!payload) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
        }}
      >
        <p style={{ color: 'var(--text-3)', fontSize: '15px' }}>
          Enlace inválido o expirado
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
        }}
      >
        <p style={{ color: 'var(--text-3)', fontSize: '14px' }}>Cargando…</p>
      </div>
    );
  }

  const stickers: StickerWithState[] = catalog.map((s) => ({
    ...s,
    userState: payload.owned.includes(s.number)
      ? 'owned'
      : payload.repeated.includes(s.number)
      ? 'repeated'
      : undefined,
  }));

  const is3reyes = albumSlug.startsWith('3reyes');
  const publisher = is3reyes ? '3 Reyes' : 'Panini';

  return (
    <ShareContent
      stickers={stickers}
      publisher={publisher}
      label={`Álbum compartido · ${publisher}`}
    />
  );
}
