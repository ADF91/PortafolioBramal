'use client';

import { useState } from 'react';
import { colorVars } from '@/lib/colors';
import { coverUrl } from '@/lib/cover';
import { mediaUrl } from '@/lib/media';
import { site } from '@/lib/site';
import { cleanList, projectMedia, specGroups, type MediaItem, type Project } from '@/lib/types';

export type SlideData =
  | { kind: 'cover'; client: string; projects: Project[] }
  | { kind: 'index'; projects: Project[] }
  | { kind: 'project'; project: Project; n: number; total: number }
  | { kind: 'specs'; project: Project; n: number; total: number }
  | { kind: 'closing' };

/** Un proyecto tiene diapositiva de ficha técnica si trae especificaciones o aplicaciones. */
export function hasSpecsSlide(p: Project): boolean {
  return specGroups(p).length > 0 || cleanList(p.applications).length > 0;
}

type Props = { slide: SlideData; page: number; pages: number; thumb?: boolean };

const pad = (n: number) => String(n).padStart(2, '0');

function Logo({ className }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={site.logo} alt="Bramal" />;
}

function Footer({ page, pages }: { page: number; pages: number }) {
  return (
    <div className="s-footer">
      <Logo />
      <span>Portafolio de proyectos</span>
      <span className="s-page">
        {pad(page)} <i>/</i> {pad(pages)}
      </span>
    </div>
  );
}

function CoverSlide({ client, projects }: { client: string; projects: Project[] }) {
  const image = projects.map(coverUrl).find(Boolean);
  const date = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(new Date());
  const month = date.charAt(0).toUpperCase() + date.slice(1);
  return (
    <div className="slide s-cover">
      <div className="s-cover-panel">
        <Logo className="s-cover-logo logo-negative" />
        <div className="s-cover-copy">
          <span className="s-eyebrow">Portafolio de proyectos</span>
          <h1>
            Tecnología que <em>mejora</em> ciudades
          </h1>
          <p>Soluciones en movilidad, seguridad vial y seguridad ciudadana.</p>
        </div>
        <div className="s-cover-meta">
          {client ? (
            <div>
              <small>Preparado para</small>
              <strong>{client}</strong>
            </div>
          ) : (
            <div>
              <small>Bramal</small>
              <strong>Soluciones tecnológicas</strong>
            </div>
          )}
          <div>
            <small>Fecha</small>
            <strong>{month}</strong>
          </div>
        </div>
      </div>
      <div className="s-cover-image">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" />
        )}
      </div>
    </div>
  );
}

function IndexSlide({ projects, page, pages }: { projects: Project[]; page: number; pages: number }) {
  const list = projects.slice(0, 16);
  const cols = list.length <= 6 ? 1 : 2;
  return (
    <div className="slide s-index">
      <div className="s-index-head">
        <span className="s-eyebrow">Agenda</span>
        <h2>Contenidos</h2>
        <p>
          {projects.length} {projects.length === 1 ? 'proyecto seleccionado' : 'proyectos seleccionados'} para esta
          presentación.
        </p>
      </div>
      <ol className={`s-index-list cols-${cols}${list.length > 10 ? ' dense' : ''}`}>
        {list.map((p, i) => (
          <li key={p.id} style={colorVars(p.category)}>
            <span className="s-index-n">{pad(i + 1)}</span>
            <span>
              <strong>{p.title}</strong>
              {p.category && <small>{p.category}</small>}
            </span>
          </li>
        ))}
      </ol>
      <Footer page={page} pages={pages} />
    </div>
  );
}

function ProjectSlide({
  project,
  n,
  total,
  page,
  pages,
  thumb,
}: {
  project: Project;
  n: number;
  total: number;
  page: number;
  pages: number;
  thumb?: boolean;
}) {
  const media = projectMedia(project);
  const cover = coverUrl(project);
  const items: MediaItem[] = media.length ? media : cover ? [{ kind: 'image', src: cover }] : [];
  const [index, setIndex] = useState(0);
  const current = items[Math.min(index, items.length - 1)];
  // Con títulos o resúmenes largos se muestran menos características para que la columna no se desborde.
  const longTitle = project.title.length > 34;
  const maxHighlights = project.summary.length > 200 ? (longTitle ? 1 : 2) : 3;
  const highlights = cleanList(project.highlights).slice(0, maxHighlights);
  const tags = cleanList(project.tags).slice(0, 5);

  return (
    <div className={`slide s-project${longTitle ? ' long-title' : ''}`} style={colorVars(project.category)}>
      <div className="s-media">
        {current &&
          (current.kind === 'video' && !thumb ? (
            <video
              key={current.src}
              src={mediaUrl(current.src)}
              poster={mediaUrl(current.poster) || undefined}
              autoPlay
              muted
              loop
              playsInline
              controls
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaUrl(current.kind === 'video' ? current.poster || cover : current.src)}
              alt={current.caption || project.title}
            />
          ))}
        {items.length > 1 && (
          <div className="s-thumbs">
            {items.slice(0, 6).map((m, i) => (
              <button
                key={`${m.src}-${i}`}
                className={i === index ? 'active' : ''}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                tabIndex={thumb ? -1 : 0}
              >
                {m.kind === 'video' && !m.poster ? (
                  <video src={`${mediaUrl(m.src)}#t=0.5`} muted preload="metadata" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(m.kind === 'video' ? m.poster : m.src)} alt="" />
                )}
                {m.kind === 'video' && <span>▶</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="s-copy">
        <div className="s-num">
          {pad(n)}
          <span> / {pad(total)}</span>
        </div>
        {project.category && <span className="s-cat">{project.category}</span>}
        <h2>{project.title}</h2>
        {project.tagline && <p className="s-tagline">{project.tagline}</p>}
        <span className="s-rule" />
        <p className="s-summary">{project.summary}</p>
        {highlights.length > 0 && (
          <ul className="s-highlights">
            {highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}
        {tags.length > 0 && (
          <div className="s-tags">
            {tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        )}
      </div>
      <Footer page={page} pages={pages} />
    </div>
  );
}

function SpecsSlide({ project, n, total, page, pages }: { project: Project; n: number; total: number; page: number; pages: number }) {
  const groups = specGroups(project, 20);
  const applications = cleanList(project.applications).slice(0, 5);
  return (
    <div className="slide s-specs" style={colorVars(project.category)}>
      <div className="s-specs-main">
        <div className="s-specs-head">
          <span className="s-eyebrow">
            Ficha técnica · {pad(n)} / {pad(total)}
          </span>
          <h2>{project.title}</h2>
          {project.model && <p className="s-model">Modelo {project.model}</p>}
        </div>
        {groups.length > 0 && (
          <div className={`s-spec-groups${groups.reduce((a, g) => a + g.items.length + 1, 0) > 14 ? ' two-col' : ''}`}>
            {groups.map((g) => (
              <section key={g.name} className="s-spec-group">
                <h3>{g.name}</h3>
                <dl>
                  {g.items.map((s) => (
                    <div key={s.label}>
                      <dt>{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        )}
      </div>
      <aside className="s-specs-side">
        {applications.length > 0 && (
          <>
            <h3>Aplicaciones</h3>
            <ul>
              {applications.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </>
        )}
        {(project.presentationUrl || project.datasheet) && (
          <div className="s-specs-links">
            {project.presentationUrl && (
              <a href={mediaUrl(project.presentationUrl)} target="_blank" rel="noopener noreferrer">
                Presentación detallada <span>↗</span>
              </a>
            )}
            {project.datasheet && (
              <a href={mediaUrl(project.datasheet)} target="_blank" rel="noopener noreferrer">
                Ficha técnica PDF <span>↓</span>
              </a>
            )}
          </div>
        )}
      </aside>
      <Footer page={page} pages={pages} />
    </div>
  );
}

function ClosingSlide() {
  const contacts = [
    ...(site.contactEmail ? [{ label: 'Email', value: site.contactEmail }] : []),
    ...(site.contactPhone ? [{ label: 'Teléfono', value: site.contactPhone }] : []),
    { label: 'Web', value: site.website },
    { label: 'LinkedIn', value: 'Constructora Bramal' },
  ];
  return (
    <div className="slide s-closing">
      <div className="s-closing-inner">
        <Logo className="s-closing-logo logo-negative" />
        <span className="s-rule" />
        <h2>Gracias</h2>
        <p>Conversemos sobre cómo estas soluciones pueden apoyar a su institución.</p>
        <div className="s-contacts">
          {contacts.map((c) => (
            <div key={c.label}>
              <small>{c.label}</small>
              <strong>{c.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SlideView({ slide, page, pages, thumb }: Props) {
  switch (slide.kind) {
    case 'cover':
      return <CoverSlide client={slide.client} projects={slide.projects} />;
    case 'index':
      return <IndexSlide projects={slide.projects} page={page} pages={pages} />;
    case 'project':
      return (
        <ProjectSlide
          project={slide.project}
          n={slide.n}
          total={slide.total}
          page={page}
          pages={pages}
          thumb={thumb}
        />
      );
    case 'specs':
      return <SpecsSlide project={slide.project} n={slide.n} total={slide.total} page={page} pages={pages} />;
    case 'closing':
      return <ClosingSlide />;
  }
}
