'use client';

import { useEffect, useMemo, useState } from 'react';
import { StickerWithState } from '@/types';
import { CardSize } from '@/store/uiStore';
import { getSectionColor } from '@/lib/sectionColors';
import { ModalSheet, SectionGroup } from './AddOwnedModal';

interface AddRepeatedModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (selections: Array<{ stickerId: string; quantity: number }>) => void;
  repeatableStickers: StickerWithState[];
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

export function AddRepeatedModal({ open, onClose, onAdd, repeatableStickers }: AddRepeatedModalProps) {
  const [cardSize, setCardSize] = useState<CardSize>('md');
  // qty=0 means not selected; qty≥1 means selected with that quantity
  const defaultQuantities = useMemo(() => repeatableStickers.reduce<Record<string, number>>((acc, sticker) => {
    if (sticker.userState === 'repeated') {
      acc[sticker.id] = sticker.quantity ?? 1;
    }
    return acc;
  }, {}), [repeatableStickers]);

  const [quantities, setQuantities] = useState<Record<string, number>>(defaultQuantities);

  useEffect(() => {
    if (open) {
      setQuantities(defaultQuantities);
    }
  }, [open, defaultQuantities]);

  function setQty(id: string, qty: number) {
    const next = { ...quantities };
    if (qty <= 0) delete next[id];
    else next[id] = qty;
    setQuantities(next);
  }

  function handleConfirm() {
    const selections = Object.entries(quantities).map(([stickerId, quantity]) => ({ stickerId, quantity }));
    if (selections.length === 0) return;
    onAdd(selections);
    setQuantities({});
    onClose();
  }

  function handleClose() {
    setQuantities({});
    onClose();
  }

  if (!open) return null;

  const selected = Object.keys(quantities).length;
  const sections = groupBySection(repeatableStickers);

  return (
    <ModalSheet
      title="Marcar repetidas"
      subtitle={selected > 0 ? `${selected} figurita${selected > 1 ? 's' : ''} seleccionada${selected > 1 ? 's' : ''}` : 'Toca las que repites'}
      onClose={handleClose}
      confirmLabel={selected > 0 ? `Guardar ${selected}` : 'Guardar'}
      confirmDisabled={selected === 0}
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
              const qty = quantities[s.id] ?? (s.userState === 'repeated' ? (s.quantity ?? 1) : 0);
              const isSelected = qty > 0;
              return (
                <div
                  key={s.id}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '8px',
                    border: isSelected
                      ? '1.5px solid rgba(245,158,11,0.55)'
                      : '1.5px solid rgba(255,255,255,0.08)',
                    background: isSelected
                      ? 'rgba(245,158,11,0.1)'
                      : 'rgba(255,255,255,0.03)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: '4px', padding: '4px 2px',
                    transition: 'border-color 150ms, background 150ms',
                    position: 'relative',
                  }}
                >
                  {/* Number — tap to select/deselect */}
                  <button
                    onClick={() => setQty(s.id, isSelected ? 0 : 1)}
                    title={`#${s.number} — ${s.name}`}
                    style={{
                      flex: 1, width: '100%', border: 'none', background: 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 900,
                      color: isSelected ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.25)',
                      fontVariantNumeric: 'tabular-nums',
                      padding: 0,
                    }}
                  >
                    {s.number}
                  </button>

                  {/* Qty stepper — only when selected */}
                  {isSelected && (
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '3px', width: '100%', justifyContent: 'center' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setQty(s.id, qty - 1)}
                        style={{
                          width: 16, height: 16, borderRadius: '4px', border: 'none',
                          background: 'rgba(245,158,11,0.25)', color: '#fbbf24',
                          fontSize: '12px', fontWeight: 900,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          lineHeight: 1, padding: 0,
                        }}
                      >
                        −
                      </button>
                      <span style={{
                        fontSize: '11px', fontWeight: 800, color: '#fbbf24',
                        minWidth: '14px', textAlign: 'center', lineHeight: 1,
                      }}>
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(s.id, qty + 1)}
                        style={{
                          width: 16, height: 16, borderRadius: '4px', border: 'none',
                          background: 'rgba(245,158,11,0.25)', color: '#fbbf24',
                          fontSize: '12px', fontWeight: 900,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          lineHeight: 1, padding: 0,
                        }}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </SectionGroup>
        );
      })}
    </ModalSheet>
  );
}
