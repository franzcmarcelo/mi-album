'use client';

import Link from 'next/link';
import { useSession } from '@/hooks/useSession';
import { useUIStore } from '@/store/uiStore';

export function HeaderActions() {
  const { user, loading } = useSession();
  const albumPageActive = useUIStore((s) => s.albumPageActive);
  const setAlbumShareOpen = useUIStore((s) => s.setAlbumShareOpen);

  // Botón de compartir — visible solo cuando el usuario está en una página de álbum
  if (albumPageActive) {
    return (
      <button
        onClick={() => setAlbumShareOpen(true)}
        className="pressable"
        aria-label="Compartir álbum"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '7px 12px',
          borderRadius: '10px',
          background: 'rgba(99,102,241,0.15)',
          border: '1px solid rgba(99,102,241,0.35)',
          color: '#818cf8',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 700,
          transition: 'all 150ms',
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Compartir
      </button>
    );
  }

  // Botón de login — visible solo cuando el usuario no está autenticado
  if (loading || user) return null;

  return (
    <Link
      href="/login"
      className="pressable"
      style={{
        padding: '9px 12px',
        borderRadius: '10px',
        border: 'none',
        background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
        color: 'white',
        fontSize: '13px',
        fontWeight: 700,
        textDecoration: 'none',
        transition: 'opacity 200ms ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span style={{ width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '4px' }}>
        <svg viewBox="0 0 24 24" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
          <path fill="#4285F4" d="M23.64 12.2c0-.77-.07-1.52-.2-2.24H12v4.24h6.32c-.27 1.44-1.08 2.66-2.3 3.48v2.9h3.72c2.18-2.01 3.42-4.96 3.42-8.38z"/>
          <path fill="#34A853" d="M12 24c2.97 0 5.46-1.02 7.28-2.78l-3.72-2.9c-1.04.7-2.36 1.12-3.56 1.12-2.74 0-5.07-1.85-5.9-4.35H2.3v2.73C4.12 21.9 7.7 24 12 24z"/>
          <path fill="#FBBC05" d="M6.1 14.29c-.22-.66-.35-1.36-.35-2.09 0-.73.13-1.43.35-2.09V7.38H2.3A11.99 11.99 0 000 12.2c0 1.9.43 3.7 1.21 5.32l4.89-3.23z"/>
          <path fill="#EA4335" d="M12 4.76c1.61 0 3.06.55 4.2 1.63l3.15-3.15C17.44 1.33 14.97 0 12 0 7.7 0 4.12 2.1 2.3 5.38l4.89 3.23c.83-2.5 3.16-4.35 5.9-4.35z"/>
        </svg>
      </span>
      Ingresar
    </Link>
  );
}
