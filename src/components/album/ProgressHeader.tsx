interface ProgressHeaderProps {
  albumName: string;
  albumType?: string;
  owned: number;
  repeated: number;
  missing: number;
  total: number;
  progress: number;
}

export function ProgressHeader({
  albumName,
  albumType,
  owned,
  repeated,
  missing,
  total,
  progress,
}: ProgressHeaderProps) {
  const isComplete = progress >= 100;

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--bg-border)',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Gold top bar */}
      <div style={{
        height: '3px',
        background: 'var(--accent-grad-h)',
      }} />

      {/* WC diagonal stripes */}
      <div className="wc-stripes" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.35 }} />

      {/* Blue gradient accent */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: '180px',
        background: 'radial-gradient(circle at top right, rgba(29,78,216,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ padding: '16px', position: 'relative', zIndex: 1 }}>
        {/* Name + % */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <h1 style={{ color: 'var(--text-1)', fontWeight: 800, fontSize: '18px', margin: 0, letterSpacing: '-0.01em' }}>
              {albumName}
            </h1>
            {albumType && (
              <p style={{ color: 'var(--text-3)', fontSize: '12px', margin: '2px 0 0', fontWeight: 500 }}>
                {albumType}
              </p>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
            <span style={{
              display: 'block',
              fontSize: '30px',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              background: isComplete
                ? 'linear-gradient(135deg, #f59e0b, #fcd34d)'
                : 'linear-gradient(135deg, #6366f1, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {progress}%
            </span>
            {isComplete && (
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                COMPLETO
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          height: '4px', borderRadius: '99px',
          background: 'var(--bg-raised)',
          overflow: 'hidden', marginBottom: '14px',
        }}>
          <div style={{
            height: '100%', borderRadius: '99px',
            width: `${progress}%`,
            background: isComplete
              ? 'linear-gradient(90deg, #f59e0b, #fcd34d)'
              : 'var(--accent-grad-h)',
            transition: 'width 0.5s var(--ease-out)',
          }} />
        </div>

        {/* Stat chips */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {[
            { value: owned,    label: 'Tengo',     color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)' },
            { value: repeated, label: 'Repetidas', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
            { value: missing,  label: 'Faltan',    color: 'var(--text-2)', bg: 'var(--bg-raised)',   border: 'var(--bg-border)' },
            { value: total,    label: 'Total',     color: 'var(--text-3)', bg: 'transparent',       border: 'var(--bg-border)' },
          ].map(({ value, label, color, bg, border }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '10px', padding: '8px 10px' }}>
              <span style={{ display: 'block', fontSize: '20px', fontWeight: 900, color, lineHeight: 1 }}>
                {value}
              </span>
              <span style={{ fontSize: '9px', fontWeight: 700, color, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
