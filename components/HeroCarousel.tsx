'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { coverUrl } from '@/lib/cover';
import { LEGACY_MEDIA_BASE } from '@/lib/site';
import type { Project } from '@/lib/types';

const fallbackSlides = [
  `${LEGACY_MEDIA_BASE}/images/Proyectos/bicicla.jpg`,
  `${LEGACY_MEDIA_BASE}/images/Carousel/2.png`,
  `${LEGACY_MEDIA_BASE}/images/Carousel/3.png`,
];

const pad = (n: number) => String(n).padStart(2, '0');

export default function HeroCarousel({ projects }: { projects: Project[] }) {
  const slides = projects.length
    ? projects.map((p) => ({ src: coverUrl(p), project: p as Project | null }))
    : fallbackSlides.map((src) => ({ src, project: null as Project | null }));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6500);
    return () => clearInterval(id);
  }, [slides.length]);

  const current = slides[index]?.project;

  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true">
        {slides.map((s, i) =>
          s.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={s.src} alt="" className={i === index ? 'active' : ''} loading={i === 0 ? 'eager' : 'lazy'} />
          ) : null,
        )}
      </div>

      <div className="container hero-inner">
        <div className="hero-copy">
          <span className="eyebrow">Ingeniería e innovación urbana</span>
          <h1>
            Tecnología que <em>mejora</em> ciudades
          </h1>
          <p className="hero-lead">
            Diseñamos e implementamos soluciones de vanguardia en movilidad, seguridad vial y seguridad
            ciudadana, desde la ingeniería hasta su operación en la vía pública.
          </p>
          <div className="hero-actions">
            <Link href="/#proyectos" className="btn btn-brand">
              Conocer proyectos <span className="arrow">→</span>
            </Link>
            <Link href="/presentacion" className="btn btn-outline-light">
              Ver presentación
            </Link>
          </div>
        </div>

        {slides.length > 0 && (
          <div className="hero-featured">
            {current ? (
              <Link href={`/proyectos/${current.slug}`} className="hero-featured-text">
                <small>Proyecto destacado · {current.category}</small>
                <strong>{current.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {slides.length > 1 && (
              <div className="hero-dots" role="tablist" aria-label="Proyectos destacados">
                <span className="hero-counter">{pad(index + 1)}</span>
                {slides.map((_, i) => (
                  <button
                    key={i}
                    className={i === index ? 'active' : ''}
                    onClick={() => setIndex(i)}
                    aria-label={`Ir a destacado ${i + 1}`}
                    aria-selected={i === index}
                    role="tab"
                  />
                ))}
                <span className="hero-counter">{pad(slides.length)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
