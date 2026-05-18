'use client';

import { useEffect, useState } from 'react';

interface ProgressHeaderProps {
  albumName: string;
  albumType?: string;
  owned: number;
  repeated: number;
  missing: number;
  total: number;
  progress: number;
  onRename?: (name: string) => void;
}

export function ProgressHeader({
  albumName,
  albumType,
  owned,
  repeated,
  missing,
  total,
  progress,
  onRename,
}: ProgressHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(albumName);

  useEffect(() => { setDraftName(albumName); }, [albumName]);

  const isComplete = progress >= 100;
  const canEdit = typeof onRename === 'function';

  function submitRename() {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== albumName) onRename?.(trimmed);
    setEditing(false);
  }
  function cancelRename() { setDraftName(albumName); setEditing(false); }

  const ownedPct    = total > 0 ? (owned    / total) * 100 : 0;
  const repeatedPct = total > 0 ? (repeated / total) * 100 : 0;
  const restPct = Math.max(0, 100 - ownedPct - repeatedPct);

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--bg-border)',
        borderRadius: '18px',
        overflow: 'hidden',
      }}
    >
      {/* Top thin segmented bar: owned (green) | repeated (amber) | rest (grey) */}
      <div style={{ height: '3px', display: 'flex' }}>
        {ownedPct > 0 ? (
          <div style={{ width: `${ownedPct}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
        ) : null}
        {restPct > 0 ? (
          <div style={{ width: `${restPct}%`, background: 'var(--bg-raised)' }} />
        ) : null}
      </div>

      <div style={{ padding: '14px 16px 16px' }}>

        {/* ── Row 1: name + big % ───────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            {albumType && (
              <p style={{ margin: '0 0 3px', fontSize: '10px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {albumType}
              </p>
            )}
            {editing ? (
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') cancelRename(); }}
                onBlur={submitRename}
                autoFocus
                style={{
                  fontSize: '17px', fontWeight: 800, color: 'var(--text-1)',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: '10px', padding: '7px 10px', colorScheme: 'dark',
                  outline: 'none', width: '100%', boxSizing: 'border-box',
                }}
              />
            ) : (
              <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{albumName}</span>
                {canEdit && (
                  <button
                    onClick={() => setEditing(true)}
                    type="button"
                    className="pressable"
                    style={{
                      flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: '26px', height: '26px', borderRadius: '7px',
                      border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-3)', cursor: 'pointer', padding: 0,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                  </button>
                )}
              </h1>
            )}
          </div>

          {/* Big % */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{
              display: 'block', lineHeight: 1,
              fontSize: '34px', fontWeight: 900, letterSpacing: '-0.03em',
              background: isComplete ? 'linear-gradient(135deg, #f59e0b, #fcd34d)' : 'linear-gradient(135deg, #6366f1, #06b6d4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {progress}%
            </span>
            {isComplete ? (
              <span style={{ fontSize: '8px', fontWeight: 800, color: '#fbbf24', letterSpacing: '0.14em', textTransform: 'uppercase' }}>COMPLETO</span>
            ) : (
              <span style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 500 }}>{owned}/{total}</span>
            )}
          </div>
        </div>

        {/* ── Stat pills ─────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '6px' }}>

          {/* Tengo (pegadas) */}
          <div style={{
            flex: 1, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)',
            borderRadius: '12px', padding: '9px 10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(52,211,153,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tengo</span>
            </div>
            <span style={{ display: 'block', fontSize: '22px', fontWeight: 900, color: '#34d399', lineHeight: 1, letterSpacing: '-0.02em' }}>{owned}</span>
            <span style={{ fontSize: '9px', color: 'rgba(52,211,153,0.5)', fontWeight: 500 }}>pegadas</span>
          </div>

          {/* Repetidas (a canjear) */}
          <div style={{
            flex: 1, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)',
            borderRadius: '12px', padding: '9px 10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(251,191,36,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Repet.</span>
            </div>
            <span style={{ display: 'block', fontSize: '22px', fontWeight: 900, color: '#fbbf24', lineHeight: 1, letterSpacing: '-0.02em' }}>{repeated}</span>
            <span style={{ fontSize: '9px', color: 'rgba(251,191,36,0.5)', fontWeight: 500 }}>a canjear</span>
          </div>

          {/* Faltan */}
          <div style={{
            flex: 1, background: 'var(--bg-raised)', border: '1px solid var(--bg-border)',
            borderRadius: '12px', padding: '9px 10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-3)', flexShrink: 0 }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Faltan</span>
            </div>
            <span style={{ display: 'block', fontSize: '22px', fontWeight: 900, color: 'var(--text-2)', lineHeight: 1, letterSpacing: '-0.02em' }}>{missing}</span>
            <span style={{ fontSize: '9px', color: 'var(--text-3)', fontWeight: 500 }}>de {total} total</span>
          </div>

        </div>
      </div>
    </div>
  );
}
