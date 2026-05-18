'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { AlbumCatalog, UserAlbumInstance } from '@/types';

export const AVAILABLE_ALBUMS: AlbumCatalog[] = [
  { id: 'panini-2024', slug: 'panini-2024', name: 'Copa del Mundo 2026', year: 2026, publisher: 'Panini', totalStickers: 145 },
  { id: '3reyes-2024', slug: '3reyes-2024', name: 'Copa del Mundo 2026', year: 2026, publisher: '3 Reyes', totalStickers: 150 },
];

async function fetchInstances(): Promise<UserAlbumInstance[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_albums')
    .select('id, name, status, started_at, albums_catalog!inner(slug)')
    .neq('status', 'archived')
    .order('started_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: (row.albums_catalog as unknown as { slug: string }).slug,
    name: row.name,
    createdAt: row.started_at,
  }));
}

async function createInstance(slug: string, name: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data: catalog } = await supabase
    .from('albums_catalog')
    .select('id')
    .eq('slug', slug)
    .single();

  if (!catalog) throw new Error(`Catálogo no encontrado: ${slug}`);

  const { error } = await supabase.from('user_albums').insert({
    user_id: user.id,
    album_catalog_id: catalog.id,
    name,
    status: 'active',
  });

  if (error) throw error;
}

async function archiveInstance(instanceId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('user_albums')
    .update({ status: 'archived' })
    .eq('id', instanceId);
  if (error) throw error;
}

async function renameInstance(instanceId: string, name: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('user_albums')
    .update({ name })
    .eq('id', instanceId);
  if (error) throw error;
}

export function useUserAlbums(user: User | null) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['user-albums', user?.id],
    queryFn: fetchInstances,
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: ({ slug, name }: { slug: string; name: string }) => createInstance(slug, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-albums', user?.id] }),
    onError: (err) => console.error('[createAlbum]', err),
  });

  const archiveMutation = useMutation({
    mutationFn: (instanceId: string) => archiveInstance(instanceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-albums', user?.id] }),
  });

  const renameMutation = useMutation({
    mutationFn: ({ instanceId, name }: { instanceId: string; name: string }) =>
      renameInstance(instanceId, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-albums', user?.id] }),
  });

  const instances = query.data ?? [];
  const isLoading = !!user && query.isLoading;

  const addAlbum = (slug: string, name: string) => createMutation.mutate({ slug, name });
  const removeAlbum = (instanceId: string) => archiveMutation.mutate(instanceId);
  const renameAlbum = (instanceId: string, name: string) =>
    renameMutation.mutate({ instanceId, name });

  const getInstanceById = useCallback(
    (instanceId: string) => instances.find((i) => i.id === instanceId) ?? null,
    [instances]
  );

  return { instances, isLoading, addAlbum, removeAlbum, renameAlbum, getInstanceById };
}
