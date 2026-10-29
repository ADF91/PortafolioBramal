import outputs from '@/amplify_outputs.json';

const base: string =
  (outputs as { custom?: { mediaBaseUrl?: string } }).custom?.mediaBaseUrl ?? '';

/** Convierte un `src` guardado (URL absoluta o ruta del bucket) en una URL pública. */
export function mediaUrl(src?: string | null): string {
  if (!src) return '';
  if (/^https?:\/\//i.test(src) || src.startsWith('/')) return src;
  return `${base}/${src.replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/')}`;
}

/** Ruta en S3 para un archivo nuevo, con nombre normalizado. */
export function uploadPath(folder: string, file: File): string {
  const dot = file.name.lastIndexOf('.');
  const ext = dot > 0 ? file.name.slice(dot).toLowerCase() : '';
  const name = slugify(dot > 0 ? file.name.slice(0, dot) : file.name) || 'archivo';
  return `projects/${folder}/${Date.now()}-${name}${ext}`;
}

export function isStoragePath(src?: string | null): src is string {
  return !!src && src.startsWith('projects/');
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
