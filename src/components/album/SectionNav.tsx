'use client';

import { useRef } from 'react';
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
  const navRef = useRef<HTMLDivElement>(null);

  function scrollLeft() {
    navRef.current?.scrollBy({ left: -220, behavior: 'smooth' });
  }
  function scrollRight() {
    navRef.current?.scrollBy({ left: 220, behavior: 'smooth' });
  }

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--bg-border)',
        borderRadius: '14px',
        padding: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {/* Left arrow */}
      <button
        type="button"
        onClick={scrollLeft}
        className="pressable"
        style={{
          width: '28px', height: '28px', borderRadius: '9px', flexShrink: 0,
          background: 'transparent', color: 'var(--text-3)',
          border: 'none', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Scrollable section pills */}
      <div
        ref={navRef}
        className="flex gap-1.5 overflow-x-auto scrollbar-none"
        style={{ flex: 1, minWidth: 0, scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
      >
        {sections.map((section) => {
          const stats = getSectionStats(stickers, section);
          const colors = getSectionColor(section);
          const isActive = activeSection === section;

          return (
            <button
              key={section}
              onClick={() => setActiveSection(isActive ? null : section)}
              className="pressable shrink-0"
              style={{
                padding: '5px 9px',
                background: isActive ? colors.bg : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                minWidth: '68px',
                borderRadius: '9px',
              }}
            >
              {/* Label + checkbox */}
              <span style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '11px', fontWeight: 700,
                color: isActive ? 'white' : 'var(--text-2)',
                whiteSpace: 'nowrap',
              }}>
                {/* Checkbox indicator */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '12px', height: '12px', borderRadius: '3px', flexShrink: 0,
                  background: isActive ? 'rgba(255,255,255,0.9)' : 'transparent',
                  border: isActive ? 'none' : `1.5px solid ${isActive ? 'transparent' : 'rgba(255,255,255,0.2)'}`,
                  transition: 'all 150ms',
                }}>
                  {isActive && (
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="#0f172a" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1.5 5l2.5 2.5 5-5" />
                    </svg>
                  )}
                </span>
                {section}
              </span>

              {/* Progress bar */}
              <div style={{
                width: '100%', height: '3px',
                background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-raised)',
                borderRadius: '2px', marginTop: '5px', overflow: 'hidden',
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

      {/* Right arrow */}
      <button
        type="button"
        onClick={scrollRight}
        className="pressable"
        style={{
          width: '28px', height: '28px', borderRadius: '9px', flexShrink: 0,
          background: 'transparent', color: 'var(--text-3)',
          border: 'none', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
