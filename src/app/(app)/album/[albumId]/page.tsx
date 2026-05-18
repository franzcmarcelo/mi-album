'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { useUserAlbums, AVAILABLE_ALBUMS } from '@/hooks/useUserAlbums';
import { useAlbumData } from '@/hooks/useAlbumData';
import { useInventory } from '@/hooks/useInventory';
import { useAlbumStats } from '@/hooks/useAlbumStats';
import { useFilters } from '@/hooks/useFilters';
import { mergeWithInventory, getSections } from '@/lib/catalogHelpers';
import { FiguriteGrid } from '@/components/album/FiguriteGrid';
import { AlbumToolbar } from '@/components/album/AlbumToolbar';
import { SectionNav } from '@/components/album/SectionNav';
import { ProgressHeader } from '@/components/album/ProgressHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { AddOwnedModal } from '@/components/album/AddOwnedModal';
import { AddRepeatedModal } from '@/components/album/AddRepeatedModal';
import { useUIStore, CardSize } from '@/store/uiStore';

export default function AlbumPage({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId: instanceId } = use(params);
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const { filter, setFilter, setActiveSection, cardSize, setCardSize } = useUIStore();
  const { getInstanceById, isLoading: albumsLoading, renameAlbum } = useUserAlbums(user);

  const [addOwnedOpen, setAddOwnedOpen] = useState(false);
  const [addRepeatedOpen, setAddRepeatedOpen] = useState(false);

  const instance = getInstanceById(instanceId);
  const catalogMeta = instance ? AVAILABLE_ALBUMS.find((a) => a.slug === instance.slug) : null;

  const { data: catalog = [], isLoading: catalogLoading } = useAlbumData(instance?.slug ?? '');
  const { data: inventory = {}, update } = useInventory(instanceId, user?.id ?? null);

  const stickers = mergeWithInventory(catalog, inventory);
  const filtered = useFilters(stickers);
  const stats = useAlbumStats(stickers);
  const sections = getSections(catalog);

  useEffect(() => {
    setFilter('all');
    setActiveSection(null);
  }, [instanceId, setFilter, setActiveSection]);

  const isLoading = sessionLoading || albumsLoading || catalogLoading;

  // Get missing and owned stickers for modals
  const missingStickers = stickers.filter((s) => !s.userState);
  const repeatableStickers = stickers.filter((s) => s.userState === 'owned' || s.userState === 'repeated');

  if (isLoading || !instance) {
    return (
      <AlbumPageSkeleton notFound={!isLoading && !instance} />
    );
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <Link
        href="/"
        className="pressable inline-flex items-center gap-2"
        style={{
          fontSize: '13px',
          fontWeight: 500,
          color: 'rgba(241,245,249,0.56)',
          textDecoration: 'none',
          padding: '8px 0',
          transition: 'color 200ms',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(241,245,249,0.8)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(241,245,249,0.56)'; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Mi colección
      </Link>

      <ProgressHeader
        albumName={instance.name}
        albumType={catalogMeta ? `${catalogMeta.publisher} · ${catalogMeta.name}` : ''}
        owned={stats.owned}
        repeated={stats.repeated}
        missing={stats.missing}
        total={stats.total}
        progress={stats.progress}
        onRename={(name) => renameAlbum(instanceId, name)}
      />

      <ShareBanner
        onShare={() => router.push(`/share/${instanceId}`)}
        faltantes={stats.missing}
        repetidas={stats.repeated}
      />

      <AlbumToolbar />

      {/* Add button for "Tengo" filter */}
      {filter === 'owned' && (
        <button
          onClick={() => setAddOwnedOpen(true)}
          className="pressable w-full"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            color: '#10b981',
          }}
        >
          <span style={{ fontSize: '16px' }}>+</span>
          Agregar figuras que tengo
        </button>
      )}

      {/* Add button for "Repetidas" filter */}
      {filter === 'repeated' && (
        <button
          onClick={() => setAddRepeatedOpen(true)}
          className="pressable w-full"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            background: 'rgba(234,179,8,0.1)',
            border: '1px solid rgba(234,179,8,0.3)',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            color: '#eab308',
          }}
        >
          <span style={{ fontSize: '16px' }}>+</span>
          Marcar como repetidas
        </button>
      )}

      {/* Size toggle + Search combined row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Size pills */}
        <div
          style={{
            display: 'flex', gap: '2px', flexShrink: 0,
            background: 'var(--bg-surface)',
            border: '1px solid var(--bg-border)',
            borderRadius: '12px',
            padding: '4px',
          }}
        >
          {(['sm', 'md', 'lg'] as CardSize[]).map((s) => {
            const active = cardSize === s;
            return (
              <button
                key={s}
                onClick={() => setCardSize(s)}
                className="pressable rounded-[8px] px-2.5 py-1.5 text-xs font-bold"
                style={{
                  background: active ? 'var(--bg-raised)' : 'transparent',
                  color: active ? 'var(--text-1)' : 'var(--text-3)',
                  border: active ? '1px solid var(--bg-border-hi)' : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                {s === 'sm' ? 'S' : s === 'md' ? 'M' : 'L'}
              </button>
            );
          })}
        </div>
        {/* Search */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <SearchInput />
        </div>
      </div>

      <SectionNav sections={sections} stickers={stickers} />

      <FiguriteGrid
        stickers={filtered}
        currentFilter={filter}
        onUpdate={(id, state, qty) => update.mutate({ stickerId: id, state, quantity: qty })}
        isLoading={isLoading}
      />

      {/* Modals */}
      <AddOwnedModal
        open={addOwnedOpen}
        onClose={() => setAddOwnedOpen(false)}
        missingStickers={missingStickers}
        onAdd={(stickerIds) => {
          stickerIds.forEach((id) => {
            update.mutate({ stickerId: id, state: 'owned', quantity: 1 });
          });
        }}
      />

      <AddRepeatedModal
        open={addRepeatedOpen}
        onClose={() => setAddRepeatedOpen(false)}
        repeatableStickers={repeatableStickers}
        onAdd={(selections) => {
          selections.forEach(({ stickerId, quantity }) => {
            update.mutate({ stickerId, state: 'repeated', quantity });
          });
        }}
      />
    </div>
  );
}

function ShareBanner({ onShare, faltantes, repetidas }: {
  onShare: () => void;
  faltantes: number;
  repetidas: number;
}) {
  return (
    <button
      onClick={onShare}
      className="pressable w-full"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(6,182,212,0.12) 100%)',
        border: '1px solid rgba(99,102,241,0.35)',
        borderRadius: '16px',
        padding: '14px 16px',
        cursor: 'pointer',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* subtle glow top-right */}
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Icon */}
      <div style={{
        width: '42px', height: '42px', flexShrink: 0,
        background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
        borderRadius: '13px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(99,102,241,0.45)',
      }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>
          Compartir mi álbum
        </p>
        <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'rgba(165,180,252,0.75)', lineHeight: 1.4 }}>
          {[faltantes > 0 && `${faltantes} faltantes`, repetidas > 0 && `${repetidas} para intercambiar`].filter(Boolean).join(' · ') || 'Comparte tu progreso'}
          {' · '}
          <span style={{ color: 'rgba(103,232,249,0.8)' }}>siempre actualizado</span>
        </p>
      </div>

      {/* Arrow */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(165,180,252,0.7)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}

function AlbumPageSkeleton({ notFound }: { notFound?: boolean }) {
  if (notFound) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '64px 24px', textAlign: 'center',
        background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '16px',
      }}>
        <span style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</span>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', margin: 0 }}>Álbum no encontrado</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {/* Progress header skeleton */}
      <div style={{
        borderRadius: '16px', padding: '16px 18px',
        background: 'var(--bg-surface)', border: '1px solid var(--bg-border)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="skeleton" style={{ height: '20px', width: '160px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ height: '12px', width: '100px', borderRadius: '6px' }} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: '52px', width: '72px', borderRadius: '10px' }} />
            ))}
          </div>
          <div className="skeleton" style={{ height: '4px', borderRadius: '99px', marginTop: '4px' }} />
        </div>
      </div>
      {/* Toolbar skeleton */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton" style={{ height: '32px', width: '64px', borderRadius: '20px' }} />
        ))}
      </div>
      {/* Grid skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '56px', borderRadius: '10px' }} />
        ))}
      </div>
    </div>
  );
}
