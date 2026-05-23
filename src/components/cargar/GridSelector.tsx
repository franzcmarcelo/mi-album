'use client';

import { StickerWithState } from '@/types';

interface GridSelectorProps {
  stickers: StickerWithState[];
  onToggle: (stickerId: string, currentState: StickerWithState['userState']) => void;
}

export function GridSelector({ stickers, onToggle }: GridSelectorProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-1">
      {stickers.map((s) => (
        <button
          key={s.id}
          onClick={() => onToggle(s.id, s.userState)}
          title={`#${s.code} ${s.name}`}
          className={`aspect-square rounded text-xs font-bold transition-colors ${
            s.userState === 'owned'
              ? 'bg-green-500 text-white'
              : s.userState === 'repeated'
              ? 'bg-yellow-400 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {s.code}
        </button>
      ))}
    </div>
  );
}
