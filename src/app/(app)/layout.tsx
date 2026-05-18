import Link from 'next/link';
import { NavMenu } from './NavMenu';
import { HeaderActions } from './HeaderActions';

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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/favicon.png"
              alt="Mi Álbum"
              style={{
                width: '36px',
                height: '36px',
                objectFit: 'contain',
                borderRadius: '10px',
                flexShrink: 0,
              }}
            />
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

          <div className="flex items-center gap-3">
            <HeaderActions />
            <NavMenu />
          </div>
        </div>
      </nav>

      <main
        className="mx-auto max-w-2xl px-4 py-4"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {children}
      </main>

      {/*
        Bottom logo wave — logo 1 inverted so its white bg becomes black
        (invisible on dark), leaving the trophy as a faint light ghost that
        anchors the page visually like a watermark rising from the bottom.
      */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        padding: '16px 0 0',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/world-cup-logo.png"
          alt=""
          aria-hidden="true"
          style={{
            width: 'min(480px, 80vw)',
            height: 'auto',
            filter: 'grayscale(1) invert(1) brightness(3) opacity(0.07)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 35%, black 75%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 35%, black 75%, transparent 100%)',
          }}
        />
      </div>

      {/* Spacer so wave doesn't stick to content */}
      <div style={{ height: '32px' }} />
    </div>
  );
}
