'use client';

import { useUserAlbums } from '@/hooks/useUserAlbums';
import { useAlbumData } from '@/hooks/useAlbumData';
import { useInventory } from '@/hooks/useInventory';
import { mergeWithInventory } from '@/lib/catalogHelpers';
import { Badge } from '@/components/ui/Badge';
import { UserAlbumInstance } from '@/types';
import Link from 'next/link';

function InstanceRepetidas({ instance }: { instance: UserAlbumInstance }) {
  const { data: catalog = [] } = useAlbumData(instance.slug);
  const { data: inventory = {} } = useInventory(instance.id, null);

  const stickers = mergeWithInventory(catalog, inventory);
  const repetidas = stickers.filter((s) => s.userState === 'repeated');

  if (repetidas.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-gray-700">{instance.name}</h2>
      <div className="flex flex-wrap gap-2">
        {repetidas.map((s) => (
          <div key={s.id} className="flex items-center gap-1 rounded-lg border border-yellow-200 bg-yellow-50 px-2 py-1">
            <span className="text-xs font-bold text-yellow-700">#{s.number}</span>
            <span className="text-xs text-yellow-600 max-w-[80px] truncate">{s.name}</span>
            {(s.quantity ?? 1) > 1 && (
              <Badge variant="repeated">x{s.quantity}</Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RepetidasPage() {
  const { instances } = useUserAlbums();

  const hasAnyRepeated = instances.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Repetidas</h1>
        <p className="text-sm text-gray-500">Figuritas para intercambiar</p>
      </div>

      {instances.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl">🔄</span>
          <p className="mt-3 text-gray-500">Primero agrega un album desde el inicio</p>
          <Link href="/" className="mt-4 text-sm text-blue-600 hover:underline">Ir al inicio</Link>
        </div>
      ) : (
        <>
          {instances.map((inst) => (
            <InstanceRepetidas key={inst.id} instance={inst} />
          ))}
          {hasAnyRepeated && instances.every(() => true) && (
            <p className="text-center text-sm text-gray-400">
              Las figuritas marcadas como repetidas aparecen aqui
            </p>
          )}
        </>
      )}
    </div>
  );
}
