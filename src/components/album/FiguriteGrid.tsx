'use client';

import { StickerWithState, StickerState } from '@/types';
import { useUIStore } from '@/store/uiStore';
import { FiguriteCard } from './FiguriteCard';

interface FiguriteGridProps {
  stickers: StickerWithState[];
  onUpdate: (stickerId: string, state: StickerState | null, quantity?: number) => void;
  isLoading?: boolean;
}

const SIZE_CONFIG = {
  sm: { minWidth: '52px', gap: '5px' },
  md: { minWidth: '76px', gap: '7px' },
  lg: { minWidth: '112px', gap: '10px' },
};

export function FiguriteGrid({ stickers, onUpdate, isLoading }: FiguriteGridProps) {
  const { cardSize } = useUIStore();
  const { minWidth, gap } = SIZE_CONFIG[cardSize];

  const gridStyle = {
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
        No hay figuritas para mostrar
      </div>
    );
  }

  return (
    <div style={gridStyle}>
      {stickers.map((sticker) => (
        <FiguriteCard
          key={sticker.id}
          sticker={sticker}
          size={cardSize}
          onMarkOwned={() => onUpdate(sticker.id, 'owned')}
          onMarkRepeated={(qty) => onUpdate(sticker.id, 'repeated', qty)}
          onRemove={() => onUpdate(sticker.id, null)}
        />
      ))}
    </div>
  );
}
