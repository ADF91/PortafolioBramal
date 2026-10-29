import type { CSSProperties } from 'react';

export type Swatch = { bg: string; soft: string; ink: string };

/** Tonos tierra apagados que armonizan con el naranjo y el grafito del logo. */
export const palette = {
  slate: { bg: '#4f6d8a', soft: '#eef2f6', ink: '#FFFFFF' },
  sage: { bg: '#5e7d6a', soft: '#eef3ef', ink: '#FFFFFF' },
  terracotta: { bg: '#b0503a', soft: '#f8eeeb', ink: '#FFFFFF' },
  ochre: { bg: '#a87613', soft: '#f8f1e2', ink: '#FFFFFF' },
  plum: { bg: '#6d5a7a', soft: '#f2eff5', ink: '#FFFFFF' },
  steel: { bg: '#59636e', soft: '#f0f2f4', ink: '#FFFFFF' },
} satisfies Record<string, Swatch>;

const order: Swatch[] = [palette.slate, palette.sage, palette.terracotta, palette.ochre, palette.plum, palette.steel];

const known: Record<string, Swatch> = {
  movilidad: palette.sage,
  'seguridad vial': palette.terracotta,
  'seguridad ciudadana': palette.slate,
  'gestion de transito': palette.ochre,
};

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Color estable para una categoría (las nuevas categorías reciben uno según su nombre). */
export function categoryColor(category?: string | null): Swatch {
  if (!category) return palette.steel;
  const key = normalize(category);
  if (known[key]) return known[key];
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return order[hash % order.length];
}

/** Variables CSS --c, --c-soft y --c-ink para acentuar un componente con el color de su categoría. */
export function colorVars(category?: string | null): CSSProperties {
  const c = categoryColor(category);
  return { '--c': c.bg, '--c-soft': c.soft, '--c-ink': c.ink } as CSSProperties;
}
