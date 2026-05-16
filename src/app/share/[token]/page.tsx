import { decodeInventory } from '@/lib/shareEncoder';
import paniniData from '@/data/panini.json';
import treyesData from '@/data/treyes.json';
import { Sticker, StickerWithState } from '@/types';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  const payload = decodeInventory(token);

  if (!payload) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Enlace invalido o expirado</p>
      </div>
    );
  }

  const catalog = payload.albumSlug.startsWith('3reyes')
    ? (treyesData as Sticker[])
    : (paniniData as Sticker[]);

  const stickers: StickerWithState[] = catalog.map((s) => ({
    ...s,
    userState: payload.owned.includes(s.number)
      ? 'owned'
      : payload.repeated.includes(s.number)
      ? 'repeated'
      : undefined,
  }));

  const owned = stickers.filter((s) => s.userState === 'owned').length;
  const repeated = stickers.filter((s) => s.userState === 'repeated').length;
  const progress = Math.round(((owned + repeated) / stickers.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">
          <p className="text-sm text-white/60">Album compartido</p>
          <h1 className="text-xl font-bold">{payload.albumSlug}</h1>
          <div className="mt-3 flex gap-4 text-sm">
            <span>{owned} tengo</span>
            <span>{repeated} repetidas</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="rounded-xl bg-white p-4">
          <h2 className="mb-3 font-semibold text-gray-700">Repetidas ({repeated})</h2>
          <div className="flex flex-wrap gap-2">
            {stickers
              .filter((s) => s.userState === 'repeated')
              .map((s) => (
                <span key={s.id} className="rounded-lg bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                  #{s.number} {s.name}
                </span>
              ))}
            {repeated === 0 && <p className="text-sm text-gray-400">Sin repetidas</p>}
          </div>
        </div>

        <div className="rounded-xl bg-white p-4">
          <h2 className="mb-3 font-semibold text-gray-700">Todas las figuritas</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] gap-1">
            {stickers.map((s) => (
              <div
                key={s.id}
                title={`#${s.number} ${s.name}`}
                className={`aspect-square rounded text-xs font-bold flex items-center justify-center ${
                  s.userState === 'owned'
                    ? 'bg-green-500 text-white'
                    : s.userState === 'repeated'
                    ? 'bg-yellow-400 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {s.number}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
