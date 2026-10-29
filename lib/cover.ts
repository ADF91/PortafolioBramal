import { mediaUrl } from './media';
import { projectMedia, type Project } from './types';

/** Portada del proyecto: la definida, o la primera imagen / póster disponible. */
export function coverUrl(p: Project): string {
  if (p.coverImage) return mediaUrl(p.coverImage);
  const media = projectMedia(p);
  const image = media.find((m) => m.kind === 'image');
  if (image) return mediaUrl(image.src);
  const poster = media.find((m) => m.poster);
  return poster ? mediaUrl(poster.poster) : '';
}

export function mediaSummary(p: Project): string {
  const media = projectMedia(p);
  const videos = media.filter((m) => m.kind === 'video').length;
  const images = media.length - videos;
  const parts: string[] = [];
  if (videos) parts.push(`${videos} ${videos === 1 ? 'video' : 'videos'}`);
  if (images) parts.push(`${images} ${images === 1 ? 'imagen' : 'imágenes'}`);
  return parts.join(' · ');
}
