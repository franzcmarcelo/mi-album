'use client';

import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { WhatsAppButton } from './WhatsAppButton';
import { Button } from '@/components/ui/Button';

interface ShareModalProps {
  shareUrl: string;
  albumName: string;
}

export function ShareModal({ shareUrl, albumName }: ShareModalProps) {
  const { shareModalOpen, closeShareModal } = useUIStore();
  const [copied, setCopied] = useState(false);

  if (!shareModalOpen) return null;

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Compartir album</h2>
          <button onClick={closeShareModal} className="rounded-full p-1 hover:bg-gray-100">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2">
          <input
            readOnly
            value={shareUrl}
            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 truncate"
          />
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? 'Copiado!' : 'Copiar'}
          </Button>
        </div>

        <WhatsAppButton url={shareUrl} albumName={albumName} />
      </div>
    </div>
  );
}
