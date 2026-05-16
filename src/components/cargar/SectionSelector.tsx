'use client';

import { StickerWithState } from '@/types';
import { getSections } from '@/lib/catalogHelpers';
import { Button } from '@/components/ui/Button';

interface SectionSelectorProps {
  stickers: StickerWithState[];
  onMarkSection: (sectionStickers: StickerWithState[]) => void;
}

export function SectionSelector({ stickers, onMarkSection }: SectionSelectorProps) {
  const sections = getSections(stickers);

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500">Marca una seccion completa como &ldquo;tengo&rdquo;</p>
      <div className="grid grid-cols-2 gap-2">
        {sections.map((section) => {
          const sectionStickers = stickers.filter((s) => s.section === section);
          const ownedCount = sectionStickers.filter((s) => s.userState === 'owned' || s.userState === 'repeated').length;
          return (
            <Button
              key={section}
              variant="secondary"
              size="sm"
              onClick={() => onMarkSection(sectionStickers)}
              className="justify-between"
            >
              <span className="truncate">{section}</span>
              <span className="text-xs text-gray-400 ml-2">{ownedCount}/{sectionStickers.length}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
