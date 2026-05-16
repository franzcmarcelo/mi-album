'use client';

import { StickerWithState } from '@/types';
import { FiguriteCard } from './FiguriteCard';

interface FiguriteGridProps {
  stickers: StickerWithState[];
  onToggle: (stickerId: string, currentState: StickerWithState['userState']) => void;
}

export function FiguriteGrid({ stickers, onToggle }: FiguriteGridProps) {
  if (stickers.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-gray-400">
        No hay figuritas para mostrar
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-1.5 p-2">
      {stickers.map((sticker) => (
        <FiguriteCard
          key={sticker.id}
          sticker={sticker}
          onClick={() => onToggle(sticker.id, sticker.userState)}
        />
      ))}
    </div>
  );
}
