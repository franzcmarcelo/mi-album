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

  useEffect(() => {
    setDraftName(albumName);
  }, [albumName]);

  const isComplete = progress >= 100;
  const canEdit = typeof onRename === 'function';

  function submitRename() {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== albumName) {
      onRename?.(trimmed);
    }
    setEditing(false);
  }

  function cancelRename() {
    setDraftName(albumName);
    setEditing(false);
  }

  const stats = [
    { value: owned,    label: 'Tengo',    color: '#34d399',          bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)' },
    { value: repeated, label: 'Repet.',   color: '#fbbf24',          bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)' },
    { value: missing,  label: 'Faltan',   color: 'var(--text-2)',    bg: 'var(--bg-raised)',      border: 'var(--bg-border)' },
    { value: total,    label: 'Total',    color: 'var(--text-3)',    bg: 'transparent',           border: 'var(--bg-border)' },
  ];

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
      {/* Accent top bar */}
      <div style={{ height: '3px', background: 'var(--accent-grad-h)' }} />

      {/* WC diagonal stripes */}
      <div className="wc-stripes" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.35 }} />

      {/* Blue gradient accent */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: '180px',
        background: 'radial-gradient(circle at top right, rgba(29,78,216,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ padding: '16px', position: 'relative', zIndex: 1 }}>
        {/* Name + percentage */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '12px' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {editing ? (
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitRename();
                    if (e.key === 'Escape') cancelRename();
                  }}
                  onBlur={submitRename}
                  autoFocus
                  style={{
                    fontSize: '18px', fontWeight: 800, color: 'var(--text-1)',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: '10px', padding: '8px 10px', minWidth: '220px', colorScheme: 'dark',
                    outline: 'none', width: '100%', maxWidth: '100%',
                  }}
                />
              ) : (
                <h1 style={{ color: 'var(--text-1)', fontWeight: 800, fontSize: '18px', margin: 0, letterSpacing: '-0.01em', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {albumName}
                  {canEdit && (
                    <button
                      onClick={() => setEditing(true)}
                      className="pressable"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'var(--text-1)',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      type="button"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </button>
                  )}
                </h1>
              )}
            </div>
            {albumType && (
              <p style={{ color: 'var(--text-3)', fontSize: '12px', margin: '8px 0 0', fontWeight: 500 }}>
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

        {/* Stat chips */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
          {stats.map(({ value, label, color, bg, border }) => (
            <div key={label} style={{ flex: 1, background: bg, border: `1px solid ${border}`, borderRadius: '10px', padding: '8px 10px' }}>
              <span style={{ display: 'block', fontSize: '20px', fontWeight: 900, color, lineHeight: 1 }}>
                {value}
              </span>
              <span style={{ fontSize: '9px', fontWeight: 700, color, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{
          height: '4px', borderRadius: '99px',
          background: 'var(--bg-raised)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: '99px',
            width: `${Math.min(progress, 100)}%`,
            background: isComplete
              ? 'linear-gradient(90deg, #f59e0b, #fcd34d)'
              : 'var(--accent-grad)',
            transition: 'width 0.5s var(--ease-out)',
          }} />
        </div>
      </div>
    </div>
  );
}
