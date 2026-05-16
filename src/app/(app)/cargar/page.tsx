'use client';

import { useState } from 'react';
import { useSession } from '@/hooks/useSession';
import { useUserAlbums } from '@/hooks/useUserAlbums';
import { useAlbumData } from '@/hooks/useAlbumData';
import { useInventory } from '@/hooks/useInventory';
import { mergeWithInventory } from '@/lib/catalogHelpers';
import { BatchInput } from '@/components/cargar/BatchInput';
import { GridSelector } from '@/components/cargar/GridSelector';
import { SectionSelector } from '@/components/cargar/SectionSelector';
import { StickerWithState } from '@/types';
import Link from 'next/link';

type Mode = 'batch' | 'grid' | 'section';

export default function CargarPage() {
  const { user } = useSession();
  const { instances } = useUserAlbums(user);
  const [activeInstanceId, setActiveInstanceId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('batch');

  const activeInstance = instances.find((i) => i.id === activeInstanceId) ?? instances[0] ?? null;

  const { data: catalog = [] } = useAlbumData(activeInstance?.slug ?? '');
  const { data: inventory = {}, toggle } = useInventory(activeInstance?.id ?? '', user?.id ?? null);
  const stickers = mergeWithInventory(catalog, inventory);

  function handleBatchAdd(numbers: number[]) {
    for (const num of numbers) {
      const sticker = stickers.find((s) => s.number === num);
      if (sticker && !sticker.userState) {
        toggle.mutate({ stickerId: sticker.id, currentState: undefined });
      }
    }
  }

  function handleMarkSection(sectionStickers: StickerWithState[]) {
    for (const s of sectionStickers) {
      if (!s.userState) {
        toggle.mutate({ stickerId: s.id, currentState: undefined });
      }
    }
  }

  if (instances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-4xl">📚</span>
        <p className="mt-3 text-gray-500">Primero agrega un album desde el inicio</p>
        <Link href="/" className="mt-4 text-sm text-blue-600 hover:underline">Ir al inicio</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Cargar figuritas</h1>

      <div className="flex flex-wrap gap-2">
        {instances.map((inst) => (
          <button
            key={inst.id}
            onClick={() => setActiveInstanceId(inst.id)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeInstance?.id === inst.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {inst.name}
          </button>
        ))}
      </div>

      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {(['batch', 'grid', 'section'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            {m === 'batch' ? 'Por numeros' : m === 'grid' ? 'Cuadricula' : 'Por seccion'}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4">
        {mode === 'batch' && (
          <BatchInput totalStickers={catalog.length} onAdd={handleBatchAdd} />
        )}
        {mode === 'grid' && (
          <GridSelector
            stickers={stickers}
            onToggle={(id, state) => toggle.mutate({ stickerId: id, currentState: state })}
          />
        )}
        {mode === 'section' && (
          <SectionSelector stickers={stickers} onMarkSection={handleMarkSection} />
        )}
      </div>
    </div>
  );
}
