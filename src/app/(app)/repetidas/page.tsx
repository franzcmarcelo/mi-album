'use client';

import { useSession } from '@/hooks/useSession';
import { useUserAlbums } from '@/hooks/useUserAlbums';
import { useAlbumData } from '@/hooks/useAlbumData';
import { useInventory } from '@/hooks/useInventory';
import { mergeWithInventory } from '@/lib/catalogHelpers';
import { getSectionColor } from '@/lib/sectionColors';
import { UserAlbumInstance, StickerWithState } from '@/types';
import Link from 'next/link';

function InstanceRepetidas({ instance, userId }: { instance: UserAlbumInstance; userId: string | null }) {
  const { data: catalog = [] } = useAlbumData(instance.slug);
  const { data: inventory = {} } = useInventory(instance.id, userId);

  const stickers = mergeWithInventory(catalog, inventory);
  const repetidas = stickers.filter((s) => s.userState === 'repeated');

  if (repetidas.length === 0) return null;

  const bySection: Record<string, StickerWithState[]> = {};
  for (const s of repetidas) {
    if (!bySection[s.section]) bySection[s.section] = [];
    bySection[s.section].push(s);
  }

  return (
    <div
      className="stagger-item overflow-hidden"
      style={{
        borderRadius: '16px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--bg-border)',
        overflow: 'hidden',
      }}
    >
      {/* Album header */}
      <div style={{
        padding: '11px 14px',
        borderBottom: '1px solid var(--bg-border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--bg-raised)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--accent-grad)',
          }} />
          <span style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: '13px' }}>
            {instance.name}
          </span>
        </div>
        <span style={{
          background: 'rgba(99,102,241,0.18)',
          border: '1px solid rgba(99,102,241,0.18)',
          color: '#a5b4fc',
          borderRadius: '20px', padding: '2px 10px',
          fontSize: '11px', fontWeight: 700,
        }}>
          {repetidas.length} repetida{repetidas.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Sections */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {Object.entries(bySection).map(([section, items]) => {
          const c = getSectionColor(section);
          return (
            <div key={section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: c.bg, flexShrink: 0 }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: c.bg, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {section}
                  </span>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 500 }}>{items.length}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {items.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      background: `${c.bg}14`,
                      border: `1px solid ${c.bg}38`,
                      borderRadius: '8px', padding: '4px 8px',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 800, color: c.bg }}>#{s.number}</span>
                    {(s.quantity ?? 1) > 1 && (
                      <span style={{
                        background: `${c.bg}28`, color: c.bg,
                        borderRadius: '4px', padding: '0 4px', fontSize: '9px', fontWeight: 800,
                      }}>
                        ×{s.quantity}
                      </span>
                    )}
                    <span style={{
                      fontSize: '9px', color: 'var(--text-2)',
                      maxWidth: '68px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {s.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RepetidasPage() {
  const { user } = useSession();
  const { instances } = useUserAlbums(user);

  return (
    <div className="space-y-4">
      {/* WC-themed header */}
      <div style={{
        borderRadius: '16px', overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(150deg, #06102e 0%, #0f2870 50%, #1a1050 100%)',
        border: '1px solid rgba(29,78,216,0.28)',
        boxShadow: '0 16px 40px rgba(29,78,216,0.12)',
      }}>
        <div style={{
          height: '3px',
          background: 'var(--accent-grad-h)',
        }} />
        <div className="wc-stripes" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <div style={{ padding: '18px 20px', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#a5b4fc', margin: '0 0 4px' }}>
            FIFA World Cup 2026
          </p>
          <h1 style={{ color: 'white', fontWeight: 900, fontSize: '24px', margin: 0, letterSpacing: '-0.02em' }}>
            🔄 Repetidas
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '13px', margin: '4px 0 0', fontWeight: 500 }}>
            Figuritas disponibles para intercambiar
          </p>
        </div>
      </div>

      {instances.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '48px 24px', textAlign: 'center',
          background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '16px',
        }}>
          <span style={{ fontSize: '36px', marginBottom: '12px' }}>📚</span>
          <p style={{ color: 'var(--text-2)', fontSize: '14px', margin: '0 0 16px' }}>
            Primero agregá un álbum desde el inicio
          </p>
          <Link href="/" style={{
            background: 'var(--accent-grad)',
            color: 'white', borderRadius: '12px', padding: '10px 20px',
            fontSize: '13px', fontWeight: 700, textDecoration: 'none',
          }}>
            Ir al inicio
          </Link>
        </div>
      ) : (
        <>
          {instances.map((inst) => (
            <InstanceRepetidas key={inst.id} instance={inst} userId={user?.id ?? null} />
          ))}
          {instances.every(() => true) && (
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-3)', padding: '4px 0 8px' }}>
              Marcá figuritas como repetidas desde el álbum
            </p>
          )}
        </>
      )}
    </div>
  );
}
