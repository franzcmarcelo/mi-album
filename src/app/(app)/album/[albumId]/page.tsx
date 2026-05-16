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
import { FilterBar } from '@/components/album/FilterBar';
import { SectionNav } from '@/components/album/SectionNav';
import { ProgressHeader } from '@/components/album/ProgressHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { ShareModal } from '@/components/share/ShareModal';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/uiStore';

export default function AlbumPage({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId: instanceId } = use(params);
  const { user } = useSession();
  const { openShareModal } = useUIStore();
  const { getInstanceById } = useUserAlbums(user);

  const instance = getInstanceById(instanceId);
  const catalogMeta = instance ? AVAILABLE_ALBUMS.find((a) => a.slug === instance.slug) : null;

  const { data: catalog = [], isLoading } = useAlbumData(instance?.slug ?? '');
  const { data: inventory = {}, toggle } = useInventory(instanceId, user?.id ?? null);

  const stickers = mergeWithInventory(catalog, inventory);
  const filtered = useFilters(stickers);
  const stats = getStats(stickers);
  const sections = getSections(catalog);

  const { generateUrl } = useShare(stickers, instance?.slug ?? '');
  const shareUrl = typeof window !== 'undefined' ? generateUrl() : '';

  if (isLoading || !instance) {
    return (
      <div className="flex h-40 items-center justify-center text-gray-400">
        {!instance ? 'Album no encontrado' : 'Cargando...'}
      </div>
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

      <div className="flex items-center justify-between gap-3">
        <FilterBar />
        <Button variant="secondary" size="sm" onClick={openShareModal}>
          Compartir
        </Button>
      </div>

      <SearchInput />
      <SectionNav sections={sections} />

      <FiguriteGrid
        stickers={filtered}
        onToggle={(id, state) => toggle.mutate({ stickerId: id, currentState: state })}
      />

      <ShareModal shareUrl={shareUrl} albumName={instance.name} />
    </div>
  );
}
