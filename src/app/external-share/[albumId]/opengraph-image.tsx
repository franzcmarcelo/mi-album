import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface AlbumOGData {
  albumName: string;
  ownerName: string;
  publisher: string;
  owned: number;
  repeated: number;
  total: number;
  progress: number;
}

async function fetchAlbumOGData(albumId: string): Promise<AlbumOGData | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  const [albumRes, stickersRes] = await Promise.all([
    fetch(
      `${supabaseUrl}/rest/v1/user_albums?id=eq.${albumId}&select=name,user_id,albums_catalog!inner(publisher,total_stickers)`,
      { headers }
    ),
    fetch(
      `${supabaseUrl}/rest/v1/user_stickers?user_album_id=eq.${albumId}&select=state`,
      { headers }
    ),
  ]);

  if (!albumRes.ok) return null;
  const albums = await albumRes.json() as Array<{
    name: string;
    user_id: string;
    albums_catalog: { publisher: string; total_stickers: number };
  }>;
  if (!albums.length) return null;

  const album = albums[0];
  const stickers: Array<{ state: string }> = stickersRes.ok ? await stickersRes.json() : [];
  const owned    = stickers.filter(s => s.state === 'owned').length;
  const repeated = stickers.filter(s => s.state === 'repeated').length;
  const total    = album.albums_catalog.total_stickers;
  const progress = total > 0 ? Math.round((owned / total) * 100) : 0;

  const profileRes = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${album.user_id}&select=display_name`,
    { headers }
  );
  const profiles: Array<{ display_name: string }> = profileRes.ok ? await profileRes.json() : [];
  const ownerName = profiles[0]?.display_name ?? '';

  return {
    albumName: album.name,
    ownerName,
    publisher: album.albums_catalog.publisher,
    owned,
    repeated,
    total,
    progress,
  };
}

function FallbackImage() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg, #060e22 0%, #0d1f5c 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif',
    }}>
      <span style={{ fontSize: 40, color: 'rgba(255,255,255,0.4)' }}>Mi Álbum · Copa del Mundo 2026</span>
    </div>
  );
}

export default async function OGImage({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params;

  if (!UUID_RE.test(albumId)) {
    return new ImageResponse(<FallbackImage />, { width: 1200, height: 630 });
  }

  const data = await fetchAlbumOGData(albumId);
  if (!data) {
    return new ImageResponse(<FallbackImage />, { width: 1200, height: 630 });
  }

  const { albumName, ownerName, publisher, owned, repeated, total, progress } = data;
  const isComplete = progress >= 100;

  return new ImageResponse(
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg, #060e22 0%, #0d1f5c 55%, #060e22 100%)',
      display: 'flex', flexDirection: 'column',
      padding: '56px 80px',
      fontFamily: 'sans-serif',
      position: 'relative',
    }}>
      {/* Top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
        background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
        display: 'flex',
      }} />

      {/* Publisher badge */}
      <div style={{ display: 'flex', marginBottom: '28px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          borderRadius: '10px', padding: '6px 16px',
          fontSize: '15px', fontWeight: 700, color: 'white',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          display: 'flex',
        }}>
          {publisher} · Copa del Mundo 2026
        </div>
        {isComplete && (
          <div style={{
            marginLeft: '12px',
            background: 'linear-gradient(135deg, #f59e0b, #fcd34d)',
            borderRadius: '10px', padding: '6px 16px',
            fontSize: '15px', fontWeight: 700, color: '#1a0a00',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            display: 'flex',
          }}>
            ✦ ÁLBUM COMPLETO
          </div>
        )}
      </div>

      {/* Album name */}
      <div style={{
        fontSize: albumName.length > 30 ? '52px' : '64px',
        fontWeight: 900, color: 'white',
        lineHeight: 1.1, letterSpacing: '-0.02em',
        maxWidth: '900px', display: 'flex',
      }}>
        {albumName}
      </div>

      {/* Owner */}
      {ownerName ? (
        <div style={{ fontSize: '24px', color: 'rgba(255,255,255,0.4)', marginTop: '10px', display: 'flex' }}>
          de {ownerName}
        </div>
      ) : null}

      {/* Bottom area: progress + stats */}
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', gap: '14px' }}>
        {/* Progress bar */}
        <div style={{
          height: '10px', borderRadius: '99px',
          background: 'rgba(255,255,255,0.07)',
          width: '100%', display: 'flex', overflow: 'hidden',
        }}>
          {owned > 0 && (
            <div style={{
              width: `${(owned / total) * 100}%`,
              background: 'linear-gradient(90deg, #059669, #34d399)',
              borderRadius: '99px',
              display: 'flex',
            }} />
          )}
          {repeated > 0 && (
            <div style={{
              width: `${(repeated / total) * 100}%`,
              background: 'linear-gradient(90deg, #d97706, #fbbf24)',
              borderRadius: '99px',
              display: 'flex',
            }} />
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Big % */}
          <div style={{
            fontSize: '88px', fontWeight: 900,
            letterSpacing: '-0.04em', lineHeight: 1,
            color: isComplete ? '#fbbf24' : 'transparent',
            backgroundImage: isComplete
              ? undefined
              : 'linear-gradient(135deg, #6366f1, #06b6d4)',
            WebkitBackgroundClip: isComplete ? undefined : 'text',
            display: 'flex',
          }}>
            {progress}%
          </div>

          {/* Stat chips */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { value: owned,   label: 'TENGO',   color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
              { value: repeated, label: 'REPET.',  color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
              { value: total - owned - repeated, label: 'FALTAN', color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)' },
            ].map(({ value, label, color, bg, border }) => (
              <div key={label} style={{
                display: 'flex', flexDirection: 'column',
                background: bg, border: `1.5px solid ${border}`,
                borderRadius: '14px', padding: '14px 22px',
              }}>
                <span style={{ fontSize: '36px', fontWeight: 900, color, lineHeight: 1, display: 'flex' }}>{value}</span>
                <span style={{ fontSize: '12px', color, opacity: 0.65, fontWeight: 700, letterSpacing: '0.1em', display: 'flex' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Branding */}
          <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: 'rgba(255,255,255,0.65)', display: 'flex' }}>Mi Álbum ⚽</span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em', display: 'flex' }}>
              mi-album-phi.vercel.app
            </span>
          </div>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
