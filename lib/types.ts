import type { Schema } from '@/amplify/data/resource';

export type Project = Schema['Project']['type'];
export type MediaItem = NonNullable<NonNullable<Project['media']>[number]>;

export function projectMedia(p: Pick<Project, 'media'>): MediaItem[] {
  return (p.media ?? []).filter((m): m is MediaItem => !!m && !!m.src);
}

export type SpecItem = NonNullable<NonNullable<Project['specs']>[number]>;
export type SpecGroup = { name: string; items: SpecItem[] };

/** Especificaciones agrupadas por sección, respetando el orden en que fueron ingresadas. */
export function specGroups(p: Pick<Project, 'specs'>, limit = Infinity): SpecGroup[] {
  const groups: SpecGroup[] = [];
  let count = 0;
  for (const s of p.specs ?? []) {
    if (!s?.label || !s.value || count >= limit) continue;
    const name = s.group?.trim() || 'General';
    let g = groups.find((x) => x.name === name);
    if (!g) groups.push((g = { name, items: [] }));
    g.items.push(s);
    count++;
  }
  return groups;
}

/** Texto editable "# Grupo / Etiqueta: Valor" ⇄ lista de especificaciones (usado en el admin). */
export function specsToText(specs?: (SpecItem | null | undefined)[] | null): string {
  const lines: string[] = [];
  let group: string | null | undefined;
  for (const s of specs ?? []) {
    if (!s) continue;
    if (s.group && s.group !== group) {
      if (lines.length) lines.push('');
      lines.push(`# ${s.group}`);
    }
    group = s.group;
    lines.push(`${s.label}: ${s.value}`);
  }
  return lines.join('\n');
}

export function textToSpecs(text: string): { group: string | null; label: string; value: string }[] {
  const out: { group: string | null; label: string; value: string }[] = [];
  let group: string | null = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('#')) {
      group = line.replace(/^#+/, '').trim() || null;
      continue;
    }
    const i = line.indexOf(':');
    if (i <= 0) continue;
    const label = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    if (label && value) out.push({ group, label, value });
  }
  return out;
}

export function cleanList(list?: (string | null)[] | null): string[] {
  return (list ?? []).filter((s): s is string => !!s && s.trim().length > 0);
}

export function byOrder(a: Project, b: Project): number {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.title.localeCompare(b.title);
}
