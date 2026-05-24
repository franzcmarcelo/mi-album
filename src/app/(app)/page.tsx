'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { useUserAlbums, AVAILABLE_ALBUMS } from '@/hooks/useUserAlbums';
import { useAlbumData } from '@/hooks/useAlbumData';
import { useAlbumStats } from '@/hooks/useAlbumStats';
import { useInventory } from '@/hooks/useInventory';
import { mergeWithInventory } from '@/lib/catalogHelpers';
import { AlbumCover } from '@/components/dashboard/AlbumCover';
import { CreateAlbumModal } from '@/components/dashboard/CreateAlbumModal';
import { UserAlbumInstance } from '@/types';

const PUBLISHER_FILTERS = [
  { label: 'Todos', value: null },
  { label: '⚽ Panini', value: 'panini' },
  { label: '🏆 3 Reyes', value: '3reyes' },
];

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

function WCHero({ firstName }: { firstName: string | null }) {
  return (
    <div style={{
      borderRadius: '20px',
      overflow: 'hidden',
      position: 'relative',
      background: 'linear-gradient(150deg, #06102e 0%, #0f2870 42%, #1a1050 100%)',
      border: '1px solid rgba(29,78,216,0.3)',
      boxShadow: '0 24px 64px rgba(29,78,216,0.18), 0 4px 16px rgba(0,0,0,0.5)',
    }}>
      <div style={{ height: '3px', background: 'var(--accent-grad-h)' }} />

      {/* Diagonal stripes */}
      <div className="wc-stripes" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      {/*
        Logo 2 — positioned so the sphere is visible inside the card but the
        "MUNDIAL 2026" text overflows below and is clipped by overflow:hidden.
        Approx proportions: sphere = top 52%, text = bottom 48%.
        At width 170px → height ≈ 221px. bottom:-105px clips the text portion.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/world-cup-logo.png"
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute', right: '-18px', bottom: '0px',
          width: 'clamp(220px, 34vw, 148px)',
          height: 'auto',
          pointerEvents: 'none',
          filter: 'grayscale(1) invert(1) brightness(2.8) opacity(0.17)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Content */}
      <div style={{ padding: '18px 20px 20px', position: 'relative', zIndex: 1 }}>
        {/* Host countries */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '14px' }}>
          <span style={{ fontSize: '16px', lineHeight: 1 }}>🇺🇸</span>
          <span style={{ fontSize: '16px', lineHeight: 1 }}>🇨🇦</span>
          <span style={{ fontSize: '16px', lineHeight: 1 }}>🇲🇽</span>
          <span style={{
            fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em',
            color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginLeft: '4px',
          }}>
            USA · CAN · MEX
          </span>
        </div>

        {/* Title block */}
        <div>
          <p style={{
            fontSize: '10px', fontWeight: 800, letterSpacing: '0.28em',
            textTransform: 'uppercase', margin: '0 0 1px',
            color: 'rgba(165,180,252,0.8)',
          }}>
            FIFA World Cup
          </p>
          <p style={{
            fontSize: '76px', fontWeight: 900, letterSpacing: '-0.05em',
            lineHeight: 0.82, margin: '0 0 14px', color: 'white',
            fontVariantNumeric: 'tabular-nums',
          }}>
            2026
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', margin: 0, fontWeight: 500 }}>
            {firstName ? `Mis álbunes · ${firstName}` : 'Mis álbunes'}
          </p>
        </div>
      </div>
    </div>
  );
}

function AlbumCard({ instance, userId, onRemove, onRename }: {
  instance: UserAlbumInstance;
  userId: string | null;
  onRemove: () => void;
  onRename: (id: string, name: string) => void;
}) {
  const catalog = AVAILABLE_ALBUMS.find((a) => a.slug === instance.slug)!;
  const { data: stickers = [] } = useAlbumData(instance.slug);
  const { data: inventory = {} } = useInventory(instance.id, userId, {
    slug: instance.slug,
    albumCatalogId: instance.albumCatalogId,
  });
  const stats = useAlbumStats(mergeWithInventory(stickers, inventory));

  return (
    <AlbumCover
      album={catalog}
      instanceId={instance.id}
      customName={instance.name}
      progress={stats.progress}
      owned={stats.owned}
      repeated={stats.repeated}
      total={stats.total}
      onRename={(name) => onRename(instance.id, name)}
      onDelete={onRemove}
    />
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const { instances, isLoading: albumsLoading, addAlbum, removeAlbum, renameAlbum } = useUserAlbums(user);
  const [showModal, setShowModal] = useState(false);
  const [publisherFilter, setPublisherFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading && !user) router.replace('/login');
  }, [user, sessionLoading, router]);

  const isLoading = sessionLoading || albumsLoading;
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? null;

  const filteredInstances = publisherFilter
    ? instances.filter((i) => i.slug.startsWith(publisherFilter))
    : instances;

  const hasMultiplePublishers = new Set(
    instances.map((i) => PUBLISHER_FILTERS.find((f) => f.value && i.slug.startsWith(f.value))?.value)
  ).size > 1;

  return (
    <div className="space-y-5">
      <WCHero firstName={firstName} />

      {/* Controls bar — same style as AlbumToolbar */}
      {!isLoading && instances.length > 0 && (
        <div
          className="flex items-center gap-2"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--bg-border)',
            borderRadius: '14px',
            padding: '5px',
          }}
        >
          {/* Publisher filter pills — only when multiple publishers */}
          {hasMultiplePublishers && (
            <>
              <div className="flex gap-1" style={{ flex: 1, minWidth: 0 }}>
                {PUBLISHER_FILTERS.map((f) => {
                  const active = publisherFilter === f.value;
                  return (
                    <button
                      key={String(f.value)}
                      onClick={() => setPublisherFilter(f.value)}
                      className="pressable flex-1 rounded-[9px] px-2 py-1.5 text-xs font-semibold"
                      style={{
                        background: active ? 'var(--bg-raised)' : 'transparent',
                        color: active ? 'var(--text-1)' : 'var(--text-3)',
                        border: active ? '1px solid var(--bg-border-hi)' : '1px solid transparent',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        minWidth: 0,
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
              {/* Divider — only with pills */}
              <div style={{ width: '1px', height: '20px', background: 'var(--bg-border-hi)', flexShrink: 0 }} />
            </>
          )}

          {/* Add button — marginLeft:auto pushes it right when there are no pills */}
          <button
            onClick={() => setShowModal(true)}
            className="pressable rounded-[9px] px-3 py-1.5 text-xs font-bold"
            style={{
              marginLeft: hasMultiplePublishers ? 0 : 'auto',
              background: 'var(--bg-raised)',
              color: 'var(--text-1)',
              border: '1px solid var(--bg-border-hi)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo álbum
          </button>
        </div>
      )}

      {isLoading ? (
        <DashboardSkeleton />
      ) : instances.length === 0 ? (
        <EmptyState onAdd={() => setShowModal(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInstances.map((instance) => (
            <AlbumCard
              key={instance.id}
              instance={instance}
              userId={user?.id ?? null}
              onRemove={() => removeAlbum(instance.id)}
              onRename={renameAlbum}
            />
          ))}
        </div>
      )}

      {showModal && (
        <CreateAlbumModal onAdd={addAlbum} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          style={{
            borderRadius: '22px',
            aspectRatio: '3/4',
            overflow: 'hidden',
            background: 'var(--bg-surface)',
            border: '1px solid var(--bg-border)',
          }}
        >
          <div style={{ height: '58%', background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '50%' }} />
          </div>
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="skeleton" style={{ height: '13px', width: '80%', borderRadius: '5px' }} />
            <div style={{ display: 'flex', gap: '5px' }}>
              <div className="skeleton" style={{ height: '36px', flex: 1, borderRadius: '8px' }} />
              <div className="skeleton" style={{ height: '36px', flex: 1, borderRadius: '8px' }} />
            </div>
            <div className="skeleton" style={{ height: '3px', borderRadius: '99px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', borderRadius: '20px',
      border: '1px solid rgba(29,78,216,0.2)',
      padding: '52px 24px', textAlign: 'center',
      background: 'linear-gradient(160deg, #06102e 0%, #0d1f5c 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div className="wc-hex" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '52px', marginBottom: '16px', filter: 'drop-shadow(0 8px 20px rgba(29,78,216,0.4))' }}>
          ⚽
        </div>
        <h2 style={{ fontWeight: 800, fontSize: '17px', color: 'white', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
          Empieza tu colección
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: '0 0 24px', maxWidth: '240px', lineHeight: 1.55 }}>
          Agrega tu primer álbum y empieza a registrar tus figuras del Mundial
        </p>
        <button
          onClick={onAdd}
          className="pressable"
          style={{
            background: 'var(--accent-grad)',
            color: 'white', border: 'none', borderRadius: '14px',
            padding: '12px 28px', fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 8px 24px var(--accent-glow)',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Agregar álbum
        </button>
      </div>
    </div>
  );
}
