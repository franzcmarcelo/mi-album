import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from './LogoutButton';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? null;
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
            <span className="text-xl">📚</span>
            <span>Album Digital</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/cargar" className="text-sm text-gray-500 hover:text-gray-700">Cargar</Link>
            <Link href="/repetidas" className="text-sm text-gray-500 hover:text-gray-700">Repetidas</Link>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-2 py-1">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName ?? ''}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {displayName?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                  <span className="max-w-[120px] truncate text-sm font-medium text-gray-700">
                    {displayName}
                  </span>
                </div>
                <LogoutButton />
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
    </div>
  );
}
