'use client';

/**
 * useSession
 * Devuelve la sesión activa del usuario (Supabase Auth).
 *
 * Usa TanStack Query con queryKey ['session'] para que múltiples consumidores
 * compartan una sola petición de red. La suscripción a onAuthStateChange vive
 * en AuthSync (providers.tsx) — un único listener para toda la app.
 *
 * Consumidores:
 *   - app/(app)/page.tsx            (DashboardPage)
 *   - app/(app)/album/[albumId]/page.tsx
 *   - app/(app)/HeaderActions.tsx
 *   - app/(app)/NavMenu.tsx
 *   - app/share/[token]/page.tsx
 */

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

async function fetchUser() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export function useSession() {
  const { data: user = null, isLoading: loading } = useQuery({
    queryKey: ['session'],
    queryFn: fetchUser,
    staleTime: 60_000,
    retry: false,
  });

  return { user, loading };
}
