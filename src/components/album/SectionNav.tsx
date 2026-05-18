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
    const nav = navRef.current;
    if (!nav) return;
    nav.scrollBy({ left: -220, behavior: 'smooth' });
  }

  function scrollRight() {
    const nav = navRef.current;
    if (!nav) return;
    nav.scrollBy({ left: 220, behavior: 'smooth' });
  }

  const totalOwned  = stickers.filter((s) => s.userState === 'owned' || s.userState === 'repeated').length;
  const totalProgress = stickers.length > 0 ? Math.round((totalOwned / stickers.length) * 100) : 0;

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
      {/* Left scroll arrow */}
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

      {/* Scrollable row — "Todas" is the first item */}
      <div
        ref={navRef}
        className="flex gap-1.5 overflow-x-auto scrollbar-none"
        style={{ flex: 1, minWidth: 0, scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
      >
        {/* "Todas las secciones" pill */}
        <button
          onClick={() => setActiveSection(null)}
          className="pressable shrink-0 rounded-[9px]"
          style={{
            padding: '5px 10px',
            minWidth: '68px',
            background: activeSection === null ? 'var(--bg-raised)' : 'transparent',
            border: `1px solid ${activeSection === null ? 'var(--bg-border-hi)' : 'transparent'}`,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span style={{
            display: 'block', fontSize: '11px', fontWeight: 700,
            color: activeSection === null ? 'var(--text-1)' : 'var(--text-3)',
            whiteSpace: 'nowrap',
          }}>
            Todas
          </span>
          <div style={{
            width: '100%', height: '3px',
            background: activeSection === null ? 'var(--bg-border-hi)' : 'var(--bg-raised)',
            borderRadius: '2px', marginTop: '4px', overflow: 'hidden',
          }}>
            <div style={{
              width: `${totalProgress}%`, height: '100%',
              background: activeSection === null ? 'var(--accent-grad-h)' : 'var(--text-3)',
              borderRadius: '2px',
            }} />
          </div>
          <span style={{
            display: 'block', fontSize: '9px', marginTop: '3px', fontWeight: 600,
            color: activeSection === null ? 'var(--text-2)' : 'var(--text-3)',
          }}>
            {totalOwned}/{stickers.length}
          </span>
        </button>

        {/* Divider */}
        <div style={{ width: '1px', background: 'var(--bg-border)', alignSelf: 'stretch', flexShrink: 0, margin: '2px 0' }} />

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
              padding: '5px 10px',
              background: isActive ? colors.bg : 'transparent',
              border: `1px solid ${isActive ? 'transparent' : 'transparent'}`,
              cursor: 'pointer',
              textAlign: 'left',
              minWidth: '72px',
              borderRadius: '9px',
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

      {/* Right scroll arrow */}
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
