'use client';

import { useState } from 'react';
import { useSession } from '@/hooks/useSession';
import { useUserAlbums, AVAILABLE_ALBUMS } from '@/hooks/useUserAlbums';
import { useMigrateToSupabase } from '@/hooks/useMigrateToSupabase';
import { useAlbumData } from '@/hooks/useAlbumData';
import { useInventory } from '@/hooks/useInventory';
import { mergeWithInventory, getStats } from '@/lib/catalogHelpers';
import { AlbumCover } from '@/components/dashboard/AlbumCover';
import { CreateAlbumModal } from '@/components/dashboard/CreateAlbumModal';
import { UserAlbumInstance } from '@/types';

function AlbumCard({ instance, userId, onRemove, onRename }: {
  instance: UserAlbumInstance;
  userId: string | null;
  onRemove: () => void;
  onRename: (id: string, name: string) => void;
}) {
  const catalog = AVAILABLE_ALBUMS.find((a) => a.slug === instance.slug)!;
  const { data: stickers = [] } = useAlbumData(instance.slug);
  const { data: inventory = {} } = useInventory(instance.id, userId);
  const stats = getStats(mergeWithInventory(stickers, inventory));

  return (
    <AlbumCover
      album={catalog}
      instanceId={instance.id}
      customName={instance.name}
      progress={stats.progress}
      owned={stats.owned}
      total={stats.total}
      onRename={(name) => onRename(instance.id, name)}
      onDelete={onRemove}
    />
  );
}

export default function DashboardPage() {
  const { user } = useSession();
  const { instances, addAlbum, removeAlbum, renameAlbum } = useUserAlbums(user);
  const [showModal, setShowModal] = useState(false);

  useMigrateToSupabase(user);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? null;

  return (
    <div className="space-y-5">
      {/* Hero header */}
      <div
        style={{
          borderRadius: '16px',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--bg-surface)',
          border: '1px solid var(--bg-border)',
        }}
      >
        {/* Gradient glow */}
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-20px',
          width: '160px', height: '160px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {firstName && (
              <p style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: 500, margin: '0 0 2px' }}>
                Bienvenido, {firstName}
              </p>
            )}
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-1)', margin: 0, letterSpacing: '-0.02em' }}>
              Mi Colección
            </h1>
            <p
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginTop: '4px',
                background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Copa del Mundo 2026
            </p>
          </div>
          {instances.length > 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="pressable"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Nuevo
            </button>
          )}
        </div>
      </div>

      {/* Albums grid */}
      {instances.length === 0 ? (
        <EmptyState onAdd={() => setShowModal(true)} />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {instances.map((instance) => (
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

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '20px',
        border: '1.5px dashed rgba(255,255,255,0.1)',
        padding: '56px 24px',
        textAlign: 'center',
        background: 'var(--bg-surface)',
      }}
    >
      <div
        style={{
          width: '72px', height: '72px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px', marginBottom: '18px',
          boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
        }}
      >
        ⚽
      </div>
      <h2 style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text-1)', margin: '0 0 8px' }}>
        Todavía no tenés álbumes
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-2)', margin: '0 0 24px', maxWidth: '260px', lineHeight: 1.5 }}>
        Agregá tu primer álbum para empezar a registrar tus figuritas
      </p>
      <button
        onClick={onAdd}
        className="pressable"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          color: 'white',
          border: 'none',
          borderRadius: '14px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Agregar primer álbum
      </button>
    </div>
  );
}
