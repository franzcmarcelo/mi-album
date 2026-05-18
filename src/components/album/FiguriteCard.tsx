'use client';

import React, { useRef, useEffect, useState } from 'react';
import { StickerWithState } from '@/types';
import { getSectionColor, abbreviateSection } from '@/lib/sectionColors';
import { CardSize } from '@/store/uiStore';

interface FiguriteCardProps {
  sticker: StickerWithState;
  viewMode: 'all' | 'owned' | 'missing' | 'repeated';
  size?: CardSize;
  onMarkOwned: () => void;
  onMarkRepeated: (qty: number) => void;
  onRemove: () => void;
}

export const FiguriteCard = React.memo(function FiguriteCard({
  sticker, viewMode, size = 'md',
  onMarkOwned, onMarkRepeated, onRemove,
}: FiguriteCardProps) {
  const state      = sticker.userState ?? 'missing';
  const qty        = sticker.quantity ?? 1;
  const isOwned    = state !== 'missing';
  const isRepeated = state === 'repeated';
  const colors     = getSectionColor(sticker.section);
  const abbrev     = abbreviateSection(sticker.section);

  // Satisfaction effect: card bounce + shine sweep when sticker goes missing → owned
  const prevIsOwned  = useRef(isOwned);
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const [showShine, setShowShine] = useState(false);

  useEffect(() => {
    if (!prevIsOwned.current && isOwned) {
      // Bounce the outer wrapper (no overflow:hidden there, so scale is unrestricted)
      if (wrapperRef.current) {
        wrapperRef.current.style.animation = 'card-owned-pop 420ms var(--ease-out)';
        const t = setTimeout(() => {
          if (wrapperRef.current) wrapperRef.current.style.animation = '';
        }, 420);
        // Shine overlay
        setShowShine(true);
        const t2 = setTimeout(() => setShowShine(false), 500);
        return () => { clearTimeout(t); clearTimeout(t2); };
      }
    }
    prevIsOwned.current = isOwned;
  }, [isOwned]);

  // click behaviour per view
  function handleClick() {
    switch (viewMode) {
      case 'all':
        isOwned ? onRemove() : onMarkOwned();
        break;
      case 'repeated':
        if (isRepeated) onMarkRepeated(qty + 1);
        break;
      // 'owned' and 'missing' → read-only
    }
  }

  const clickable = viewMode === 'all' || viewMode === 'repeated';

  // sizing
  const numSize    = size === 'lg' ? '26px' : size === 'md' ? '17px' : '13px';
  const nameFS     = size === 'lg' ? '7px'  : '6px';
  const showStrip  = size !== 'sm';
  const showName   = size !== 'sm';
  const stripH     = size === 'lg' ? '20px' : '13px';
  const stripFS    = size === 'lg' ? '7px'  : '5px';
  const controlH   = size === 'sm' ? 18 : size === 'md' ? 22 : 26;

  const showControls = viewMode === 'repeated' && isRepeated;
  // In "todas" view repeated stickers are treated as plain "owned" — hide qty badge
  const showQtyBadge = isRepeated && viewMode !== 'all';
  // Green check shown in "todas" for any owned sticker
  const showCheck    = viewMode === 'all' && isOwned;

  // Badge label differs by context:
  //   owned view   → "+N" (N extra copies beyond the 1 you own)
  //   repeated view → "×N" (N duplicates)
  const badgeLabel = viewMode === 'owned' ? `+${qty}` : `×${qty}`;

  return (
    <div ref={wrapperRef} style={{ aspectRatio: '3/4', width: '100%' }}>
      <div
        onClick={handleClick}
        title={`#${sticker.number} — ${sticker.name}`}
        style={{
          width: '100%', height: '100%',
          borderRadius: '8px',
          border: isOwned
            ? '1.5px solid rgba(34,197,94,0.4)'
            : '1.5px solid rgba(255,255,255,0.07)',
          background: isOwned
            ? 'rgba(16,185,129,0.09)'
            : 'rgba(255,255,255,0.03)',
          boxShadow: isOwned
            ? '0 2px 10px rgba(16,185,129,0.1)'
            : '0 1px 4px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          cursor: clickable ? 'pointer' : 'default',
          position: 'relative',
          transition: 'border-color 200ms, background 200ms, box-shadow 200ms',
        }}
      >
        {/* Diagonal shine sweep — plays once on collection */}
        {showShine && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 9,
            borderRadius: '8px', overflow: 'hidden',
            pointerEvents: 'none',
          }}>
            <div style={{
              position: 'absolute',
              top: '-30%', bottom: '-30%',
              width: '50%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55) 50%, transparent)',
              animation: 'card-shine-sweep 460ms var(--ease-out) forwards',
            }} />
          </div>
        )}

        {/* Section strip */}
        {showStrip && (
          <div style={{
            background: colors.bg,
            minHeight: stripH, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2px 4px',
            opacity: isOwned ? 1 : 0.4,
          }}>
            <span style={{
              color: 'white', fontSize: stripFS, fontWeight: 800,
              letterSpacing: '0.05em', textTransform: 'uppercase',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {abbrev}
            </span>
          </div>
        )}

        {/* Sticker number + name */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '3px 4px', gap: '2px',
        }}>
          <span style={{
            fontSize: numSize, fontWeight: 900, lineHeight: 1,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
            color: isOwned ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.18)',
            transition: 'color 200ms',
            flexShrink: 0,
          }}>
            {sticker.number}
          </span>
          {showName && (
            <span style={{
              fontSize: nameFS,
              fontWeight: 500,
              lineHeight: 1.25,
              textAlign: 'center',
              color: isOwned ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.1)',
              transition: 'color 200ms',
              maxWidth: '100%',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word',
            }}>
              {sticker.name}
            </span>
          )}
        </div>

        {/* Green check — todas view — stamps in on first render */}
        {showCheck && (
          <div style={{
            position: 'absolute', bottom: 4, right: 4,
            width: size === 'sm' ? 13 : 15,
            height: size === 'sm' ? 13 : 15,
            borderRadius: '50%',
            background: 'rgba(16,185,129,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'check-stamp 450ms var(--ease-out)',
            transformOrigin: 'center',
          }}>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}

        {/* Qty badge — hidden in todas view.
            Key changes on every qty update so React remounts the element
            and restarts the badge-pop animation. */}
        {showQtyBadge && (
          <div
            key={qty}
            style={{
              position: 'absolute',
              bottom: showControls ? controlH + 4 : 4,
              right: 4,
              background: 'rgba(245,158,11,0.88)',
              borderRadius: '4px', padding: '1px 4px',
              fontSize: size === 'sm' ? '7px' : '8px',
              fontWeight: 900, color: 'white', lineHeight: 1.4,
              animation: 'badge-pop 300ms var(--ease-out)',
              transformOrigin: 'center',
            }}
          >
            {badgeLabel}
          </div>
        )}

        {/* Controls — repeated view only */}
        {showControls && (
          <div
            style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/*
              ×1 means 2 total copies: 1 owned + 1 extra (repeated).
              Pressing − at ×1 removes the extra copy → back to "owned" (1 copy).
              Only goes to "missing" if you remove from the owned view, not here.
            */}
            <button
              onClick={() => qty > 1 ? onMarkRepeated(qty - 1) : onMarkOwned()}
              title="Quitar una repetida"
              style={{
                flex: 1, height: controlH, border: 'none',
                borderRight: '1px solid rgba(255,255,255,0.07)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1 }}>−</span>
            </button>
            <button
              onClick={() => onMarkRepeated(qty + 1)}
              title="Agregar una más"
              style={{
                flex: 1, height: controlH, border: 'none',
                background: 'transparent',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1 }}>+</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
