'use client';

import React, { useRef, useCallback } from 'react';
import { StickerWithState } from '@/types';
import { getSectionColor, abbreviateSection } from '@/lib/sectionColors';
import { CardSize } from '@/store/uiStore';

interface FiguriteCardProps {
  sticker: StickerWithState;
  onClick: () => void;
  size?: CardSize;
}

export const FiguriteCard = React.memo(function FiguriteCard({
  sticker,
  onClick,
  size = 'md',
}: FiguriteCardProps) {
  const state = sticker.userState ?? 'missing';
  const isFlipped = state !== 'missing';
  const tiltRef = useRef<HTMLDivElement>(null);
  const colors = getSectionColor(sticker.section);
  const abbrev = abbreviateSection(sticker.section);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!tiltRef.current || isFlipped) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      tiltRef.current.style.transform = `rotateX(${(y - 0.5) * -14}deg) rotateY(${(x - 0.5) * 14}deg)`;
    },
    [isFlipped],
  );

  const handleMouseLeave = useCallback(() => {
    if (!tiltRef.current) return;
    tiltRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
  }, []);

  const numSize = size === 'lg' ? '30px' : size === 'md' ? '20px' : '13px';
  const showStrip = size !== 'sm';
  const showName = size === 'lg';
  const stripH = size === 'lg' ? '22px' : '14px';
  const stripFS = size === 'lg' ? '7px' : '5.5px';

  const frontStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    borderRadius: '6px',
    overflow: 'hidden',
    border: `2px solid ${colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    background: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
  };

  const backStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: 'rotateY(180deg)',
    borderRadius: '6px',
    overflow: 'hidden',
    border: `2px solid ${state === 'owned' ? '#86efac' : '#fcd34d'}`,
    display: 'flex',
    flexDirection: 'column',
    background: state === 'owned' ? '#f0fdf4' : '#fffbeb',
    boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
  };

  return (
    <div
      className="cursor-pointer select-none"
      style={{ perspective: '900px', aspectRatio: '3/4', width: '100%' }}
      onClick={onClick}
      title={`#${sticker.number} — ${sticker.name}`}
    >
      {/* Tilt wrapper — direct DOM mutation, no re-renders */}
      <div
        ref={tiltRef}
        style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.15s ease-out' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Flip card */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* ── FRONT ── */}
          <div style={frontStyle}>
            {/* Section color strip */}
            {showStrip && (
              <div
                style={{
                  background: `linear-gradient(135deg, ${colors.bg}, ${colors.bg}dd)`,
                  minHeight: stripH,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px 4px',
                }}
              >
                <span
                  style={{
                    color: 'white',
                    fontSize: stripFS,
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                    opacity: 0.95,
                  }}
                >
                  {abbrev}
                </span>
              </div>
            )}

            {/* Image or number */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: colors.light,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {sticker.imageUrl ? (
                <img
                  src={sticker.imageUrl}
                  alt={sticker.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span
                  style={{
                    fontSize: numSize,
                    fontWeight: 900,
                    color: colors.bg,
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {sticker.number}
                </span>
              )}
            </div>

            {/* Name strip */}
            {showName && (
              <div
                style={{
                  background: 'white',
                  borderTop: `1px solid ${colors.border}`,
                  padding: '3px 5px',
                  minHeight: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '7.5px',
                    fontWeight: 600,
                    color: '#374151',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                  }}
                >
                  {sticker.name}
                </span>
              </div>
            )}
          </div>

          {/* ── BACK ── */}
          <div style={backStyle}>
            {/* Section strip on back */}
            <div
              style={{
                background: `linear-gradient(135deg, ${colors.bg}, ${colors.bg}dd)`,
                minHeight: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px 4px',
              }}
            >
              <span style={{ color: 'white', fontSize: '5px', fontWeight: 800, letterSpacing: '0.04em' }}>
                {abbrev}
              </span>
            </div>

            {/* State indicator */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                padding: '4px 2px',
              }}
            >
              <span
                style={{
                  fontSize: size === 'sm' ? '18px' : '22px',
                  lineHeight: 1,
                  color: state === 'owned' ? '#16a34a' : '#d97706',
                }}
              >
                {state === 'owned' ? '✓' : `×${sticker.quantity ?? 1}`}
              </span>

              {size !== 'sm' && (
                <span
                  style={{
                    fontSize: '6px',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    color: state === 'owned' ? '#15803d' : '#92400e',
                  }}
                >
                  {state === 'owned' ? 'TENGO' : 'REPETIDA'}
                </span>
              )}

              <span style={{ fontSize: '6px', color: '#9ca3af', fontWeight: 600, marginTop: '1px' }}>
                #{sticker.number}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
