import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MediaGallery from '@/components/MediaGallery';
import ProjectCard from '@/components/ProjectCard';
import { colorVars } from '@/lib/colors';
import { coverUrl } from '@/lib/cover';
import { getProjectBySlug, getPublishedProjects } from '@/lib/projects';
import { mediaUrl } from '@/lib/media';
import { cleanList, projectMedia, specGroups, type MediaItem } from '@/lib/types';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: 'Proyecto no encontrado' };
  const cover = coverUrl(project);
  return {
    title: project.title,
    description: project.summary,
    openGraph: { title: project.title, description: project.summary, images: cover ? [cover] : [] },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const all = await getPublishedProjects();
  const project = all.find((p) => p.slug === slug);
  if (!project) notFound();

  const media = projectMedia(project);
  const cover = coverUrl(project);
  const gallery: MediaItem[] = media.length ? media : cover ? [{ kind: 'image', src: cover }] : [];
  const paragraphs = (project.description || '').split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  const highlights = cleanList(project.highlights);
  const applications = cleanList(project.applications);
  const specs = specGroups(project);
  const tags = cleanList(project.tags);
  const related = all.filter((p) => p.id !== project.id && p.category === project.category).slice(0, 3);

  return (
    <div style={colorVars(project.category)}>
      <section className="detail-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Inicio</Link> / <Link href="/#proyectos">Proyectos</Link> / {project.title}
          </nav>
          <div className="detail-hero-row">
            <div>
              {project.category && <span className="card-category">{project.category}</span>}
              <h1>{project.title}</h1>
              {project.tagline && <p className="detail-tagline">{project.tagline}</p>}
            </div>
            <Link href={`/presentacion?s=${project.slug}`} className="btn">
              Presentar este proyecto <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="container detail-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36, minWidth: 0 }}>
          <MediaGallery items={gallery} title={project.title} />
          <div className="prose">
            <p className="lead">{project.summary}</p>
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {highlights.length > 0 && (
              <>
                <h2>Características principales</h2>
                <ul className="highlights">
                  {highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </>
            )}
            {applications.length > 0 && (
              <>
                <h2>Aplicaciones</h2>
                <ul className="highlights">
                  {applications.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          {specs.length > 0 && (
            <section className="spec-table">
              <h2>Especificaciones técnicas</h2>
              <div className="spec-groups">
                {specs.map((g) => (
                  <div key={g.name} className="spec-group">
                    <h3>{g.name}</h3>
                    <dl>
                      {g.items.map((s) => (
                        <div key={s.label}>
                          <dt>{s.label}</dt>
                          <dd>{s.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
              <p className="spec-note">Especificaciones referenciales, sujetas a cambios sin previo aviso.</p>
            </section>
          )}
        </div>

        <aside>
          <dl className="facts">
            {project.category && (
              <div>
                <dt>Categoría</dt>
                <dd>{project.category}</dd>
              </div>
            )}
            {project.model && (
              <div>
                <dt>Modelo</dt>
                <dd>{project.model}</dd>
              </div>
            )}
            {project.client && (
              <div>
                <dt>Cliente</dt>
                <dd>{project.client}</dd>
              </div>
            )}
            {project.location && (
              <div>
                <dt>Ubicación</dt>
                <dd>{project.location}</dd>
              </div>
            )}
            {project.year && (
              <div>
                <dt>Año</dt>
                <dd>{project.year}</dd>
              </div>
            )}
            {tags.length > 0 && (
              <div>
                <dt>Tecnologías y ámbitos</dt>
                <dd className="tags">
                  {tags.map((t) => (
                    <span className="tag" key={t}>
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            )}
            <div className="facts-actions">
              <Link href="/#contacto" className="btn btn-primary">
                Solicitar información
              </Link>
              {project.datasheet && (
                <a href={mediaUrl(project.datasheet)} className="btn" target="_blank" rel="noopener noreferrer">
                  Descargar ficha técnica <span className="arrow">↓</span>
                </a>
              )}
              {project.presentationUrl && (
                <a href={mediaUrl(project.presentationUrl)} className="btn" target="_blank" rel="noopener noreferrer">
                  Presentación detallada <span className="arrow">↗</span>
                </a>
              )}
            </div>
          </dl>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Más proyectos</span>
                <h2>Proyectos relacionados</h2>
              </div>
            </div>
            <div className="grid">
              {related.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
