'use client';

import { copy, list, remove } from 'aws-amplify/storage';
import { adminClient, assertOk, importMedia, type ImportResult } from './admin-client';
import { folderFor, isExternal, isStoragePath, projectFolder, safeFileName } from './media';
import { projectMedia, type Project } from './types';

type MediaFields = Pick<Project, 'media' | 'coverImage' | 'datasheet'>;

/** Todas las referencias a archivos de un proyecto (portada, ficha PDF, medios y pósters), sin repetir. */
function fileRefs(p: MediaFields): string[] {
  const refs = [p.coverImage, p.datasheet, ...projectMedia(p).flatMap((m) => [m.src, m.poster])];
  return [...new Set(refs.filter((r): r is string => !!r))];
}

/** Archivos que todavía no están en la carpeta del proyecto (externos o en otra carpeta del bucket). */
export function pendingFiles(p: MediaFields & Pick<Project, 'slug'>): string[] {
  const folder = projectFolder(p.slug);
  return fileRefs(p).filter((r) => isExternal(r) || !r.startsWith(folder));
}

/** Reemplaza rutas de archivos en el proyecto según un mapa origen → destino. */
export function remapFiles(p: MediaFields, map: Map<string, string>) {
  const r = (s?: string | null) => (s ? map.get(s) ?? s : null);
  return {
    coverImage: r(p.coverImage),
    datasheet: r(p.datasheet),
    media: projectMedia(p).map((m) => ({
      kind: m.kind,
      src: r(m.src)!,
      poster: r(m.poster),
      caption: m.caption ?? null,
    })),
  };
}

function fileNameFromUrl(src: string): string {
  const last = src.split(/[?#]/)[0].split('/').pop() ?? 'archivo';
  try {
    return decodeURIComponent(last.replace(/\+/g, ' '));
  } catch {
    return last;
  }
}

/** Ruta destino dentro de la carpeta del proyecto, evitando nombres repetidos. */
function destinationFor(slug: string, src: string, used: Set<string>): string {
  const name = fileNameFromUrl(src);
  const base = `${projectFolder(slug)}${folderFor('', name)}/`;
  let file = safeFileName(name);
  for (let i = 2; used.has(base + file); i++) file = `${i}-${safeFileName(name)}`;
  used.add(base + file);
  return base + file;
}

/**
 * Deja todos los archivos del proyecto dentro de proyectos/<slug>/:
 * copia los externos (sitio anterior, /public) con la función migrate-media y
 * los del bucket que estén en otra carpeta con copy(). Luego actualiza el proyecto.
 */
export async function organizeProject(project: Project, onProgress?: (done: number, total: number) => void) {
  const pending = pendingFiles(project);
  const used = new Set<string>();
  const map = new Map<string, string>();
  const failed: ImportResult[] = [];
  const oldBucketPaths: string[] = [];
  let done = 0;
  onProgress?.(0, pending.length);

  const external = pending.filter((src) => isExternal(src));
  const internal = pending.filter((src) => isStoragePath(src));

  // Externos: en lotes pequeños para no exceder el tiempo de la función con videos pesados.
  for (let i = 0; i < external.length; i += 3) {
    const batch = external.slice(i, i + 3).map((src) => ({
      src,
      url: src.startsWith('/') ? `${window.location.origin}${src}` : src,
      path: destinationFor(project.slug, src, used),
    }));
    const results = await importMedia(batch.map(({ url, path }) => ({ url, path })));
    results.forEach((res, j) => {
      if (res.ok) map.set(batch[j].src, batch[j].path);
      else failed.push(res);
    });
    done += batch.length;
    onProgress?.(done, pending.length);
  }

  // Del mismo bucket pero en otra carpeta (por ejemplo, tras renombrar el proyecto).
  for (const src of internal) {
    const path = destinationFor(project.slug, src, used);
    try {
      await copy({ source: { path: src }, destination: { path } });
      map.set(src, path);
      oldBucketPaths.push(src);
    } catch (err) {
      failed.push({ url: src, path, ok: false, error: err instanceof Error ? err.message : String(err) });
    }
    onProgress?.(++done, pending.length);
  }

  if (map.size) {
    assertOk(await adminClient.models.Project.update({ id: project.id, ...remapFiles(project, map) }));
    await Promise.allSettled(oldBucketPaths.map((path) => remove({ path })));
  }
  return { moved: map.size, failed };
}

/** Copia todo el contenido de proyectos/<oldSlug>/ a proyectos/<newSlug>/ y devuelve el mapa de rutas. */
export async function copyFolder(oldSlug: string, newSlug: string): Promise<Map<string, string>> {
  const from = projectFolder(oldSlug);
  const to = projectFolder(newSlug);
  const { items } = await list({ path: from, options: { listAll: true } });
  const map = new Map<string, string>();
  for (const item of items) {
    const dest = to + item.path.slice(from.length);
    await copy({ source: { path: item.path }, destination: { path: dest } });
    map.set(item.path, dest);
  }
  return map;
}

/** Elimina todos los archivos de la carpeta de un proyecto. */
export async function removeFolder(slug: string): Promise<void> {
  const { items } = await list({ path: projectFolder(slug), options: { listAll: true } });
  await Promise.allSettled(items.map((item) => remove({ path: item.path })));
}

export async function removePaths(paths: string[]): Promise<void> {
  await Promise.allSettled(paths.map((path) => remove({ path })));
}
