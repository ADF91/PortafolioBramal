import Link from 'next/link';
import { colorVars } from '@/lib/colors';
import { coverUrl, mediaSummary } from '@/lib/cover';
import type { Project } from '@/lib/types';

export default function ProjectCard({ project }: { project: Project }) {
  const cover = coverUrl(project);
  const media = mediaSummary(project);
  return (
    <Link href={`/proyectos/${project.slug}`} className="card" style={colorVars(project.category)}>
      <div className="card-media">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={project.title} loading="lazy" />
        )}
        <div className="card-badges">
          {project.featured ? <span className="badge badge-accent">Destacado</span> : <span />}
          {media && <span className="badge">{media}</span>}
        </div>
      </div>
      <div className="card-body">
        {project.category && <span className="card-category">{project.category}</span>}
        <h3>{project.title}</h3>
        <p>{project.tagline || project.summary}</p>
        <span className="card-more">
          Ver proyecto <i>→</i>
        </span>
      </div>
    </Link>
  );
}
