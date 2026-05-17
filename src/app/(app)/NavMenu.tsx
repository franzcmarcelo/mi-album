'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { useUserAlbums } from '@/hooks/useUserAlbums';
import { createClient } from '@/lib/supabase/client';

export function NavMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useSession();
  const { instances } = useUserAlbums(user);
  const router = useRouter();

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? null;
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;

  const paniniInstances = instances.filter((i) => i.slug.startsWith('panini'));
  const treyesInstances = instances.filter((i) => i.slug.startsWith('3reyes'));

  // Detectar clicks fuera del dropdown
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [open]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push('/');
  }

  return (
    <div ref={menuRef} style={{ position: 'relative', zIndex: 99 }}>
      <button
          onClick={() => setOpen((v) => !v)}
          className="pressable"
          style={{
            padding: '7px 9px',
            borderRadius: '10px',
            background: open ? 'var(--bg-raised)' : 'transparent',
            border: '1px solid var(--bg-border)',
            color: 'var(--text-2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Abrir menú"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {open && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '264px',
            maxHeight: 'calc(100dvh - 80px)',
            overflowY: 'auto',
            background: 'var(--bg-surface)',
            border: '1px solid var(--bg-border)',
            borderRadius: '14px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)',
          }}>

            {/* User info */}
            {user && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 12px 10px',
                borderBottom: '1px solid var(--bg-border)',
              }}>
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="" width={32} height={32} className="rounded-full" style={{ flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--accent-grad)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 700, color: 'white', flexShrink: 0,
                  }}>
                    {displayName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <span style={{
                  fontSize: '13px', fontWeight: 600, color: 'var(--text-1)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {displayName}
                </span>
              </div>
            )}

            {/* Nav links */}
            <div style={{ padding: '6px' }}>
              <NavLink href="/" onClick={() => setOpen(false)} icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              }>Mi colección</NavLink>
            </div>

            {/* Albums por sección */}
            {(paniniInstances.length > 0 || treyesInstances.length > 0) && (
              <div style={{ borderTop: '1px solid var(--bg-border)', padding: '6px' }}>
                {paniniInstances.length > 0 && (
                  <div style={{ marginBottom: '4px' }}>
                    <p style={{
                      fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: 'var(--text-3)',
                      padding: '4px 10px 2px',
                    }}>⚽ Panini</p>
                    {paniniInstances.map((inst) => (
                      <NavLink key={inst.id} href={`/album/${inst.id}`} onClick={() => setOpen(false)} indent>
                        {inst.name}
                      </NavLink>
                    ))}
                  </div>
                )}
                {treyesInstances.length > 0 && (
                  <div>
                    <p style={{
                      fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: 'var(--text-3)',
                      padding: '4px 10px 2px',
                    }}>🏆 3 Reyes</p>
                    {treyesInstances.map((inst) => (
                      <NavLink key={inst.id} href={`/album/${inst.id}`} onClick={() => setOpen(false)} indent>
                        {inst.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Logout */}
            <div style={{ padding: '6px', borderTop: '1px solid var(--bg-border)' }}>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="pressable"
                  style={{
                    width: '100%', padding: '9px 10px', borderRadius: '9px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600, color: '#ef4444',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Cerrar sesión
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '9px 10px', borderRadius: '9px',
                    background: 'var(--accent-grad)',
                    fontSize: '13px', fontWeight: 700, color: 'white',
                    textDecoration: 'none',
                  }}
                >
                  Ingresar con Google
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
  );
}

function NavLink({ href, onClick, icon, children, indent }: {
  href: string;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
  indent?: boolean;
}) {
  const router = useRouter();

  function handleClick() {
    onClick();
    router.push(href);
  }

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '9px',
        width: '100%',
        padding: `8px ${indent ? '18px' : '10px'}`,
        borderRadius: '9px',
        fontSize: '13px', fontWeight: 500,
        color: 'var(--text-2)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-raised)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      {icon && <span style={{ color: 'var(--text-3)', flexShrink: 0 }}>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
