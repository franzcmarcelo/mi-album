'use client';

import Link from 'next/link';
import { AlbumCatalog } from '@/types';

interface AlbumCoverProps {
  album: AlbumCatalog;
  instanceId: string;
  customName: string;
  progress: number;
  owned: number;
}

const coverColors: Record<string, string> = {
  'panini-2024': 'from-blue-600 to-indigo-700',
  '3reyes-2024': 'from-emerald-600 to-teal-700',
};

export function AlbumCover({ album, instanceId, customName, progress, owned }: AlbumCoverProps) {
  const gradient = coverColors[album.slug] ?? 'from-gray-600 to-gray-800';

  return (
    <Link href={`/album/${instanceId}`} className="block group">
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-xl`}
        style={{ aspectRatio: '3/4' }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)',
          }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-white/60">{album.publisher}</p>
            <h2 className="mt-1 text-xl font-bold leading-tight">{customName}</h2>
            <p className="text-sm text-white/70">{album.name} · {album.year}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{owned} figuritas</span>
              <span className="font-bold">{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
