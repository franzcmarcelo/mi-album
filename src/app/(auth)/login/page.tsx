import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LoginButton } from './LoginButton';

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect('/');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-sm space-y-8 rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-3xl">
            📚
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Album Digital</h1>
          <p className="mt-2 text-sm text-gray-500">Gestioná tu coleccion de figuritas</p>
        </div>

        <LoginButton />

        <p className="text-center text-xs text-gray-400">
          Tambien podes usar la app sin cuenta, tu progreso se guarda localmente.
        </p>
      </div>
    </div>
  );
}
