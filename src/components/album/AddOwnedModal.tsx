'use client';

import { useState } from 'react';
import { StickerWithState } from '@/types';
import { CardSize } from '@/store/uiStore';
import { getSectionColor } from '@/lib/sectionColors';

interface AddOwnedModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (stickerIds: string[]) => void;
  missingStickers: StickerWithState[];
}

function groupBySection(stickers: StickerWithState[]) {
  const order: string[] = [];
  const map: Record<string, StickerWithState[]> = {};
  for (const s of stickers) {
    if (!map[s.section]) { map[s.section] = []; order.push(s.section); }
    map[s.section].push(s);
  }
  return order.map((sec) => [sec, map[sec]] as [string, StickerWithState[]]);
}

const SIZES: { value: CardSize; label: string }[] = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
];

export function AddOwnedModal({ open, onClose, onAdd, missingStickers }: AddOwnedModalProps) {
  const [cardSize, setCardSize] = useState<CardSize>('md');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  }

  function handleConfirm() {
    if (selected.size === 0) return;
    onAdd(Array.from(selected));
    setSelected(new Set());
    onClose();
  }

  function handleClose() {
    setSelected(new Set());
    onClose();
  }

  if (!open) return null;

  const sections = groupBySection(missingStickers);

  return (
    <ModalSheet
      title="Agregar figuritas"
      subtitle={selected.size > 0 ? `${selected.size} seleccionada${selected.size > 1 ? 's' : ''}` : 'Toca las que tienes'}
      onClose={handleClose}
      confirmLabel={selected.size > 0 ? `Agregar ${selected.size}` : 'Agregar'}
      confirmDisabled={selected.size === 0}
      onConfirm={handleConfirm}
    >
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        {SIZES.map((size) => {
          const active = cardSize === size.value;
          return (
            <button
              key={size.value}
              type="button"
              onClick={() => setCardSize(size.value)}
              style={{
                borderRadius: '10px', minWidth: '36px', minHeight: '34px',
                background: active ? 'var(--bg-raised)' : 'transparent',
                border: active ? '1px solid var(--bg-border-hi)' : '1px solid transparent',
                color: active ? 'var(--text-1)' : 'var(--text-3)',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              }}
            >
              {size.label}
            </button>
          );
        })}
      </div>
      {sections.map(([section, stickers]) => {
        const colors = getSectionColor(section);
        return (
          <SectionGroup key={section} section={section} count={stickers.length} colors={colors} gridSize={cardSize}>
            {stickers.map((s) => {
              const sel = selected.has(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggle(s.id)}
                  title={`#${s.number} — ${s.name}`}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '8px',
                    border: sel
                      ? `1.5px solid rgba(34,197,94,0.55)`
                      : '1.5px solid rgba(255,255,255,0.08)',
                    background: sel
                      ? 'rgba(16,185,129,0.12)'
                      : 'rgba(255,255,255,0.03)',
                    color: sel ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.25)',
                    fontSize: '13px', fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'border-color 150ms, background 150ms, color 150ms',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {s.number}
                </button>
              );
            })}
          </SectionGroup>
        );
      })}
    </ModalSheet>
  );
}

/* ── Shared sub-components ─────────────────────────────────────── */

export function ModalSheet({ title, subtitle, onClose, confirmLabel, confirmDisabled, onConfirm, children }: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  confirmLabel: string;
  confirmDisabled: boolean;
  onConfirm: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-[580px] rounded-t-[20px] sm:rounded-[20px]"
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
              {title}
            </p>
            {subtitle && (
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-3)' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--bg-raised)', border: '1px solid var(--bg-border)',
              color: 'var(--text-2)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
          {children}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', gap: '8px',
          padding: '12px 14px',
          borderTop: '1px solid var(--bg-border)',
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '12px', borderRadius: '11px',
              border: '1px solid var(--bg-border-hi)',
              background: 'var(--bg-raised)',
              color: 'var(--text-2)', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            style={{
              flex: 1, padding: '12px', borderRadius: '11px',
              border: 'none',
              background: confirmDisabled ? 'var(--bg-raised)' : 'var(--accent-grad)',
              color: confirmDisabled ? 'var(--text-3)' : 'white',
              fontSize: '14px', fontWeight: 700,
              cursor: confirmDisabled ? 'not-allowed' : 'pointer',
              transition: 'background 200ms',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SectionGroup({ section, count, colors, children, gridSize = 'md' }: {
  section: string;
  count: number;
  colors: { bg: string };
  children: React.ReactNode;
  gridSize?: CardSize;
}) {
  const minWidthMap: Record<CardSize, string> = {
    sm: '40px',
    md: '52px',
    lg: '64px',
  };
  return (
    <div style={{ marginBottom: '18px' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: colors.bg, flexShrink: 0 }} />
        <span style={{
          fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--text-3)',
        }}>
          {section}
        </span>
        <span style={{ fontSize: '9px', color: 'var(--text-3)', opacity: 0.45 }}>{count}</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--bg-border)' }} />
      </div>
      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidthMap[gridSize]}, 1fr))`,
        gap: '6px',
      }}>
        {children}
      </div>
    </div>
  );
}
