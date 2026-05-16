'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { AlbumCatalog, UserAlbumInstance } from '@/types';

const LOCAL_STORAGE_KEY = 'user_album_instances';

export const AVAILABLE_ALBUMS: AlbumCatalog[] = [
  { id: 'panini-2024', slug: 'panini-2024', name: 'Copa del Mundo 2026', year: 2026, publisher: 'Panini', totalStickers: 145 },
  { id: '3reyes-2024', slug: '3reyes-2024', name: 'Copa del Mundo 2026', year: 2026, publisher: '3 Reyes', totalStickers: 150 },
];

// ─── LocalStorage (no autenticado) ───────────────────────────────────────────

function loadLocalInstances(): UserAlbumInstance[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveLocalInstances(instances: UserAlbumInstance[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(instances));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Supabase (autenticado) ───────────────────────────────────────────────────

async function fetchSupabaseInstances(): Promise<UserAlbumInstance[]> {
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

async function createSupabaseInstance(slug: string, name: string): Promise<void> {
  const supabase = createClient();

  const { data: catalog } = await supabase
    .from('albums_catalog')
    .select('id')
    .eq('slug', slug)
    .single();

  if (!catalog) throw new Error(`Catálogo no encontrado: ${slug}`);

  const { error } = await supabase.from('user_albums').insert({
    album_catalog_id: catalog.id,
    name,
    status: 'active',
  });

  if (error) throw error;
}

async function archiveSupabaseInstance(instanceId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('user_albums')
    .update({ status: 'archived' })
    .eq('id', instanceId);
  if (error) throw error;
}

async function renameSupabaseInstance(instanceId: string, name: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('user_albums')
    .update({ name })
    .eq('id', instanceId);
  if (error) throw error;
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useUserAlbums(user: User | null) {
  const qc = useQueryClient();
  const isAuth = !!user;

  // --- Modo Supabase ---
  const supabaseQuery = useQuery({
    queryKey: ['user-albums', user?.id],
    queryFn: fetchSupabaseInstances,
    enabled: isAuth,
  });

  const createMutation = useMutation({
    mutationFn: ({ slug, name }: { slug: string; name: string }) =>
      createSupabaseInstance(slug, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-albums', user?.id] }),
  });

  const archiveMutation = useMutation({
    mutationFn: (instanceId: string) => archiveSupabaseInstance(instanceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-albums', user?.id] }),
  });

  const renameMutation = useMutation({
    mutationFn: ({ instanceId, name }: { instanceId: string; name: string }) =>
      renameSupabaseInstance(instanceId, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-albums', user?.id] }),
  });

  // --- Modo localStorage ---
  const [localInstances, setLocalInstances] = useState<UserAlbumInstance[]>([]);

  useEffect(() => {
    if (!isAuth) setLocalInstances(loadLocalInstances());
  }, [isAuth]);

  const addLocalAlbum = useCallback((slug: string, name: string) => {
    const next: UserAlbumInstance = {
      id: generateId(),
      slug,
      name: name.trim() || 'Mi Álbum',
      createdAt: new Date().toISOString(),
    };
    setLocalInstances((prev) => {
      const updated = [...prev, next];
      saveLocalInstances(updated);
      return updated;
    });
  }, []);

  const removeLocalAlbum = useCallback((instanceId: string) => {
    setLocalInstances((prev) => {
      const updated = prev.filter((i) => i.id !== instanceId);
      saveLocalInstances(updated);
      return updated;
    });
  }, []);

  const renameLocalAlbum = useCallback((instanceId: string, name: string) => {
    setLocalInstances((prev) => {
      const updated = prev.map((i) => (i.id === instanceId ? { ...i, name } : i));
      saveLocalInstances(updated);
      return updated;
    });
  }, []);

  // --- API unificada ---
  const instances = isAuth ? (supabaseQuery.data ?? []) : localInstances;
  const isLoading = isAuth ? supabaseQuery.isLoading : false;

  const addAlbum = isAuth
    ? (slug: string, name: string) => createMutation.mutate({ slug, name })
    : addLocalAlbum;

  const removeAlbum = isAuth
    ? (instanceId: string) => archiveMutation.mutate(instanceId)
    : removeLocalAlbum;

  const renameAlbum = isAuth
    ? (instanceId: string, name: string) => renameMutation.mutate({ instanceId, name })
    : renameLocalAlbum;

  const getInstanceById = useCallback(
    (instanceId: string) => instances.find((i) => i.id === instanceId) ?? null,
    [instances]
  );

  return { instances, isLoading, addAlbum, removeAlbum, renameAlbum, getInstanceById };
}
