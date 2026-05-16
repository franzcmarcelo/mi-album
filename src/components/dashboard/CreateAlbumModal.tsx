'use client';

import { useState } from 'react';
import { AlbumCatalog } from '@/types';
import { Button } from '@/components/ui/Button';

interface CreateAlbumModalProps {
  onAdd: (slug: string, name: string) => void;
  onClose: () => void;
}

const AVAILABLE_ALBUMS: AlbumCatalog[] = [
  { id: 'panini-2024', slug: 'panini-2024', name: 'Mundial 2024', year: 2024, publisher: 'Panini', totalStickers: 145 },
  { id: '3reyes-2024', slug: '3reyes-2024', name: 'Liga Argentina', year: 2024, publisher: '3 Reyes', totalStickers: 150 },
];

const coverColors: Record<string, string> = {
  'panini-2024': 'from-blue-600 to-indigo-700',
  '3reyes-2024': 'from-emerald-600 to-teal-700',
};

const publisherIcons: Record<string, string> = {
  Panini: '⚽',
  '3 Reyes': '🏆',
};

export function CreateAlbumModal({ onAdd, onClose }: CreateAlbumModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [albumName, setAlbumName] = useState('Mi Album');

  function handleConfirm() {
    if (!selected) return;
    onAdd(selected, albumName);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Nuevo album</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nombre del album */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            type="text"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            placeholder="Mi Album"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">Por ejemplo: &ldquo;Mi Album&rdquo;, &ldquo;Album de Mateo&rdquo;</p>
        </div>

        {/* Tipo de album */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de album
          </label>
          <div className="grid grid-cols-2 gap-3">
            {AVAILABLE_ALBUMS.map((album) => {
              const isSelected = selected === album.slug;
              const gradient = coverColors[album.slug] ?? 'from-gray-600 to-gray-800';
              return (
                <button
                  key={album.slug}
                  onClick={() => setSelected(album.slug)}
                  className={`relative overflow-hidden rounded-xl p-4 text-left transition-all ${
                    isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:scale-[1.02]'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                  <div className="relative z-10 space-y-1 text-white">
                    <span className="text-2xl">{publisherIcons[album.publisher] ?? '📚'}</span>
                    <p className="text-xs font-medium text-white/60 uppercase tracking-wide">{album.publisher}</p>
                    <p className="font-bold leading-tight">{album.name}</p>
                    <p className="text-xs text-white/70">{album.totalStickers} figuritas</p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 rounded-full bg-white p-0.5">
                      <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M20.707 5.293a1 1 0 010 1.414l-11 11a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L9 15.586 19.293 5.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <Button onClick={handleConfirm} disabled={!selected} className="w-full">
          Crear album
        </Button>
      </div>
    </div>
  );
}
