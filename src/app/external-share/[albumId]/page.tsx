'use client';

import { use } from 'react';
import { useExternalAlbum, ALBUM_UUID_RE } from '@/hooks/useExternalAlbum';
import { AVAILABLE_ALBUMS } from '@/hooks/useUserAlbums';
import { AlbumStatsCard, StickerGrid, ShareFooter, SharePageSkeleton } from '@/components/share/ShareAlbumView';

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ albumId: string }>;
}

export default function ExternalSharePage({ params }: Props) {
  const { albumId } = use(params);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <header style={{
        background: 'rgba(7,9,15,0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/favicon.png" alt="Mi Álbum" style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '8px' }} />
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-2)' }}>Mi Álbum · Copa del Mundo 2026</span>
      </header>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '16px 16px 48px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <AlbumView albumId={albumId} />
      </main>
    </div>
  );
}

// ─── AlbumView ────────────────────────────────────────────────────────────────

function AlbumView({ albumId }: { albumId: string }) {
  const isValidUUID = ALBUM_UUID_RE.test(albumId);
  const { data, isLoading, error } = useExternalAlbum(albumId);

  if (!isValidUUID) return <InvalidLink />;

  if (isLoading) return <SharePageSkeleton />;

  if (error || !data) return <InvalidLink />;

  const { albumName, ownerName, slug, stickers } = data;
  const catalogMeta = AVAILABLE_ALBUMS.find((a) => a.slug === slug);

  return (
    <>
      <AlbumStatsCard
        meta={{
          ownerName,
          albumName,
          publisher: catalogMeta?.publisher ?? 'Panini',
          catalogName: catalogMeta?.name ?? 'Copa del Mundo 2026',
        }}
        stickers={stickers}
      />
      <StickerGrid stickers={stickers} />
      <ShareFooter />
    </>
  );
}

// ─── InvalidLink ──────────────────────────────────────────────────────────────

function InvalidLink() {
  return (
    <div style={{ textAlign: 'center', padding: '48px 16px' }}>
      <p style={{ fontSize: '32px', marginBottom: '12px' }}>🔗</p>
      <p style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: '16px', margin: '0 0 8px' }}>Enlace inválido o expirado</p>
      <p style={{ color: 'var(--text-3)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
        Este álbum no existe o el enlace no es válido.
      </p>
    </div>
  );
}
