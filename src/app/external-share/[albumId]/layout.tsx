import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BASE_URL = 'https://mi-album-phi.vercel.app';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ albumId: string }>;
}): Promise<Metadata> {
  const { albumId } = await params;

  if (!UUID_RE.test(albumId)) {
    return { title: 'Álbum no encontrado', robots: { index: false, follow: false } };
  }

  try {
    const supabase = await createClient();

    const { data: albumRow, error } = await supabase
      .from('user_albums')
      .select('name, user_id, albums_catalog!inner(publisher, slug)')
      .eq('id', albumId)
      .single();

    if (error || !albumRow) {
      return { title: 'Álbum no encontrado', robots: { index: false, follow: false } };
    }

    const albumName = albumRow.name as string;
    const catalog = albumRow.albums_catalog as unknown as { publisher: string; slug: string };
    const publisher = catalog.publisher ?? 'Panini';

    const { data: profileRow } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', albumRow.user_id)
      .maybeSingle();
    const ownerName = profileRow?.display_name ?? '';

    const title = `${albumName} — ${publisher} Copa del Mundo 2026`;
    const description = ownerName
      ? `El álbum de ${ownerName}: "${albumName}" (${publisher} · Copa del Mundo 2026). Vista de solo lectura.`
      : `Álbum "${albumName}" de ${publisher} · Copa del Mundo 2026. Vista de solo lectura.`;
    const ogImage = `${BASE_URL}/external-share/${albumId}/opengraph-image`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/external-share/${albumId}`,
        type: 'website',
        images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
      // Las páginas de external-share no se indexan (ya manejado por X-Robots-Tag en proxy.ts)
      robots: { index: false, follow: false },
    };
  } catch {
    return { title: 'Mi Álbum — Copa del Mundo 2026', robots: { index: false, follow: false } };
  }
}

export default function ExternalShareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
