import Link from 'next/link';
import { NavMenu } from './NavMenu';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Top navbar */}
      <nav
        className="sticky top-0 z-40"
        style={{
          background: 'rgba(7,9,15,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--bg-border)',
        }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5" style={{ textDecoration: 'none' }}>
            <div
              style={{
                width: '34px', height: '34px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
                boxShadow: '0 2px 12px rgba(245,158,11,0.3)',
                flexShrink: 0,
              }}
            >
              ⚽
            </div>
            <div style={{ lineHeight: 1 }}>
              <span style={{ display: 'block', color: 'var(--text-1)', fontWeight: 800, fontSize: '15px', letterSpacing: '-0.01em' }}>
                Mi Álbum
              </span>
              <span style={{
                display: 'block', fontSize: '9px', fontWeight: 700,
                letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '2px',
                background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Mundial 2026
              </span>
            </div>
          </Link>

          <NavMenu />
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 py-4">{children}</main>
    </div>
  );
}
