'use client';

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import type { Project } from './types';

export const adminClient = generateClient<Schema>({ authMode: 'userPool' });

export type ProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

export async function listAllProjects(): Promise<Project[]> {
  const items: Project[] = [];
  let nextToken: string | null | undefined;
  do {
    const res = await adminClient.models.Project.list({ limit: 200, nextToken });
    if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join('; '));
    items.push(...res.data);
    nextToken = res.nextToken;
  } while (nextToken);
  return items;
}

export function assertOk<T>(res: { data: T | null; errors?: { message: string }[] }): T {
  if (res.errors?.length || !res.data) {
    throw new Error(res.errors?.map((e) => e.message).join('; ') || 'Operación fallida');
  }
  return res.data;
}

/** Pide al servidor regenerar las páginas públicas para que los cambios se vean al instante. */
export async function revalidateSite(): Promise<void> {
  try {
    await fetch('/api/revalidate', { method: 'POST' });
  } catch {
    // Si falla, las páginas se regeneran solas en ≤ 60 s.
  }
}
