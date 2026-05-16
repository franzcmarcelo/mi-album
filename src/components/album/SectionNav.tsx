'use client';

import { useUIStore } from '@/store/uiStore';
import { StickerWithState } from '@/types';
import { getSectionColor } from '@/lib/sectionColors';
import { getSectionStats } from '@/lib/catalogHelpers';

interface SectionNavProps {
  sections: string[];
  stickers: StickerWithState[];
}

export function SectionNav({ sections, stickers }: SectionNavProps) {
  const { activeSection, setActiveSection } = useUIStore();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {/* "Todas" button */}
      <button
        onClick={() => setActiveSection(null)}
        className="pressable shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
        style={{
          background: activeSection === null ? 'linear-gradient(135deg, #6366f1, #06b6d4)' : 'var(--bg-surface)',
          color: activeSection === null ? 'white' : 'var(--text-2)',
          border: `1px solid ${activeSection === null ? 'transparent' : 'var(--bg-border)'}`,
          cursor: 'pointer',
          boxShadow: activeSection === null ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
        }}
      >
        Todas
      </button>

      {sections.map((section) => {
        const stats = getSectionStats(stickers, section);
        const colors = getSectionColor(section);
        const isActive = activeSection === section;

        return (
          <button
            key={section}
            onClick={() => setActiveSection(section === activeSection ? null : section)}
            className="pressable shrink-0 rounded-xl"
            style={{
              padding: '6px 10px',
              background: isActive ? colors.bg : 'var(--bg-surface)',
              border: `1px solid ${isActive ? 'transparent' : 'var(--bg-border)'}`,
              cursor: 'pointer',
              textAlign: 'left',
              minWidth: '76px',
              boxShadow: isActive ? `0 4px 14px ${colors.bg}55` : 'none',
              transition: 'box-shadow 200ms var(--ease-out)',
            }}
          >
            <span style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              color: isActive ? 'white' : 'var(--text-2)',
              whiteSpace: 'nowrap',
            }}>
              {section}
            </span>

            {/* Progress bar */}
            <div style={{
              width: '100%', height: '3px',
              background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-raised)',
              borderRadius: '2px', marginTop: '4px', overflow: 'hidden',
            }}>
              <div style={{
                width: `${stats.progress}%`, height: '100%',
                background: isActive ? 'rgba(255,255,255,0.8)' : colors.bg,
                borderRadius: '2px',
                transition: 'width 0.4s var(--ease-out)',
              }} />
            </div>

            <span style={{
              display: 'block', fontSize: '9px', marginTop: '3px',
              color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-3)',
              fontWeight: 600,
            }}>
              {stats.owned}/{stats.total}
            </span>
          </button>
        );
      })}
    </div>
  );
}
