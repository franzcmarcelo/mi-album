'use client';

import { useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * AuthSync — suscripción global única a onAuthStateChange.
 * Se monta UNA sola vez en el árbol (dentro de Providers).
 * Invalida ['session'] cuando la sesión cambia para que todos los
 * consumidores de useSession reciban el nuevo valor sin peticiones extra.
 */
function AuthSync() {
  const qc = useQueryClient();

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      qc.invalidateQueries({ queryKey: ['session'] });
    });
    return () => subscription.unsubscribe();
  }, [qc]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      {children}
    </QueryClientProvider>
  );
}
