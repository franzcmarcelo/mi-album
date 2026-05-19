import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { LoginButton } from './LoginButton';

export const metadata: Metadata = {
  title: 'Empieza gratis — Mi Álbum del Mundial 2026',
  description:
    'Gestiona tu colección de figuras Panini y 3 Reyes del Mundial 2026. Controla lo que tienes, lo que te falta y tus repetidas. Comparte tu progreso con amigos. ¡Gratis!',
  alternates: { canonical: 'https://mi-album-phi.vercel.app/login' },
};

function TrophySilhouette() {
  return (
    <svg width="90" height="112" viewBox="0 0 90 112" fill="currentColor" aria-hidden="true">
      <path d="M20 8 C16 8 12 12 12 30 C12 52 30 65 45 70 C60 65 78 52 78 30 C78 12 74 8 70 8 Z" />
      <path d="M20 13 Q5 23 8 40 Q10 52 20 57"
        stroke="currentColor" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M70 13 Q85 23 82 40 Q80 52 70 57"
        stroke="currentColor" strokeWidth="9" fill="none" strokeLinecap="round" />
      <rect x="39" y="70" width="12" height="22" rx="2" />
      <rect x="27" y="92" width="36" height="7" rx="3" />
      <rect x="19" y="99" width="52" height="11" rx="5" />
    </svg>
  );
}

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect('/');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(150deg, #06102e 0%, #0f2870 50%, #1a1050 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Gold top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, transparent 0%, #6366f1 20%, #a5b4fc 50%, #6366f1 80%, transparent 100%)',
      }} />

      {/* WC hex pattern */}
      <div className="wc-hex" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      {/* Blue glow top-right */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-80px',
        width: '420px', height: '420px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(29,78,216,0.3) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Gold glow bottom-left */}
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-60px',
        width: '380px', height: '380px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(217,119,6,0.2) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo 1 — ghosted watermark */}
      <div style={{
        position: 'absolute', right: '-5%', bottom: '-4%',
        width: '54vw', maxWidth: '340px',
        pointerEvents: 'none',
        filter: 'grayscale(1) invert(1) opacity(0.07) brightness(2)',
        transformOrigin: 'bottom right',
      }}>
        <Image src="/images/world-cup-logo.png" alt="" width={340} height={340} style={{ width: '100%', height: 'auto' }} />
      </div>

      {/* "2026" large background text */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '280px', fontWeight: 900, lineHeight: 1,
        color: 'rgba(255,255,255,0.025)',
        letterSpacing: '-0.06em',
        pointerEvents: 'none',
        userSelect: 'none',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      }}>
        2026
      </div>

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Mi Álbum',
            url: 'https://mi-album-phi.vercel.app',
            description:
              'Gestiona tu colección de figuras Panini y 3 Reyes del Mundial 2026. Controla lo que tienes, lo que te falta y tus repetidas.',
            applicationCategory: 'SportsApplication',
            operatingSystem: 'Web',
            inLanguage: 'es',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />

      {/* Card */}
      <div
        className="modal-content"
        style={{
          width: '100%', maxWidth: '380px',
          background: 'rgba(7,13,35,0.85)',
          border: '1px solid rgba(29,78,216,0.3)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
          position: 'relative', zIndex: 10,
        }}
      >
        {/* Card gold top bar */}
        <div style={{
          height: '2px',
          background: 'var(--accent-grad-h)',
        }} />

        <div style={{ padding: '40px 32px 36px', backdropFilter: 'blur(20px)' }}>
          {/* Logo + title */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{
              width: '84px', height: '84px',
              margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              filter: 'drop-shadow(0 8px 24px rgba(29,78,216,0.55))',
            }}>
              <Image
                src="/images/world-cup-logo-2.png"
                alt="FIFA World Cup 26"
                width={84}
                height={84}
                style={{ objectFit: 'contain' }}
              />
            </div>

            <h1 style={{
              color: 'white', fontWeight: 900, fontSize: '28px',
              margin: '0 0 4px', letterSpacing: '-0.02em',
            }}>
              Mi Álbum
            </h1>

            <p style={{
              fontSize: '10px', fontWeight: 800, letterSpacing: '0.24em',
              textTransform: 'uppercase', margin: '0 0 14px',
              background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              FIFA World Cup 2026
            </p>

            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
              Gestiona tu colección de figuras
            </p>
          </div>

          <LoginButton />

          {/* Host countries */}
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: '6px', marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}>
            <span style={{ fontSize: '14px' }}>🇺🇸</span>
            <span style={{ fontSize: '14px' }}>🇨🇦</span>
            <span style={{ fontSize: '14px' }}>🇲🇽</span>
            <span style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em',
              color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginLeft: '4px',
            }}>
              USA · CAN · MEX
            </span>
          </div>
        </div>
      </div>
      {/* Features section — below card, indexable by search engines */}
      <div style={{
        width: '100%', maxWidth: '380px',
        marginTop: '28px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
        position: 'relative', zIndex: 10,
      }}>
        {[
          { icon: '⚽', title: 'Panini & 3 Reyes', desc: 'Ambas editoriales del Mundial 2026' },
          { icon: '📊', title: 'Control exacto', desc: 'Figuras que tienes, repetidas y faltantes en tiempo real' },
          { icon: '🔗', title: 'Comparte fácil', desc: 'Link público o mensaje para WhatsApp listo' },
          { icon: '✅', title: 'Gratis y online', desc: 'Sincronizado en todos tus dispositivos' },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{
            background: 'rgba(7,13,35,0.6)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '14px',
            backdropFilter: 'blur(10px)',
          }}>
            <span style={{ fontSize: '20px', display: 'block', marginBottom: '6px' }}>{icon}</span>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3 }}>{title}</p>
            <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{desc}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
