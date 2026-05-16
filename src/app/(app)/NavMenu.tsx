'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { useUserAlbums } from '@/hooks/useUserAlbums';
import { createClient } from '@/lib/supabase/client';

export function NavMenu() {
  const [open, setOpen] = useState(false);
  const { user } = useSession();
  const { instances } = useUserAlbums(user);
  const router = useRouter();

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? null;
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;

  const paniniInstances = instances.filter((i) => i.slug.startsWith('panini'));
  const treyesInstances = instances.filter((i) => i.slug.startsWith('3reyes'));

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.refresh();
  }

  function close() { setOpen(false); }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="pressable"
        style={{
          padding: '7px 8px',
          borderRadius: '10px',
          background: 'transparent',
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
        <>
          {/* Backdrop */}
          <div
            onClick={close}
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(2px)',
            }}
          />

          {/* Drawer */}
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50,
            width: '280px',
            background: 'var(--bg-base)',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid var(--bg-border)',
          }}>

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px',
              borderBottom: '1px solid var(--bg-border)',
            }}>
              <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-1)' }}>Menú</span>
              <button
                onClick={close}
                className="pressable"
                style={{
                  padding: '5px',
                  borderRadius: '8px',
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--bg-border)',
                  cursor: 'pointer',
                  color: 'var(--text-3)',
                  display: 'flex',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>

              {/* User info */}
              {user && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--bg-border)',
                  marginBottom: '16px',
                }}>
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="" width={32} height={32} className="rounded-full" />
                  ) : (
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700, color: 'white',
                      flexShrink: 0,
                    }}>
                      {displayName?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayName}
                  </span>
                </div>
              )}

              {/* Nav links */}
              <div style={{ marginBottom: '8px' }}>
                <NavLink href="/" onClick={close} icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                }>Mi colección</NavLink>
                <NavLink href="/cargar" onClick={close} icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                }>Cargar figuritas</NavLink>
                <NavLink href="/repetidas" onClick={close} icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }>Mis repetidas</NavLink>
              </div>

              {/* Albums by section */}
              {(paniniInstances.length > 0 || treyesInstances.length > 0) && (
                <div style={{
                  borderTop: '1px solid var(--bg-border)',
                  paddingTop: '12px',
                  marginTop: '4px',
                }}>
                  {paniniInstances.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{
                        fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                        textTransform: 'uppercase', color: 'var(--text-3)',
                        padding: '0 8px', marginBottom: '4px',
                      }}>⚽ Panini</p>
                      {paniniInstances.map((inst) => (
                        <NavLink key={inst.id} href={`/album/${inst.id}`} onClick={close} indent>
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
                        padding: '0 8px', marginBottom: '4px',
                      }}>🏆 3 Reyes</p>
                      {treyesInstances.map((inst) => (
                        <NavLink key={inst.id} href={`/album/${inst.id}`} onClick={close} indent>
                          {inst.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '12px', borderTop: '1px solid var(--bg-border)' }}>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="pressable"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'var(--bg-raised)',
                    border: '1px solid var(--bg-border)',
                    fontSize: '13px', fontWeight: 600,
                    color: '#ef4444',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  }}
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
                  onClick={close}
                  style={{
                    display: 'block', textAlign: 'center',
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                    fontSize: '13px', fontWeight: 700, color: 'white',
                    textDecoration: 'none',
                  }}
                >
                  Ingresar con Google
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function NavLink({ href, onClick, icon, children, indent }: {
  href: string;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
  indent?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '9px',
        padding: `8px ${indent ? '20px' : '8px'}`,
        borderRadius: '9px',
        fontSize: '13px', fontWeight: 500,
        color: 'var(--text-2)',
        textDecoration: 'none',
        transition: 'background 120ms',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-raised)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      {icon && <span style={{ color: 'var(--text-3)', flexShrink: 0 }}>{icon}</span>}
      <span>{children}</span>
    </Link>
  );
}
