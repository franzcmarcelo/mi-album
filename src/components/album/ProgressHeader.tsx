interface ProgressHeaderProps {
  albumName: string;
  albumType?: string;
  owned: number;
  repeated: number;
  missing: number;
  total: number;
  progress: number;
}

export function ProgressHeader({ albumName, albumType, owned, repeated, missing, total, progress }: ProgressHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{albumName}</h1>
          {albumType && <p className="text-sm text-gray-400">{albumType}</p>}
        </div>
        <span className="text-2xl font-bold text-blue-600">{progress}%</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex gap-4 text-sm">
        <span className="text-green-600 font-medium">{owned} tengo</span>
        <span className="text-yellow-600 font-medium">{repeated} repetidas</span>
        <span className="text-gray-500">{missing} faltan</span>
        <span className="text-gray-400">/ {total}</span>
      </div>
    </div>
  );
}
