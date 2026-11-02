import outputs from '@/amplify_outputs.json';

const base: string =
  (outputs as { custom?: { mediaBaseUrl?: string } }).custom?.mediaBaseUrl ?? '';

/** Raíz del bucket donde cada proyecto tiene su carpeta. */
export const PROJECTS_ROOT = 'proyectos/';

/** Convierte un `src` guardado (URL absoluta o ruta del bucket) en una URL pública. */
export function mediaUrl(src?: string | null): string {
  if (!src) return '';
  if (/^https?:\/\//i.test(src) || src.startsWith('/')) return src;
  return `${base}/${src.replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/')}`;
}

/** Carpeta del proyecto en el bucket: proyectos/<slug>/ */
export function projectFolder(slug: string): string {
  return `${PROJECTS_ROOT}${slug}/`;
}

export type MediaFolder = 'videos' | 'imagenes' | 'fichas';

/** Subcarpeta según el tipo de archivo (por MIME o, si no hay, por extensión). */
export function folderFor(type: string, name = ''): MediaFolder {
  if (type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(name)) return 'videos';
  if (type === 'application/pdf' || /\.pdf$/i.test(name)) return 'fichas';
  return 'imagenes';
}

/** Nombre de archivo normalizado, conservando la extensión. */
export function safeFileName(name: string): string {
  const dot = name.lastIndexOf('.');
  const ext = dot > 0 ? name.slice(dot).toLowerCase().replace(/[^.a-z0-9]/g, '') : '';
  const stem = slugify(dot > 0 ? name.slice(0, dot) : name) || 'archivo';
  return `${stem}${ext}`;
}

/** Ruta en S3 para un archivo nuevo: proyectos/<slug>/<videos|imagenes|fichas>/<marca-de-tiempo>-<nombre>. */
export function uploadPath(slug: string, file: File): string {
  return `${projectFolder(slug)}${folderFor(file.type, file.name)}/${Date.now()}-${safeFileName(file.name)}`;
}

export function isStoragePath(src?: string | null): src is string {
  return !!src && src.startsWith(PROJECTS_ROOT);
}

/** Archivo alojado fuera del bucket del portafolio (sitio anterior o carpeta /public). */
export function isExternal(src?: string | null): boolean {
  return !!src && !isStoragePath(src);
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
