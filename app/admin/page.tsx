'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { remove } from 'aws-amplify/storage';
import { adminClient, assertOk, listAllProjects, revalidateSite } from '@/lib/admin-client';
import { colorVars } from '@/lib/colors';
import { coverUrl } from '@/lib/cover';
import { isStoragePath } from '@/lib/media';
import { seedProjects } from '@/lib/seed-data';
import { byOrder, projectMedia, type Project } from '@/lib/types';

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      setProjects((await listAllProjects()).sort(byOrder));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setProjects([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(action: () => Promise<void>, ok?: string) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await action();
      await revalidateSite();
      await load();
      if (ok) setNotice(ok);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const toggle = (p: Project, field: 'published' | 'featured') =>
    run(async () => {
      const value = field === 'published' ? p.published === false : !p.featured;
      assertOk(await adminClient.models.Project.update({ id: p.id, [field]: value }));
    });

  const move = (index: number, delta: -1 | 1) =>
    run(async () => {
      if (!projects) return;
      const list = [...projects];
      const target = index + delta;
      [list[index], list[target]] = [list[target], list[index]];
      // Renumera todo el listado para que el orden sea estable.
      await Promise.all(
        list.map((p, i) =>
          (p.sortOrder ?? 0) === i * 10
            ? null
            : adminClient.models.Project.update({ id: p.id, sortOrder: i * 10 }).then(assertOk),
        ),
      );
    });

  const destroy = (p: Project) => {
    if (!confirm(`¿Eliminar "${p.title}"? Esta acción no se puede deshacer.`)) return;
    run(async () => {
      assertOk(await adminClient.models.Project.delete({ id: p.id }));
      const paths = new Set<string>();
      for (const m of projectMedia(p)) {
        if (isStoragePath(m.src)) paths.add(m.src);
        if (isStoragePath(m.poster)) paths.add(m.poster);
      }
      if (isStoragePath(p.coverImage)) paths.add(p.coverImage);
      if (isStoragePath(p.datasheet)) paths.add(p.datasheet);
      await Promise.allSettled([...paths].map((path) => remove({ path })));
    }, 'Proyecto eliminado.');
  };

  const importSeed = () =>
    run(async () => {
      const existing = new Set((projects ?? []).map((p) => p.slug));
      let order = (projects?.length ?? 0) * 10;
      for (const s of seedProjects) {
        if (existing.has(s.slug)) continue;
        assertOk(
          await adminClient.models.Project.create({
            ...s,
            featured: s.featured ?? false,
            published: true,
            sortOrder: order,
          }),
        );
        order += 10;
      }
    }, 'Proyectos del sitio actual importados.');

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Proyectos</h1>
          <p>Crea, edita y ordena los proyectos que se muestran en el portafolio.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {projects && projects.length < seedProjects.length && (
            <button className="btn btn-ghost" onClick={importSeed} disabled={busy}>
              Importar proyectos del sitio actual
            </button>
          )}
          <Link href="/admin/proyectos/nuevo" className="btn btn-primary">
            + Nuevo proyecto
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-ok">{notice}</div>}

      {projects === null ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>
      ) : projects.length === 0 ? (
        <div className="empty">
          Aún no hay proyectos. Importa los del sitio actual o crea el primero.
        </div>
      ) : (
        <div className="project-rows">
          {projects.map((p, i) => {
            const cover = coverUrl(p);
            const draft = p.published === false;
            return (
              <div key={p.id} className={`project-row${draft ? ' is-draft' : ''}`} style={colorVars(p.category)}>
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" />
                ) : (
                  <div className="thumb-empty" />
                )}
                <div style={{ minWidth: 0 }}>
                  <h3>{p.title}</h3>
                  <div className="meta">
                    <span className={`status ${draft ? 'status-draft' : 'status-pub'}`}>
                      {draft ? 'Borrador' : 'Publicado'}
                    </span>
                    {p.category && <span>· {p.category}</span>}
                    {p.featured && <span style={{ color: 'var(--accent-text)', fontWeight: 600 }}>· ★ Destacado</span>}
                    <span>· /{p.slug}</span>
                  </div>
                </div>
                <div className="row-actions">
                  <button className="icon-btn" title="Subir" disabled={busy || i === 0} onClick={() => move(i, -1)}>
                    ↑
                  </button>
                  <button
                    className="icon-btn"
                    title="Bajar"
                    disabled={busy || i === projects.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    ↓
                  </button>
                  <button
                    className={`icon-btn${p.featured ? ' on' : ''}`}
                    title={p.featured ? 'Quitar de destacados' : 'Destacar en portada'}
                    disabled={busy}
                    onClick={() => toggle(p, 'featured')}
                  >
                    ★
                  </button>
                  <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => toggle(p, 'published')}>
                    {draft ? 'Publicar' : 'Ocultar'}
                  </button>
                  <Link href={`/admin/proyectos/${p.id}`} className="btn btn-ghost btn-sm">
                    Editar
                  </Link>
                  <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => destroy(p)}>
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
