import 'server-only';
import { publicDataClient, runWithAmplifyServerContext } from './amplify-server';
import { seedProjects } from './seed-data';
import { byOrder, type Project } from './types';

async function listAll(): Promise<Project[]> {
  return runWithAmplifyServerContext({
    nextServerContext: null,
    operation: async (ctx) => {
      const items: Project[] = [];
      let nextToken: string | null | undefined;
      do {
        const res = await publicDataClient.models.Project.list(ctx, { limit: 200, nextToken });
        if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join('; '));
        items.push(...res.data);
        nextToken = res.nextToken;
      } while (nextToken);
      return items;
    },
  });
}

/** Proyectos publicados, ordenados. Si la API no responde se devuelve una lista vacía. */
export async function getPublishedProjects(): Promise<Project[]> {
  try {
    return (await listAll()).filter((p) => p.published !== false).sort(byOrder);
  } catch (err) {
    console.error('[projects] no se pudo leer la API:', err);
    // En desarrollo sin backend desplegado se muestran los proyectos de ejemplo.
    if (process.env.NODE_ENV === 'development') {
      return seedProjects.map((p, i) => ({
        ...p,
        id: p.slug,
        published: true,
        featured: !!p.featured,
        sortOrder: i * 10,
        createdAt: '',
        updatedAt: '',
      })) as Project[];
    }
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const all = await getPublishedProjects();
  return all.find((p) => p.slug === slug) ?? null;
}
