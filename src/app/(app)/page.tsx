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

function AlbumCard({ instance, userId, onRemove }: { instance: UserAlbumInstance; userId: string | null; onRemove: () => void }) {
  const catalog = AVAILABLE_ALBUMS.find((a) => a.slug === instance.slug)!;
  const { data: stickers = [] } = useAlbumData(instance.slug);
  const { data: inventory = {} } = useInventory(instance.id, userId);
  const stats = getStats(mergeWithInventory(stickers, inventory));

  return (
    <div className="group relative">
      <AlbumCover
        album={catalog}
        instanceId={instance.id}
        customName={instance.name}
        progress={stats.progress}
        owned={stats.owned}
      />
      <button
        onClick={onRemove}
        className="absolute top-2 left-2 hidden rounded-full bg-black/40 p-1 text-white backdrop-blur-sm group-hover:flex hover:bg-black/60"
        title="Eliminar album"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useSession();
  const { instances, addAlbum, removeAlbum } = useUserAlbums(user);
  const [showModal, setShowModal] = useState(false);

  useMigrateToSupabase(user);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Coleccion</h1>
          {instances.length > 0 && (
            <p className="text-sm text-gray-500">
              {instances.length} album{instances.length !== 1 ? 'es' : ''}
            </p>
          )}
        </div>
        {instances.length > 0 && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo album
          </button>
        )}
      </div>

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
            />
          ))}
        </div>
      )}

      {showModal && (
        <CreateAlbumModal
          onAdd={addAlbum}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
      <span className="text-5xl">📚</span>
      <h2 className="mt-4 text-lg font-semibold text-gray-700">Todavia no tenes albums</h2>
      <p className="mt-1 text-sm text-gray-400">Agrega tu primer album para empezar a cargar figuritas</p>
      <button
        onClick={onAdd}
        className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Agregar primer album
      </button>
    </div>
  );
}
