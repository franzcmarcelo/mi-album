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

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect('/');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(150deg, #06102e 0%, #0f2870 50%, #1a1050 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      /* padding vertical fluido: 20px en móvil → 60px en desktop */
      padding: 'clamp(20px, 5vh, 60px) clamp(12px, 4vw, 24px)',
      position: 'relative',
      overflowX: 'hidden', /* solo oculta desbordamiento horizontal (el "2026") */
    }}>

      {/* Barra superior */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, transparent 0%, #6366f1 20%, #a5b4fc 50%, #6366f1 80%, transparent 100%)',
      }} />

      {/* Patrón hexagonal */}
      <div className="wc-hex" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      {/* Glow azul — esquina superior derecha */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-80px',
        width: 'clamp(240px, 55vw, 420px)', height: 'clamp(240px, 55vw, 420px)',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(29,78,216,0.3) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Glow dorado — esquina inferior izquierda */}
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-60px',
        width: 'clamp(200px, 50vw, 380px)', height: 'clamp(200px, 50vw, 380px)',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(217,119,6,0.2) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo watermark — esquina inferior derecha */}
      <div style={{
        position: 'absolute', right: '-5%', bottom: '-4%',
        width: 'clamp(140px, 40vw, 300px)',
        pointerEvents: 'none',
        filter: 'grayscale(1) invert(1) opacity(0.07) brightness(2)',
        transformOrigin: 'bottom right',
      }}>
        <Image src="/images/world-cup-logo.png" alt="" width={300} height={300} style={{ width: '100%', height: 'auto' }} />
      </div>

      {/* "2026" texto de fondo — tamaño fluido para no desbordar en móvil */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 'clamp(100px, 38vw, 280px)',
        fontWeight: 900, lineHeight: 1,
        color: 'rgba(255,255,255,0.025)',
        letterSpacing: '-0.06em',
        pointerEvents: 'none',
        userSelect: 'none',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      }}>
        2026
      </div>

      {/* JSON-LD */}
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

      {/* ── Contenido principal (card + features) ── */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(14px, 3vh, 24px)',
        position: 'relative',
        zIndex: 10,
        flexShrink: 0,
      }}>

        {/* Card de login */}
        <div
          className="modal-content"
          style={{
            width: '100%',
            background: 'rgba(7,13,35,0.85)',
            border: '1px solid rgba(29,78,216,0.3)',
            borderRadius: 'clamp(16px, 4vw, 24px)',
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          {/* Barra superior de la card */}
          <div style={{ height: '2px', background: 'var(--accent-grad-h)' }} />

          <div style={{
            padding: 'clamp(24px, 6vw, 40px) clamp(20px, 6vw, 32px) clamp(22px, 5vw, 36px)',
            backdropFilter: 'blur(20px)',
          }}>
            {/* Logo + título */}
            <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 5vh, 36px)' }}>
              <div style={{
                width: 'clamp(64px, 18vw, 84px)',
                height: 'clamp(64px, 18vw, 84px)',
                margin: '0 auto clamp(14px, 3vw, 20px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                filter: 'drop-shadow(0 8px 24px rgba(29,78,216,0.55))',
              }}>
                <Image
                  src="/images/world-cup-logo-2.png"
                  alt="FIFA World Cup 26"
                  width={84}
                  height={84}
                  style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                  priority
                />
              </div>

              <h1 style={{
                color: 'white',
                fontWeight: 900,
                fontSize: 'clamp(22px, 6vw, 28px)',
                margin: '0 0 4px',
                letterSpacing: '-0.02em',
              }}>
                Mi Álbum
              </h1>

              <p style={{
                fontSize: 'clamp(8px, 2.2vw, 10px)',
                fontWeight: 800,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                margin: '0 0 12px',
                background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                FIFA World Cup 2026
              </p>

              <p style={{
                color: 'rgba(255,255,255,0.38)',
                fontSize: 'clamp(13px, 3.5vw, 14px)',
                margin: 0,
                lineHeight: 1.5,
              }}>
                Gestiona tu colección de figuras
              </p>
            </div>

            <LoginButton />

            {/* Países sede */}
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              gap: '6px',
              marginTop: 'clamp(18px, 4vw, 24px)',
              paddingTop: 'clamp(16px, 4vw, 20px)',
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

        {/* Features — 2 columnas, siempre visibles y sin corte */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'clamp(8px, 2vw, 12px)',
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
              borderRadius: 'clamp(10px, 3vw, 14px)',
              padding: 'clamp(10px, 3vw, 14px)',
              backdropFilter: 'blur(10px)',
            }}>
              <span style={{ fontSize: 'clamp(16px, 4.5vw, 20px)', display: 'block', marginBottom: '5px' }}>{icon}</span>
              <p style={{ margin: 0, fontSize: 'clamp(11px, 2.8vw, 12px)', fontWeight: 700, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3 }}>
                {title}
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 'clamp(10px, 2.5vw, 11px)', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
