import Link from 'next/link';
import { getPublishedProjects } from '@/lib/projects';
import { site } from '@/lib/site';
import AreaCards from '@/components/AreaCards';
import HeroCarousel from '@/components/HeroCarousel';
import ProjectExplorer from '@/components/ProjectExplorer';
import SocialLinks from '@/components/SocialLinks';

export const revalidate = 60;

export default async function HomePage() {
  const projects = await getPublishedProjects();
  const featured = projects.filter((p) => p.featured);
  const heroProjects = (featured.length ? featured : projects).slice(0, 5);

  const counts = new Map<string, number>();
  for (const p of projects) if (p.category) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  const areas = [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  const figures = [
    ...site.stats,
    { value: String(areas.length || 4), label: 'Áreas de especialización' },
  ];

  return (
    <>
      <HeroCarousel projects={heroProjects} />

      <div className="container">
        <div className="figures">
          {figures.map((f) => (
            <div key={f.label} className="figure">
              <strong>{f.value}</strong>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {areas.length > 0 && (
        <section className="section section-areas">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Especialidades</span>
                <h2>Áreas de especialización</h2>
                <p>Desarrollamos soluciones integrales para los principales desafíos de la gestión urbana.</p>
              </div>
            </div>
            <AreaCards areas={areas} />
          </div>
        </section>
      )}

      <section id="proyectos" className="section section-alt">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Portafolio</span>
              <h2>Nuestros proyectos</h2>
              <p>
                Soluciones que hemos diseñado e implementado para hacer de nuestras ciudades espacios más
                seguros, eficientes y conectados.
              </p>
            </div>
            <Link href="/presentacion" className="btn">
              Presentar portafolio <span className="arrow">→</span>
            </Link>
          </div>
          <ProjectExplorer projects={projects} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Metodología</span>
              <h2>Cómo trabajamos</h2>
              <p>Un proceso probado que acompaña cada proyecto desde la idea hasta su operación.</p>
            </div>
          </div>
          <ol className="process">
            {site.process.map((step, i) => (
              <li key={step.title}>
                <span className="process-n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="nosotros" className="section section-alt">
        <div className="container about">
          <div className="about-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.aboutImage} alt="Equipo Bramal" loading="lazy" />
          </div>
          <div>
            <span className="eyebrow">Sobre nosotros</span>
            <h2>Experiencia al servicio de la ciudad</h2>
            <p>
              Somos una empresa líder en innovación y desarrollo de soluciones tecnológicas. Con años de
              experiencia en el mercado, nos especializamos en crear productos y servicios que transforman
              la manera en que las ciudades operan.
            </p>
            <Link href="/#contacto" className="btn" style={{ marginTop: 32 }}>
              Contactar al equipo <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section id="contacto" className="cta-band">
        <div className="container cta">
          <div>
            <span className="eyebrow">Contacto</span>
            <h2>Conversemos sobre su próximo proyecto</h2>
            <p>Nuestro equipo puede adaptar estas soluciones a los requerimientos de su institución.</p>
          </div>
          {site.contactEmail ? (
            <a className="btn btn-brand" href={`mailto:${site.contactEmail}`}>
              Escríbanos <span className="arrow">→</span>
            </a>
          ) : (
            <div className="cta-social">
              <span>Síganos en</span>
              <SocialLinks />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
