'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        background: 'rgba(255,255,255,0.08)',
        border: 'none',
        borderRadius: '10px',
        padding: '6px 12px',
        fontSize: '13px',
        fontWeight: 500,
        color: 'rgba(255,255,255,0.5)',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >
      Salir
    </button>
  );
}
