'use client';

import { use } from 'react';
import { useSession } from '@/hooks/useSession';
import { useUserAlbums, AVAILABLE_ALBUMS } from '@/hooks/useUserAlbums';
import { useAlbumData } from '@/hooks/useAlbumData';
import { useInventory } from '@/hooks/useInventory';
import { useFilters } from '@/hooks/useFilters';
import { useShare } from '@/hooks/useShare';
import { mergeWithInventory, getStats, getSections } from '@/lib/catalogHelpers';
import { FiguriteGrid } from '@/components/album/FiguriteGrid';
import { AlbumToolbar } from '@/components/album/AlbumToolbar';
import { SectionNav } from '@/components/album/SectionNav';
import { ProgressHeader } from '@/components/album/ProgressHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { ShareModal } from '@/components/share/ShareModal';
import { useUIStore } from '@/store/uiStore';

export default function AlbumPage({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId: instanceId } = use(params);
  const { user, loading: sessionLoading } = useSession();
  const { openShareModal } = useUIStore();
  const { getInstanceById, isLoading: albumsLoading } = useUserAlbums(user);

  const instance = getInstanceById(instanceId);
  const catalogMeta = instance ? AVAILABLE_ALBUMS.find((a) => a.slug === instance.slug) : null;

  const { data: catalog = [], isLoading: catalogLoading } = useAlbumData(instance?.slug ?? '');
  const { data: inventory = {}, update } = useInventory(instanceId, user?.id ?? null);

  const stickers = mergeWithInventory(catalog, inventory);
  const filtered = useFilters(stickers);
  const stats = getStats(stickers);
  const sections = getSections(catalog);

  const { generateUrl } = useShare(stickers, instance?.slug ?? '');
  const shareUrl = typeof window !== 'undefined' ? generateUrl() : '';

  const isLoading = sessionLoading || albumsLoading || catalogLoading;

  if (isLoading || !instance) {
    return (
      <AlbumPageSkeleton notFound={!isLoading && !instance} />
    );
  }

  return (
    <div className="space-y-4">
      <ProgressHeader
        albumName={instance.name}
        albumType={catalogMeta ? `${catalogMeta.publisher} · ${catalogMeta.name}` : ''}
        owned={stats.owned}
        repeated={stats.repeated}
        missing={stats.missing}
        total={stats.total}
        progress={stats.progress}
      />

      <ShareBanner
        onShare={openShareModal}
        faltantes={stats.missing}
        repetidas={stats.repeated}
      />

      <AlbumToolbar />

      <SearchInput />
      <SectionNav sections={sections} stickers={stickers} />

      <FiguriteGrid
        stickers={filtered}
        onUpdate={(id, state, qty) => update.mutate({ stickerId: id, state, quantity: qty })}
        isLoading={isLoading}
      />

      <ShareModal shareUrl={shareUrl} albumName={instance.name} publisher={catalogMeta?.publisher ?? ''} stickers={stickers} />
    </div>
  );
}

function ShareBanner({ onShare, faltantes, repetidas }: {
  onShare: () => void;
  faltantes: number;
  repetidas: number;
}) {
  const tags = [
    faltantes > 0 && `${faltantes} faltantes`,
    repetidas > 0 && `${repetidas} repetidas`,
    'enlace',
  ].filter(Boolean) as string[];

  return (
    <button
      onClick={onShare}
      className="pressable w-full"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--bg-border)',
        borderRadius: '14px',
        padding: '12px 14px',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      {/* Icon */}
      <div style={{
        width: '38px', height: '38px', flexShrink: 0,
        background: 'var(--accent-grad)',
        borderRadius: '11px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 12px rgba(29,78,216,0.35)',
      }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-1)' }}>
          Compartir álbum
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-3)' }}>
          {tags.join(' · ')}
        </p>
      </div>

      {/* Arrow */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
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
