'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { adminClient, assertOk, listAllProjects, revalidateSite } from '@/lib/admin-client';
import { colorVars } from '@/lib/colors';
import { coverUrl } from '@/lib/cover';
import { isStoragePath } from '@/lib/media';
import { organizeProject, pendingFiles, removeFolder, removePaths } from '@/lib/organize';
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
    if (!confirm(`¿Eliminar "${p.title}" y todos sus archivos (carpeta proyectos/${p.slug}/)? Esta acción no se puede deshacer.`)) return;
    run(async () => {
      assertOk(await adminClient.models.Project.delete({ id: p.id }));
      // Se borra la carpeta completa del proyecto y cualquier archivo suyo que haya quedado fuera de ella.
      const stray = [p.coverImage, p.datasheet, ...projectMedia(p).flatMap((m) => [m.src, m.poster])].filter(isStoragePath);
      await Promise.all([removeFolder(p.slug), removePaths(stray)]);
    }, 'Proyecto y archivos eliminados.');
  };

  /** Copia a proyectos/<slug>/ los archivos que aún están fuera de la carpeta de cada proyecto. */
  const organize = (targets: Project[]) =>
    run(async () => {
      const failures: string[] = [];
      let moved = 0;
      for (const [i, p] of targets.entries()) {
        const res = await organizeProject(p, (done, total) =>
          setNotice(`Organizando ${i + 1}/${targets.length}: ${p.title} (${done}/${total} archivos)…`),
        );
        moved += res.moved;
        failures.push(...res.failed.map((f) => `${p.title}: ${f.url} (${f.error})`));
      }
      if (failures.length) {
        throw new Error(`Se organizaron ${moved} archivos, pero ${failures.length} fallaron:\n${failures.join('\n')}`);
      }
    }, 'Archivos organizados en las carpetas de cada proyecto.');

  const pendingTotal = (projects ?? []).reduce((n, p) => n + pendingFiles(p).length, 0);

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
          {pendingTotal > 0 && (
            <button
              className="btn btn-ghost"
              disabled={busy}
              title="Copia al bucket los videos e imágenes que están en el sitio anterior, dentro de la carpeta de cada proyecto"
              onClick={() => organize((projects ?? []).filter((p) => pendingFiles(p).length > 0))}
            >
              Organizar todo en S3 ({pendingTotal} archivos)
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
                    {pendingFiles(p).length > 0 && (
                      <span style={{ color: 'var(--accent-text)' }}>· {pendingFiles(p).length} archivos fuera de su carpeta</span>
                    )}
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
                  {pendingFiles(p).length > 0 && (
                    <button
                      className="btn btn-ghost btn-sm"
                      disabled={busy}
                      title={`Copiar sus archivos a proyectos/${p.slug}/`}
                      onClick={() => organize([p])}
                    >
                      Organizar en S3
                    </button>
                  )}
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
