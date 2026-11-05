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

/**
 * Los resultados de las funciones (tipo AWSJSON) llegan como texto JSON, a veces codificado
 * más de una vez; se decodifica hasta obtener el valor.
 */
function parseJson(value: unknown): unknown {
  let out = value;
  for (let i = 0; i < 3 && typeof out === 'string'; i++) {
    try {
      out = JSON.parse(out);
    } catch {
      break;
    }
  }
  return out;
}

/** Igual que parseJson, pero exige una lista (evita errores si la respuesta tiene otra forma). */
function parseList<T>(value: unknown, what: string): T[] {
  const out = parseJson(value);
  if (!Array.isArray(out)) throw new Error(`Respuesta inesperada al obtener ${what}.`);
  return out as T[];
}

// ---------- Usuarios del panel ----------

export type Role = 'ADMINS' | 'EDITORS';

export const ROLE_LABELS: Record<Role, string> = {
  ADMINS: 'Administrador',
  EDITORS: 'Editor',
};

export type PanelUser = {
  username: string;
  email: string;
  status: string;
  enabled: boolean;
  createdAt: string | null;
  role: Role | null;
};

export async function listPanelUsers(): Promise<PanelUser[]> {
  return parseList<PanelUser>(assertOk(await adminClient.queries.listUsers()), 'los usuarios');
}

export async function manageUser(args: {
  action: 'create' | 'setRole' | 'disable' | 'enable' | 'delete';
  email?: string;
  username?: string;
  role?: Role;
}): Promise<void> {
  assertOk(await adminClient.mutations.manageUser(args));
}

// ---------- Copia de archivos externos al bucket ----------

export type ImportItem = { url: string; path: string };
export type ImportResult = ImportItem & { ok: boolean; error?: string };

export async function importMedia(items: ImportItem[]): Promise<ImportResult[]> {
  const res = await adminClient.mutations.importMedia({ items: JSON.stringify(items) });
  return parseList<ImportResult>(assertOk(res), 'el resultado de la copia');
}

/** Pide al servidor regenerar las páginas públicas para que los cambios se vean al instante. */
export async function revalidateSite(): Promise<void> {
  try {
    await fetch('/api/revalidate', { method: 'POST' });
  } catch {
    // Si falla, las páginas se regeneran solas en ≤ 60 s.
  }
}
