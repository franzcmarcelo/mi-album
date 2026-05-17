import Link from 'next/link';
import { NavMenu } from './NavMenu';
import { BottomNav } from './BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Aurora background — fixed, respects prefers-reduced-motion via CSS */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div className="aurora-blob-1" style={{
          position: 'absolute', top: '-15%', right: '-10%',
          width: '55vw', height: '55vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(29,78,216,0.09) 0%, transparent 65%)',
        }} />
        <div className="aurora-blob-2" style={{
          position: 'absolute', bottom: '-12%', left: '-15%',
          width: '60vw', height: '60vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217,119,6,0.07) 0%, transparent 65%)',
        }} />
        <div className="aurora-blob-3" style={{
          position: 'absolute', top: '38%', left: '18%',
          width: '45vw', height: '45vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220,38,38,0.04) 0%, transparent 65%)',
        }} />
      </div>

      {/* Top navbar */}
      <nav
        className="sticky top-0 z-40"
        style={{
          background: 'rgba(7,9,15,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          {/* Brand */}
          <Link href="/" className="pressable flex items-center gap-2.5" style={{ textDecoration: 'none' }}>
            <div
              style={{
                width: '34px', height: '34px',
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
                boxShadow: '0 2px 14px var(--accent-glow)',
                flexShrink: 0,
              }}
            >
              ⚽
            </div>
            <div style={{ lineHeight: 1 }}>
              <span style={{
                display: 'block', color: 'var(--text-1)',
                fontWeight: 800, fontSize: '15px', letterSpacing: '-0.01em',
              }}>
                Mi Álbum
              </span>
              <span style={{
                display: 'block', fontSize: '9px', fontWeight: 700,
                letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '2px',
                color: '#818cf8',
              }}>
                Mundial 2026
              </span>
            </div>
          </Link>

          <NavMenu />
        </div>
      </nav>

      <main
        className="mx-auto max-w-2xl px-4 py-4 pb-28 sm:pb-6"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
