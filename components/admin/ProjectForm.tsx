'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { copy, uploadData } from 'aws-amplify/storage';
import { adminClient, assertOk, listAllProjects, revalidateSite } from '@/lib/admin-client';
import { isStoragePath, mediaUrl, projectFolder, slugify, uploadPath } from '@/lib/media';
import { copyFolder, removePaths } from '@/lib/organize';
import { cleanList, projectMedia, specsToText, textToSpecs, type MediaItem, type Project } from '@/lib/types';

type Upload = { id: string; name: string; progress: number; error?: string };

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;

export default function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();

  const [title, setTitle] = useState(project?.title ?? '');
  const [slug, setSlug] = useState(project?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(!!project);
  const [tagline, setTagline] = useState(project?.tagline ?? '');
  const [summary, setSummary] = useState(project?.summary ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [category, setCategory] = useState(project?.category ?? '');
  const [tags, setTags] = useState(cleanList(project?.tags).join(', '));
  const [highlights, setHighlights] = useState(cleanList(project?.highlights).join('\n'));
  const [client, setClient] = useState(project?.client ?? '');
  const [location, setLocation] = useState(project?.location ?? '');
  const [model, setModel] = useState(project?.model ?? '');
  const [applications, setApplications] = useState(cleanList(project?.applications).join('\n'));
  const [specsText, setSpecsText] = useState(specsToText(project?.specs));
  const [datasheet, setDatasheet] = useState(project?.datasheet ?? '');
  const [presentationUrl, setPresentationUrl] = useState(project?.presentationUrl ?? '');
  const datasheetInput = useRef<HTMLInputElement>(null);
  const [year, setYear] = useState(project?.year ? String(project.year) : '');
  const [published, setPublished] = useState(project?.published !== false);
  const [featured, setFeatured] = useState(!!project?.featured);
  const [coverImage, setCoverImage] = useState(project?.coverImage ?? '');
  const [media, setMedia] = useState<MediaItem[]>(project ? projectMedia(project) : []);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [urlToAdd, setUrlToAdd] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const posterTarget = useRef<number | null>(null);
  const posterInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listAllProjects()
      .then((all) => setCategories([...new Set(all.map((p) => p.category).filter((c): c is string => !!c))].sort()))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const uploading = uploads.some((u) => u.progress < 1 && !u.error);

  async function upload(file: File): Promise<string | null> {
    // Los archivos se guardan en la carpeta del proyecto: proyectos/<slug>/<videos|imagenes|fichas>/
    const target = slugify(slug || title);
    if (!target) {
      setError('Escribe el título del proyecto antes de subir archivos: se usa para nombrar su carpeta.');
      return null;
    }
    const id = crypto.randomUUID();
    setUploads((u) => [...u, { id, name: file.name, progress: 0 }]);
    const path = uploadPath(target, file);
    try {
      await uploadData({
        path,
        data: file,
        options: {
          contentType: file.type || undefined,
          onProgress: ({ transferredBytes, totalBytes }) => {
            if (totalBytes) {
              setUploads((u) => u.map((x) => (x.id === id ? { ...x, progress: transferredBytes / totalBytes } : x)));
            }
          },
        },
      }).result;
      setUploads((u) => u.filter((x) => x.id !== id));
      return path;
    } catch (e) {
      setUploads((u) => u.map((x) => (x.id === id ? { ...x, error: e instanceof Error ? e.message : 'Error' } : x)));
      return null;
    }
  }

  async function addFiles(files: FileList | File[]) {
    const list = [...files].filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'));
    await Promise.all(
      list.map(async (file) => {
        const path = await upload(file);
        if (!path) return;
        const kind = file.type.startsWith('video/') ? 'video' : 'image';
        setMedia((m) => [...m, { kind, src: path }]);
        if (kind === 'image') setCoverImage((c) => c || path);
      }),
    );
  }

  function addUrl() {
    const src = urlToAdd.trim();
    if (!/^https?:\/\//i.test(src)) {
      setError('La URL debe comenzar con http:// o https://');
      return;
    }
    setMedia((m) => [...m, { kind: VIDEO_EXT.test(src) ? 'video' : 'image', src }]);
    setUrlToAdd('');
    setError('');
  }

  function updateItem(index: number, patch: Partial<MediaItem>) {
    setMedia((m) => m.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function moveItem(index: number, delta: number) {
    setMedia((m) => {
      const target = index + delta;
      if (target < 0 || target >= m.length) return m;
      const list = [...m];
      [list[index], list[target]] = [list[target], list[index]];
      return list;
    });
  }

  function removeItem(index: number) {
    const item = media[index];
    const paths = [item.src, item.poster].filter(isStoragePath);
    setRemoved((r) => [...r, ...paths]);
    if (coverImage && (coverImage === item.src || coverImage === item.poster)) setCoverImage('');
    setMedia((m) => m.filter((_, i) => i !== index));
  }

  async function onPosterPicked(file?: File) {
    const index = posterTarget.current;
    if (!file || index === null) return;
    const path = await upload(file);
    if (!path) return;
    const old = media[index]?.poster;
    if (isStoragePath(old)) setRemoved((r) => [...r, old]);
    updateItem(index, { poster: path });
  }

  async function onCoverPicked(file?: File) {
    if (!file) return;
    const path = await upload(file);
    if (path) setCoverImage(path);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const finalSlug = slugify(slug || title);
    if (!title.trim() || !summary.trim() || !finalSlug) {
      setError('Título, URL y resumen son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      const sameSlug = await adminClient.models.Project.listProjectBySlug({ slug: finalSlug });
      if (sameSlug.data.some((p) => p.id !== project?.id)) {
        throw new Error(`Ya existe un proyecto con la URL "/${finalSlug}".`);
      }

      // La carpeta del bucket sigue a la URL del proyecto: si cambió, se copian los archivos a la nueva.
      const finalFolder = projectFolder(finalSlug);
      const moved = new Map<string, string>();
      if (project && project.slug !== finalSlug) {
        for (const [from, to] of await copyFolder(project.slug, finalSlug)) moved.set(from, to);
      }
      const refs = [coverImage, datasheet, ...media.flatMap((m) => [m.src, m.poster])].filter(isStoragePath);
      for (const ref of refs) {
        if (ref.startsWith(finalFolder) || moved.has(ref)) continue;
        const dest = finalFolder + ref.split('/').slice(2).join('/');
        await copy({ source: { path: ref }, destination: { path: dest } });
        moved.set(ref, dest);
      }
      const r = (s?: string | null) => (s ? moved.get(s) ?? s : s);

      const payload = {
        slug: finalSlug,
        title: title.trim(),
        tagline: tagline.trim() || null,
        summary: summary.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        highlights: highlights.split('\n').map((t) => t.trim()).filter(Boolean),
        client: client.trim() || null,
        location: location.trim() || null,
        model: model.trim() || null,
        applications: applications.split('\n').map((t) => t.trim()).filter(Boolean),
        specs: textToSpecs(specsText),
        datasheet: r(datasheet.trim()) || null,
        presentationUrl: presentationUrl.trim() || null,
        year: year ? Number.parseInt(year, 10) || null : null,
        published,
        featured,
        coverImage: r(coverImage) || null,
        media: media.map((m) => ({
          kind: m.kind,
          src: r(m.src)!,
          poster: r(m.poster) || null,
          caption: m.caption?.trim() || null,
        })),
      };

      if (project) {
        assertOk(await adminClient.models.Project.update({ id: project.id, ...payload }));
      } else {
        const all = await listAllProjects();
        const maxOrder = all.reduce((max, p) => Math.max(max, p.sortOrder ?? 0), 0);
        assertOk(await adminClient.models.Project.create({ ...payload, sortOrder: all.length ? maxOrder + 10 : 0 }));
      }

      // Limpieza: archivos quitados del proyecto y la copia antigua de los que se movieron de carpeta.
      const stillUsed = new Set([payload.coverImage, payload.datasheet, ...payload.media.flatMap((m) => [m.src, m.poster])]);
      await removePaths([...removed, ...moved.keys()].filter((p) => !stillUsed.has(p)));
      await revalidateSite();
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save}>
      <div className="admin-head">
        <div>
          <h1>{project ? 'Editar proyecto' : 'Nuevo proyecto'}</h1>
          <p>Los campos con * son obligatorios.</p>
        </div>
        {project && published && (
          <a href={`/proyectos/${project.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            Ver publicado ↗
          </a>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="panel">
        <h2>Información</h2>
        <div className="form-grid">
          <div className="field full">
            <label htmlFor="title">Título *</label>
            <input id="title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="slug">URL *</label>
            <input
              id="slug"
              className="input"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              onBlur={() => setSlug(slugify(slug))}
            />
            <span className="hint">portafolio.bramal.cl/proyectos/{slugify(slug) || '…'}</span>
          </div>
          <div className="field">
            <label htmlFor="category">Categoría</label>
            <input
              id="category"
              className="input"
              list="categories"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ej: Seguridad vial"
            />
            <datalist id="categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="field full">
            <label htmlFor="tagline">Subtítulo</label>
            <input
              id="tagline"
              className="input"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Frase corta que acompaña al título"
            />
          </div>
          <div className="field full">
            <label htmlFor="summary">Resumen *</label>
            <textarea
              id="summary"
              className="textarea"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              rows={3}
            />
            <span className="hint">Se muestra en la tarjeta del proyecto y en buscadores.</span>
          </div>
          <div className="field full">
            <label htmlFor="description">Descripción detallada</label>
            <textarea
              id="description"
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
            />
            <span className="hint">Separa párrafos con una línea en blanco.</span>
          </div>
          <div className="field full">
            <label htmlFor="highlights">Características principales</label>
            <textarea
              id="highlights"
              className="textarea"
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              rows={4}
              placeholder={'Una por línea'}
            />
          </div>
          <div className="field full">
            <label htmlFor="tags">Etiquetas</label>
            <input
              id="tags"
              className="input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="LED, Peatones, IoT"
            />
            <span className="hint">Separadas por coma.</span>
          </div>
          <div className="field">
            <label htmlFor="client">Cliente / mandante</label>
            <input id="client" className="input" value={client} onChange={(e) => setClient(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="location">Ubicación</label>
            <input id="location" className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="year">Año</label>
            <input
              id="year"
              className="input"
              type="number"
              min={1990}
              max={2100}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
          <div className="field" style={{ justifyContent: 'flex-end', gap: 12 }}>
            <label className="checkbox">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              Publicado (visible en el sitio)
            </label>
            <label className="checkbox">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              Destacado en la portada
            </label>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Ficha técnica</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="model">Modelo</label>
            <input id="model" className="input" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ej: ST-BRK-05" />
          </div>
          <div className="field">
            <label htmlFor="presentationUrl">Presentación detallada (URL)</label>
            <input
              id="presentationUrl"
              className="input"
              value={presentationUrl}
              onChange={(e) => setPresentationUrl(e.target.value)}
              placeholder="https://… o /presentaciones/…"
            />
          </div>
          <div className="field full">
            <label htmlFor="specs">Especificaciones</label>
            <textarea
              id="specs"
              className="textarea"
              value={specsText}
              onChange={(e) => setSpecsText(e.target.value)}
              rows={10}
              style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 14 }}
              placeholder={'# Dimensiones\nAltura: 1979 mm\nAncho: 600 mm\n\n# Eléctricas\nAlimentación: 24 Vcc'}
            />
            <span className="hint">
              Una por línea con el formato <b>Etiqueta: Valor</b>. Las líneas que empiezan con <b>#</b> crean una sección.
              {' '}
              {textToSpecs(specsText).length} especificaciones detectadas.
            </span>
          </div>
          <div className="field full">
            <label htmlFor="applications">Aplicaciones</label>
            <textarea
              id="applications"
              className="textarea"
              value={applications}
              onChange={(e) => setApplications(e.target.value)}
              rows={4}
              placeholder="Una por línea"
            />
          </div>
          <div className="field full">
            <label>Ficha técnica en PDF</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {datasheet ? (
                <a href={mediaUrl(datasheet)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                  Ver PDF actual ↗
                </a>
              ) : (
                <span className="hint">Sin ficha cargada.</span>
              )}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => datasheetInput.current?.click()}>
                {datasheet ? 'Reemplazar PDF' : 'Subir PDF'}
              </button>
              {datasheet && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    if (isStoragePath(datasheet)) setRemoved((r) => [...r, datasheet]);
                    setDatasheet('');
                  }}
                >
                  Quitar
                </button>
              )}
            </div>
            <span className="hint">Si se carga, el sitio y la presentación muestran el botón “Descargar ficha técnica”.</span>
            <input
              ref={datasheetInput}
              type="file"
              accept="application/pdf"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                const path = await upload(file);
                if (!path) return;
                if (isStoragePath(datasheet)) setRemoved((r) => [...r, datasheet]);
                setDatasheet(path);
              }}
            />
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Imagen de portada</h2>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaUrl(coverImage)}
              alt=""
              style={{ width: 200, aspectRatio: '16/10', objectFit: 'cover', borderRadius: 8 }}
            />
          ) : (
            <div className="thumb-empty" style={{ width: 200, aspectRatio: '16/10', borderRadius: 8, background: 'var(--surface-2)' }} />
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => coverInput.current?.click()}>
              Subir portada
            </button>
            {coverImage && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCoverImage('')}>
                Quitar
              </button>
            )}
          </div>
          <span className="hint" style={{ color: 'var(--text-faint)', fontSize: 13 }}>
            Si no defines una, se usa la primera imagen de la galería. También puedes marcar una imagen de la galería como portada.
          </span>
        </div>
        <input
          ref={coverInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            onCoverPicked(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </section>

      <section className="panel">
        <h2>Galería (imágenes y videos)</h2>
        <div
          className={`dropzone${dragOver ? ' over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addFiles(e.dataTransfer.files);
          }}
        >
          <p style={{ marginBottom: 12 }}>Arrastra imágenes o videos aquí</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => fileInput.current?.click()}>
            Seleccionar archivos
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*,video/*"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input
            className="input"
            placeholder="…o pega la URL de una imagen o video (https://…)"
            value={urlToAdd}
            onChange={(e) => setUrlToAdd(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addUrl();
              }
            }}
          />
          <button type="button" className="btn btn-ghost" onClick={addUrl} disabled={!urlToAdd.trim()}>
            Agregar
          </button>
        </div>

        {uploads.length > 0 && (
          <div className="uploads">
            {uploads.map((u) => (
              <div key={u.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span>{u.name}</span>
                  <span style={{ color: u.error ? 'var(--danger)' : undefined }}>
                    {u.error ? `Error: ${u.error}` : `${Math.round(u.progress * 100)}%`}
                  </span>
                </div>
                {!u.error && (
                  <div className="progress">
                    <div style={{ width: `${u.progress * 100}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {media.length > 0 && (
          <div className="media-list" style={{ marginTop: 20 }}>
            {media.map((m, i) => {
              const coverSrc = m.kind === 'video' ? m.poster : m.src;
              const isCover = !!coverImage && coverSrc === coverImage;
              return (
                <div key={`${m.src}-${i}`} className={`media-item${isCover ? ' is-cover' : ''}`}>
                  <div className="media-preview">
                    {m.kind === 'video' ? (
                      <video src={mediaUrl(m.src)} poster={mediaUrl(m.poster) || undefined} muted controls preload="metadata" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mediaUrl(m.src)} alt="" />
                    )}
                    <div className="card-badges">
                      <span className="badge">{m.kind === 'video' ? 'Video' : 'Imagen'}</span>
                      {isCover && <span className="badge badge-accent">Portada</span>}
                    </div>
                  </div>
                  <div className="media-tools">
                    <input
                      className="input"
                      style={{ padding: '6px 10px', fontSize: 13 }}
                      placeholder="Leyenda (opcional)"
                      value={m.caption ?? ''}
                      onChange={(e) => updateItem(i, { caption: e.target.value })}
                    />
                    <div className="row">
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button type="button" className="icon-btn" title="Mover antes" disabled={i === 0} onClick={() => moveItem(i, -1)}>
                          ←
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          title="Mover después"
                          disabled={i === media.length - 1}
                          onClick={() => moveItem(i, 1)}
                        >
                          →
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {m.kind === 'video' && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            title="Imagen de vista previa del video"
                            onClick={() => {
                              posterTarget.current = i;
                              posterInput.current?.click();
                            }}
                          >
                            Póster
                          </button>
                        )}
                        {coverSrc && !isCover && (
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCoverImage(coverSrc)}>
                            Portada
                          </button>
                        )}
                        <button type="button" className="icon-btn" title="Quitar" onClick={() => removeItem(i)}>
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <input
          ref={posterInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            onPosterPicked(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </section>

      <div className="form-actions">
        <Link href="/admin" className="btn btn-ghost">
          Cancelar
        </Link>
        <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
          {saving ? 'Guardando…' : uploading ? 'Subiendo archivos…' : project ? 'Guardar cambios' : 'Crear proyecto'}
        </button>
      </div>
    </form>
  );
}
