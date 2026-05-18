'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface BatchInputProps {
  totalStickers: number;
  onAdd: (numbers: number[]) => void;
}

function parseInput(raw: string, max: number): number[] {
  const parts = raw.split(/[,;\s]+/);
  const result = new Set<number>();

  for (const part of parts) {
    const range = part.match(/^(\d+)-(\d+)$/);
    if (range) {
      const from = parseInt(range[1]);
      const to = parseInt(range[2]);
      for (let i = from; i <= to && i <= max; i++) result.add(i);
    } else {
      const n = parseInt(part);
      if (!isNaN(n) && n >= 1 && n <= max) result.add(n);
    }
  }

  return [...result].sort((a, b) => a - b);
}

export function BatchInput({ totalStickers, onAdd }: BatchInputProps) {
  const [value, setValue] = useState('');
  const [preview, setPreview] = useState<number[]>([]);

  function handleChange(v: string) {
    setValue(v);
    setPreview(parseInput(v, totalStickers));
  }

  function handleSubmit() {
    if (preview.length === 0) return;
    onAdd(preview);
    setValue('');
    setPreview([]);
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ingresa numeros (ej: 12, 45, 78-90)
        </label>
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="12, 45, 78-90, 120"
          rows={3}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {preview.length > 0 && (
        <p className="text-sm text-gray-500">
          {preview.length} figura{preview.length !== 1 ? 's' : ''}: {preview.slice(0, 10).join(', ')}
          {preview.length > 10 ? `... +${preview.length - 10} mas` : ''}
        </p>
      )}

      <Button onClick={handleSubmit} disabled={preview.length === 0} className="w-full">
        Agregar {preview.length > 0 ? `(${preview.length})` : ''}
      </Button>
    </div>
  );
}
