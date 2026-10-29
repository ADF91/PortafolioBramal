'use client';

import AreaIcon from './AreaIcon';
import { FILTER_EVENT } from './ProjectExplorer';
import { colorVars } from '@/lib/colors';
import { site } from '@/lib/site';

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export default function AreaCards({ areas }: { areas: { name: string; count: number }[] }) {
  function show(category: string) {
    window.dispatchEvent(new CustomEvent(FILTER_EVENT, { detail: category }));
    document.getElementById('proyectos')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="areas">
      {areas.map((a, i) => (
        <button key={a.name} className="area" style={colorVars(a.name)} onClick={() => show(a.name)}>
          <span className="area-index">{String(i + 1).padStart(2, '0')}</span>
          <span className="area-icon">
            <AreaIcon category={a.name} />
          </span>
          <h3>{a.name}</h3>
          <p>{site.areas[normalize(a.name)] ?? `Soluciones tecnológicas de ${a.name.toLowerCase()}.`}</p>
          <span className="area-more">
            {a.count} {a.count === 1 ? 'proyecto' : 'proyectos'} <i>→</i>
          </span>
        </button>
      ))}
    </div>
  );
}
