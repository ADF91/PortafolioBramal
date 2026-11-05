import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Schema } from '../../data/resource';

const s3 = new S3Client();
const Bucket = process.env.MEDIA_BUCKET!;

type Item = { url: string; path: string };
type Result = Item & { ok: boolean; size?: number; error?: string };

function parseItems(raw: unknown): Item[] {
  const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!Array.isArray(value)) throw new Error('items debe ser una lista.');
  return value.map((v) => ({ url: String(v?.url ?? ''), path: String(v?.path ?? '') }));
}

async function copyOne({ url, path }: Item): Promise<Result> {
  if (!/^https:\/\//i.test(url)) return { url, path, ok: false, error: 'Sólo se permiten URL https.' };
  if (!path.startsWith('proyectos/') || path.includes('..')) {
    return { url, path, ok: false, error: 'Ruta de destino inválida.' };
  }
  try {
    const res = await fetch(url);
    if (!res.ok) return { url, path, ok: false, error: `HTTP ${res.status}` };
    const body = Buffer.from(await res.arrayBuffer());
    await s3.send(
      new PutObjectCommand({
        Bucket,
        Key: path,
        Body: body,
        ContentType: res.headers.get('content-type') ?? undefined,
      }),
    );
    return { url, path, ok: true, size: body.length };
  } catch (err) {
    return { url, path, ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export const handler: Schema['importMedia']['functionHandler'] = async (event) => {
  const items = parseItems(event.arguments.items);
  const results: Result[] = [];
  // De a dos archivos en paralelo: suficiente velocidad sin agotar memoria con videos grandes.
  for (let i = 0; i < items.length; i += 2) {
    results.push(...(await Promise.all(items.slice(i, i + 2).map(copyOne))));
  }
  return results;
};
