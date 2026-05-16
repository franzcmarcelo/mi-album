export interface SectionColor {
  bg: string;
  light: string;
  border: string;
}

const DEFAULT: SectionColor = { bg: '#6b7280', light: '#f9fafb', border: '#d1d5db' };

const SECTION_COLORS: Record<string, SectionColor> = {
  // --- Panini 2026 World Cup ---
  'Selecciones':          { bg: '#3b82f6', light: '#eff6ff', border: '#bfdbfe' },
  'Estrellas':            { bg: '#f59e0b', light: '#fffbeb', border: '#fde68a' },
  'Estadios':             { bg: '#64748b', light: '#f8fafc', border: '#cbd5e1' },
  'Especiales':           { bg: '#ef4444', light: '#fef2f2', border: '#fecaca' },
  'Grupo A':              { bg: '#10b981', light: '#ecfdf5', border: '#a7f3d0' },
  'Grupo B':              { bg: '#06b6d4', light: '#ecfeff', border: '#a5f3fc' },
  'Grupo C':              { bg: '#8b5cf6', light: '#f5f3ff', border: '#ddd6fe' },
  'Grupo D':              { bg: '#f97316', light: '#fff7ed', border: '#fed7aa' },
  'Grupo E':              { bg: '#ec4899', light: '#fdf2f8', border: '#fbcfe8' },
  'Grupo F':              { bg: '#14b8a6', light: '#f0fdfa', border: '#99f6e4' },
  'Grupo G':              { bg: '#a855f7', light: '#faf5ff', border: '#e9d5ff' },
  'Grupo H':              { bg: '#84cc16', light: '#f7fee7', border: '#d9f99d' },

  // --- 3 Reyes Copa Mundial ---
  'Portada':              { bg: '#2563eb', light: '#eff6ff', border: '#bfdbfe' },
  'Equipos':              { bg: '#16a34a', light: '#f0fdf4', border: '#bbf7d0' },
  'Jugadores Destacados': { bg: '#d97706', light: '#fffbeb', border: '#fde68a' },
  'Goles del Torneo':     { bg: '#dc2626', light: '#fef2f2', border: '#fecaca' },
  'Árbitros':             { bg: '#475569', light: '#f8fafc', border: '#cbd5e1' },
  'Historia':             { bg: '#9333ea', light: '#faf5ff', border: '#e9d5ff' },
  'Trofeos':              { bg: '#ca8a04', light: '#fefce8', border: '#fef08a' },
  'Estadios Locales':     { bg: '#0f766e', light: '#f0fdfa', border: '#99f6e4' },
  'Figuras Históricas':   { bg: '#c2410c', light: '#fff7ed', border: '#fed7aa' },
};

export function getSectionColor(section: string): SectionColor {
  return SECTION_COLORS[section] ?? DEFAULT;
}

const ABBREV: Record<string, string> = {
  'Selecciones': 'SELEC.',
  'Estrellas': 'ESTREL.',
  'Estadios': 'ESTAD.',
  'Especiales': 'ESPEC.',
  'Jugadores Destacados': 'JUG. DEST.',
  'Goles del Torneo': 'GOLES',
  'Estadios Locales': 'ESTAD. LOC.',
  'Figuras Históricas': 'FIG. HIST.',
};

export function abbreviateSection(section: string): string {
  return ABBREV[section] ?? section.toUpperCase();
}
