import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LoginButton } from './LoginButton';

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect('/');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Indigo glow top-right */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-80px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Cyan glow bottom-left */}
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-60px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
        backgroundSize: '28px 28px',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div
        className="modal-content"
        style={{
          width: '100%', maxWidth: '380px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--bg-border-hi)',
          borderRadius: '24px',
          padding: '44px 32px 36px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          position: 'relative', zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '76px', height: '76px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            borderRadius: '22px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '38px',
            margin: '0 auto 18px',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          }}>
            ⚽
          </div>
          <h1 style={{ color: 'var(--text-1)', fontWeight: 800, fontSize: '26px', margin: 0, letterSpacing: '-0.02em' }}>
            Mi Álbum
          </h1>
          <p style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
            margin: '8px 0 12px',
            background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Copa del Mundo 2026
          </p>
          <p style={{ color: 'var(--text-3)', fontSize: '14px', margin: 0 }}>
            Gestioná tu colección de figuritas
          </p>
        </div>

        <LoginButton />

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-3)', marginTop: '22px', lineHeight: 1.6 }}>
          También puedes usar la app sin cuenta.
          <br />
          Tu progreso se guarda localmente.
        </p>
      </div>
    </div>
  );
}
