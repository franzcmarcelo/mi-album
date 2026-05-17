import { decodeInventory } from '@/lib/shareEncoder';
import { getSectionColor } from '@/lib/sectionColors';
import paniniData from '@/data/panini.json';
import treyesData from '@/data/treyes.json';
import { Sticker, StickerWithState } from '@/types';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  const payload = decodeInventory(token);

  if (!payload) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{ color: 'var(--text-3)', fontSize: '15px' }}>Enlace inválido o expirado</p>
      </div>
    );
  }

  const is3reyes = payload.albumSlug.startsWith('3reyes');
  const publisher = is3reyes ? '3 Reyes' : 'Panini';
  const catalog = is3reyes ? (treyesData as Sticker[]) : (paniniData as Sticker[]);

  const stickers: StickerWithState[] = catalog.map((s) => ({
    ...s,
    userState: payload.owned.includes(s.number)
      ? 'owned'
      : payload.repeated.includes(s.number)
      ? 'repeated'
      : undefined,
  }));

  const owned = stickers.filter((s) => s.userState === 'owned').length;
  const repeated = stickers.filter((s) => s.userState === 'repeated').length;
  const missing = stickers.length - owned - repeated;
  const progress = Math.round(((owned + repeated) / stickers.length) * 100);
  const isComplete = progress >= 100;
  const repetidasList = stickers.filter((s) => s.userState === 'repeated');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '16px 16px 48px' }}>
      <div style={{ margin: '0 auto', maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Header card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--bg-border)',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Gold top bar */}
          <div style={{
            height: '3px',
            background: 'var(--accent-grad-h)',
          }} />

          {/* WC stripes */}
          <div className="wc-stripes" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.3 }} />

          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: '180px',
            background: 'radial-gradient(circle at top right, rgba(29,78,216,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ padding: '16px', position: 'relative', zIndex: 1 }}>
            {/* Brand row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{
                width: '28px', height: '28px',
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', flexShrink: 0,
              }}>⚽</div>
              <div>
                <span style={{
                  fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                  background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  Álbum compartido · {publisher}
                </span>
              </div>
            </div>

            {/* Title + % */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h1 style={{ color: 'var(--text-1)', fontWeight: 800, fontSize: '18px', margin: 0, letterSpacing: '-0.01em' }}>
                  Copa del Mundo 2026
                </h1>
                {isComplete && (
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    ÁLBUM COMPLETO ✦
                  </span>
                )}
              </div>
              <span style={{
                fontSize: '30px', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, flexShrink: 0,
                background: isComplete
                  ? 'linear-gradient(135deg, #f59e0b, #fcd34d)'
                  : 'linear-gradient(135deg, #6366f1, #06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {progress}%
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: '4px', borderRadius: '99px', background: 'var(--bg-raised)', overflow: 'hidden', marginBottom: '14px' }}>
              <div style={{
                height: '100%', borderRadius: '99px', width: `${progress}%`,
                background: isComplete
                  ? 'linear-gradient(90deg, #f59e0b, #fcd34d)'
                  : 'var(--accent-grad-h)',
              }} />
            </div>

            {/* Stat chips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[
                { value: owned,    label: 'Tengo',     color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)' },
                { value: repeated, label: 'Repetidas', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
                { value: missing,  label: 'Faltan',    color: 'var(--text-2)', bg: 'var(--bg-raised)', border: 'var(--bg-border)' },
                { value: stickers.length, label: 'Total', color: 'var(--text-3)', bg: 'transparent', border: 'var(--bg-border)' },
              ].map(({ value, label, color, bg, border }) => (
                <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '10px', padding: '8px 10px' }}>
                  <span style={{ display: 'block', fontSize: '20px', fontWeight: 900, color, lineHeight: 1 }}>{value}</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Repetidas grouped by section */}
        {repetidasList.length > 0 && (() => {
          const bySection: Record<string, StickerWithState[]> = {};
          for (const s of repetidasList) {
            if (!bySection[s.section]) bySection[s.section] = [];
            bySection[s.section].push(s);
          }
          return (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--bg-border)',
              borderRadius: '16px',
              padding: '14px 16px',
            }}>
              <h2 style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: '14px', margin: '0 0 12px' }}>
                Repetidas · {repetidasList.length}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(bySection).map(([section, items]) => {
                  const c = getSectionColor(section);
                  return (
                    <div key={section}>
                      {/* Section label */}
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        marginBottom: '6px',
                      }}>
                        <div style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: c.bg, flexShrink: 0,
                        }} />
                        <span style={{
                          fontSize: '10px', fontWeight: 700,
                          letterSpacing: '0.06em', textTransform: 'uppercase',
                          color: c.bg,
                        }}>
                          {section}
                        </span>
                      </div>
                      {/* Chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {items.map((s) => (
                          <span key={s.id} style={{
                            background: `${c.bg}18`,
                            border: `1px solid ${c.bg}40`,
                            color: c.bg,
                            borderRadius: '7px',
                            padding: '3px 8px',
                            fontSize: '11px', fontWeight: 600,
                          }}>
                            #{s.number}
                            {(s.quantity ?? 1) > 1 && (
                              <span style={{ opacity: 0.7, marginLeft: '3px' }}>×{s.quantity}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Full grid */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--bg-border)',
          borderRadius: '16px',
          padding: '14px 16px',
        }}>
          <h2 style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: '14px', margin: '0 0 10px' }}>
            Todas las figuritas
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(42px, 1fr))', gap: '4px' }}>
            {stickers.map((s) => (
              <div
                key={s.id}
                title={`#${s.number} ${s.name}`}
                style={{
                  aspectRatio: '1',
                  borderRadius: '7px',
                  fontSize: '10px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: s.userState === 'owned'
                    ? 'rgba(16,185,129,0.15)'
                    : s.userState === 'repeated'
                    ? 'rgba(245,158,11,0.15)'
                    : 'var(--bg-raised)',
                  border: `1px solid ${
                    s.userState === 'owned'
                      ? 'rgba(16,185,129,0.3)'
                      : s.userState === 'repeated'
                      ? 'rgba(245,158,11,0.3)'
                      : 'var(--bg-border)'
                  }`,
                  color: s.userState === 'owned'
                    ? '#10b981'
                    : s.userState === 'repeated'
                    ? '#f59e0b'
                    : 'var(--text-3)',
                }}
              >
                {s.number}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '14px', marginTop: '12px' }}>
            {[
              { color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'Tengo' },
              { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Repetida' },
              { color: 'var(--text-3)', bg: 'var(--bg-raised)', label: 'Falta' },
            ].map(({ color, bg, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: bg, border: `1px solid ${color}` }} />
                <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-3)', margin: 0 }}>
          Creado con{' '}
          <span style={{
            fontWeight: 700,
            background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Mi Álbum
          </span>
          {' '}· Copa del Mundo 2026
        </p>
      </div>
    </div>
  );
}
