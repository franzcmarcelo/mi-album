'use client';

/**
 * Encabezado de sección unificado para la vista de editar y la vista de resumen.
 *
 * Estructura:  • NOMBRE ────────────────── [X/Y]
 *
 * - showProgress=true  → la raya es una barra de progreso (filtro "Todas")
 * - showProgress=false → la raya es un simple divisor (filtros faltantes/repetidas)
 * - showCount=false    → oculta el conteo al final (filtros faltantes/repetidas)
 */
export function SectionHeader({
  section,
  color,
  collected,
  total,
  showProgress = true,
  showCount = true,
}: {
  section: string;
  color: string;
  collected: number;
  total: number;
  showProgress?: boolean;
  showCount?: boolean;
}) {
  // El indicador de completado solo aplica cuando se muestra la barra de progreso (vista "Todas")
  const isComplete = showProgress && total > 0 && collected === total;
  const pct        = total > 0 ? (collected / total) * 100 : 0;
  const accent     = isComplete ? '#10b981' : color;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Punto de color */}
      <div style={{
        width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
        background: accent, transition: 'background 300ms',
      }} />

      {/* Nombre de sección */}
      <span style={{
        fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em',
        textTransform: 'uppercase', flexShrink: 0,
        color: accent, transition: 'color 300ms',
      }}>
        {section}{isComplete ? ' ✓' : ''}
      </span>

      {/* Raya / barra de progreso */}
      <div style={{
        flex: 1,
        height: showProgress ? '2px' : '1px',
        borderRadius: '99px',
        background: 'var(--bg-raised)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {showProgress && collected > 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            width: `${pct}%`,
            background: isComplete
              ? 'linear-gradient(90deg,#059669,#34d399)'
              : accent,
            borderRadius: '99px',
            transition: 'width 0.4s ease, background 300ms',
          }} />
        )}
      </div>

      {/* Conteo:
          - Vista "Todas": X/Y (colectados sobre total)
          - Otras vistas:  solo el número de ítems en la sección */}
      {showCount && (
        <span style={{
          fontSize: '10px', flexShrink: 0,
          color: isComplete ? '#10b981' : 'var(--text-3)',
          transition: 'color 300ms',
        }}>
          {showProgress ? `${collected}/${total}` : total}
        </span>
      )}
    </div>
  );
}
