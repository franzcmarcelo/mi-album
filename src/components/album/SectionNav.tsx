'use client';

import { useUIStore } from '@/store/uiStore';

interface SectionNavProps {
  sections: string[];
}

export function SectionNav({ sections }: SectionNavProps) {
  const { activeSection, setActiveSection } = useUIStore();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        onClick={() => setActiveSection(null)}
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          activeSection === null
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Todas
      </button>
      {sections.map((section) => (
        <button
          key={section}
          onClick={() => setActiveSection(section === activeSection ? null : section)}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            activeSection === section
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {section}
        </button>
      ))}
    </div>
  );
}
