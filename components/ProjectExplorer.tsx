'use client';

import { useEffect, useMemo, useState } from 'react';
import ProjectCard from './ProjectCard';
import { colorVars } from '@/lib/colors';
import { cleanList, type Project } from '@/lib/types';

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Evento para filtrar por categoría desde otras secciones (ej. tarjetas de áreas). */
export const FILTER_EVENT = 'bramal:filter-category';

export default function ProjectExplorer({ projects }: { projects: Project[] }) {
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onFilter = (e: Event) => {
      setCategory((e as CustomEvent<string | null>).detail);
      setQuery('');
    };
    window.addEventListener(FILTER_EVENT, onFilter);
    return () => window.removeEventListener(FILTER_EVENT, onFilter);
  }, []);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) if (p.category) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [projects]);

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return projects.filter((p) => {
      if (category && p.category !== category) return false;
      if (!q) return true;
      const haystack = [p.title, p.tagline, p.summary, p.category, ...cleanList(p.tags)].join(' ');
      return normalize(haystack).includes(q);
    });
  }, [projects, category, query]);

  if (!projects.length) {
    return <div className="empty">Pronto publicaremos nuestros proyectos.</div>;
  }

  return (
    <>
      <div className="toolbar">
        <div className="chips" role="group" aria-label="Filtrar por categoría">
          <button className={`chip${category === null ? ' active' : ''}`} onClick={() => setCategory(null)}>
            Todos <small>{projects.length}</small>
          </button>
          {categories.map(([name, count]) => (
            <button
              key={name}
              style={colorVars(name)}
              className={`chip${category === name ? ' active' : ''}`}
              onClick={() => setCategory(category === name ? null : name)}
            >
              {name} <small>{count}</small>
            </button>
          ))}
        </div>
        <input
          className="input search"
          type="search"
          placeholder="Buscar proyecto…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar proyecto"
        />
      </div>
      {visible.length ? (
        <div className="grid">
          {visible.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="empty">No encontramos proyectos con ese criterio.</div>
      )}
    </>
  );
}
