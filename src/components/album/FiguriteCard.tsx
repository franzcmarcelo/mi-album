'use client';

import { StickerWithState } from '@/types';

interface FiguriteCardProps {
  sticker: StickerWithState;
  onClick: () => void;
}

const stateStyles = {
  owned: 'bg-green-500 border-green-400',
  repeated: 'bg-yellow-400 border-yellow-300',
  missing: 'bg-gray-100 border-gray-200',
};

const stateLabel = {
  owned: 'T',
  repeated: 'R',
  missing: '',
};

export function FiguriteCard({ sticker, onClick }: FiguriteCardProps) {
  const state = sticker.userState ?? 'missing';
  const isFlipped = state !== 'missing';

  return (
    <div
      className="cursor-pointer"
      style={{ perspective: '600px', width: '100%', aspectRatio: '3/4' }}
      onClick={onClick}
      title={`#${sticker.number} ${sticker.name}`}
    >
      <div
        className="relative w-full h-full transition-transform duration-300"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-md border-2 border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-xs font-bold">{sticker.number}</span>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 rounded-md border-2 flex flex-col items-center justify-center backface-hidden ${stateStyles[state]}`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className="text-xs font-bold text-white">{sticker.number}</span>
          <span className="text-[10px] font-bold text-white/80">{stateLabel[state]}</span>
        </div>
      </div>
    </div>
  );
}
