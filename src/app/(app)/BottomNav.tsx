'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function RepeatIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  );
}

interface TabProps {
  href: string;
  label: string;
  active: boolean;
  children: React.ReactNode;
}

function Tab({ href, label, active, children }: TabProps) {
  return (
    <Link
      href={href}
      className="pressable"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '3px',
        padding: '10px 8px 12px',
        textDecoration: 'none',
        position: 'relative',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Active indicator — gradient line at top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '30%',
        right: '30%',
        height: '2px',
        borderRadius: '0 0 3px 3px',
        background: 'var(--accent-grad-h)',
        opacity: active ? 1 : 0,
        transform: active ? 'scaleX(1)' : 'scaleX(0)',
        transition: 'opacity 200ms var(--ease-out), transform 200ms var(--ease-out)',
        transformOrigin: 'center',
      }} />

      {/* Icon */}
      <div style={{
        color: active ? '#818cf8' : 'rgba(241,245,249,0.28)',
        transition: 'color 200ms var(--ease-out)',
      }}>
        {children}
      </div>

      {/* Label */}
      <span style={{
        fontSize: '10px',
        fontWeight: active ? 700 : 500,
        letterSpacing: '0.03em',
        transition: 'color 200ms var(--ease-out)',
        ...(active
          ? {
              background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }
          : { color: 'rgba(241,245,249,0.28)' }),
      }}>
        {label}
      </span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  const homeActive = pathname === '/';
  const repetidasActive = pathname.startsWith('/repetidas');

  return (
    <nav
      className="sm:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(7,9,15,0.94)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div style={{ display: 'flex', maxWidth: '640px', margin: '0 auto' }}>
        <Tab href="/" label="Colección" active={homeActive}>
          <HomeIcon active={homeActive} />
        </Tab>
        <Tab href="/repetidas" label="Repetidas" active={repetidasActive}>
          <RepeatIcon active={repetidasActive} />
        </Tab>
      </div>
    </nav>
  );
}
