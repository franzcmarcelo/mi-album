'use client';

import { useEffect, useState } from 'react';
import { StickerWithState } from '@/types';
import { groupBySection } from '@/components/share/ShareAlbumView';

// ─── Helpers de texto para compartir ─────────────────────────────────────────

function buildFaltantesText(publisher: string, albumName: string, stickers: StickerWithState[]): string {
  const faltantes = stickers.filter((s) => !s.userState);
  if (faltantes.length === 0) return '';
  const bySection = groupBySection(faltantes);
  const lines: string[] = [`Me faltan estas figuras:\n`, `📘 Álbum: ${publisher} — ${albumName}\n`];
  for (const [section, items] of Object.entries(bySection)) {
    lines.push(`📌 ${section}: ${items.map((s) => `#${s.code}`).join(', ')}`);
  }
  lines.push('\n¡Si tienes alguna, avísame! 🙌');
  return lines.join('\n');
}

function buildRepetidasText(publisher: string, albumName: string, stickers: StickerWithState[]): string {
  const repetidas = stickers.filter((s) => s.userState === 'repeated');
  if (repetidas.length === 0) return '';
  const bySection = groupBySection(repetidas);
  const lines: string[] = [`Tengo repetidas:\n`, `📘 Álbum: ${publisher} — ${albumName}\n`];
  for (const [section, items] of Object.entries(bySection)) {
    const nums = items
      .map((s) => ((s.quantity ?? 1) > 1 ? `#${s.code} ×${s.quantity}` : `#${s.code}`))
      .join(', ');
    lines.push(`🔄 ${section}: ${nums}`);
  }
  lines.push('\n¡Las ofrezco para intercambio! 🤝');
  return lines.join('\n');
}

// ─── CopyCard ─────────────────────────────────────────────────────────────────

function CopyCard({ icon, title, description, content, waContent, preview }: {
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
    <div style={{ borderRadius: '12px', border: '1px solid var(--bg-border)', overflow: 'hidden', background: 'var(--bg-raised)' }}>
      {/* Header de la tarjeta */}
      <div style={{
        padding: '10px 14px 8px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--bg-border)',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <span style={{ fontSize: '14px' }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-1)' }}>{title}</p>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-3)', marginTop: '1px' }}>{description}</p>
        </div>
      </div>
      {/* Footer con preview + botones */}
      <div style={{ padding: '10px 12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <p style={{
          flex: 1, margin: 0, fontSize: '11px', color: 'var(--text-3)',
          fontFamily: 'monospace', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {preview}
        </p>
        <button
          onClick={handleCopy}
          className="pressable shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold"
          style={{
            background: copied ? 'rgba(16,185,129,0.15)' : 'var(--bg-surface)',
            border: `1px solid ${copied ? 'rgba(16,185,129,0.35)' : 'var(--bg-border-hi)'}`,
            color: copied ? '#34d399' : 'var(--text-1)',
            cursor: 'pointer', transition: 'all 200ms',
            whiteSpace: 'nowrap', fontSize: '12px', fontWeight: 700,
          }}
        >
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>
        <button
          onClick={handleWA}
          className="pressable shrink-0 flex items-center justify-center rounded-lg p-1.5"
          style={{
            background: 'rgba(37,211,102,0.12)',
            border: '1px solid rgba(37,211,102,0.25)',
            color: '#25D366', cursor: 'pointer',
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

// ─── ShareModal ───────────────────────────────────────────────────────────────

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  instanceId: string;
  albumName: string;
  publisher: string;
  stickers: StickerWithState[];
  missing: number;
  repeated: number;
}

export function ShareModal({
  open, onClose,
  instanceId, albumName, publisher,
  stickers, missing, repeated,
}: ShareModalProps) {
  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const externalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/external-share/${instanceId}`
    : '';
  const waUrlText = `Mira mi álbum "${albumName}" 🏆 ${externalUrl}`;
  const faltantesText = buildFaltantesText(publisher, albumName, stickers);
  const repetidasText = buildRepetidasText(publisher, albumName, stickers);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
      onTouchMove={(e) => { if (e.target === e.currentTarget) e.preventDefault(); }}
    >
      <div
        className="w-full sm:max-w-[540px] rounded-t-[20px] sm:rounded-[20px]"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '88vh',
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--bg-border-hi)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '16px 16px 14px',
          borderBottom: '1px solid var(--bg-border)',
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-1)' }}>
              Compartir
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-3)' }}>
              {albumName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="pressable"
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--bg-raised)',
              border: '1px solid var(--bg-border)',
              color: 'var(--text-3)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido scrollable */}
        <div
          style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          <CopyCard
            icon="🔗"
            title="Enlace público"
            description="Cualquiera con el link puede ver tu progreso actualizado (solo lectura)"
            content={externalUrl}
            waContent={waUrlText}
            preview={externalUrl}
          />

          {missing > 0 && faltantesText && (
            <CopyCard
              icon="❌"
              title={`Faltantes · ${missing} figuras`}
              description="Texto listo para pedir figuras a tus contactos"
              content={faltantesText}
              preview={`Me faltan ${missing} figuras del álbum "${albumName}"…`}
            />
          )}

          {repeated > 0 && repetidasText && (
            <CopyCard
              icon="🔄"
              title={`Repetidas · ${repeated} figuras`}
              description="Texto para ofrecer tus repetidas e intercambiar"
              content={repetidasText}
              preview={`Tengo ${repeated} repetidas del álbum "${albumName}"…`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
