'use client';

import React from 'react';
import { StickerWithState, StickerState } from '@/types';
import { useUIStore } from '@/store/uiStore';
import { getSectionColor } from '@/lib/sectionColors';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FiguriteCard } from './FiguriteCard';

interface FiguriteGridProps {
  stickers: StickerWithState[];
  onUpdate: (stickerId: string, state: StickerState | null, quantity?: number) => void;
  isLoading?: boolean;
  currentFilter?: 'all' | 'owned' | 'missing' | 'repeated';
}

const SIZE_CONFIG = {
  sm: { minWidth: '52px', gap: '5px' },
  md: { minWidth: '76px', gap: '7px' },
  lg: { minWidth: '112px', gap: '10px' },
};

/** Preserve original section order from the sticker list */
function groupBySection(stickers: StickerWithState[]): [string, StickerWithState[]][] {
  const order: string[] = [];
  const map: Record<string, StickerWithState[]> = {};
  for (const s of stickers) {
    if (!map[s.section]) { map[s.section] = []; order.push(s.section); }
    map[s.section].push(s);
  }
  return order.map((sec) => [sec, map[sec]]);
}

export function FiguriteGrid({ stickers, onUpdate, isLoading, currentFilter = 'all' }: FiguriteGridProps) {
  const { cardSize } = useUIStore();
  const { minWidth, gap } = SIZE_CONFIG[cardSize];

  // currentFilter maps 1-to-1 with FiguriteCard viewMode now
  const viewMode = currentFilter;

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
    gap,
    padding: '4px',
  };

  if (isLoading) {
    return (
      <div style={gridStyle}>
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={i}
            style={{
              aspectRatio: '3/4',
              borderRadius: '6px',
              background: 'linear-gradient(90deg, #0e1117 25%, #141824 50%, #0e1117 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        ))}
        <style>{`
          @keyframes shimmer {
            0%   { background-position:  200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (stickers.length === 0) {
    return (
      <div
        className="flex h-40 items-center justify-center rounded-xl"
        style={{ color: 'var(--text-3)', background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}
      >
        No hay figuras para mostrar
      </div>
    );
  }

  const sections = groupBySection(stickers);

  return (
    <div style={gridStyle}>
      {sections.map(([section, sectionStickers]) => {
        const colors = getSectionColor(section);
        return (
          <React.Fragment key={section}>
            {/* Encabezado de sección unificado */}
            <div style={{ gridColumn: '1 / -1', padding: '6px 2px 4px' }}>
              <SectionHeader
                section={section}
                color={colors.bg}
                collected={sectionStickers.filter((s) => s.userState === 'owned' || s.userState === 'repeated').length}
                total={sectionStickers.length}
                showProgress={currentFilter === 'all'}
                showCount={true}
              />
            </div>

            {/* Cards for this section */}
            {sectionStickers.map((sticker) => (
              <FiguriteCard
                key={sticker.id}
                sticker={sticker}
                size={cardSize}
                viewMode={viewMode}
                onMarkOwned={() => onUpdate(sticker.id, 'owned')}
                onMarkRepeated={(qty) => onUpdate(sticker.id, 'repeated', qty)}
                onRemove={() => onUpdate(sticker.id, null)}
              />
            ))}
          </React.Fragment>
        );
      })}
    </div>
  );
}
