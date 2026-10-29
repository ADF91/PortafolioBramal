'use client';

import './presentation.css';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { colorVars } from '@/lib/colors';
import type { Project } from '@/lib/types';
import SlideView, { hasSpecsSlide, type SlideData } from './Slide';

const W = 1600;
const H = 900;

function buildSlides(projects: Project[], client: string, withSpecs: boolean): SlideData[] {
  const slides: SlideData[] = [{ kind: 'cover', client, projects }];
  if (projects.length > 1) slides.push({ kind: 'index', projects });
  projects.forEach((project, i) => {
    const n = i + 1;
    slides.push({ kind: 'project', project, n, total: projects.length });
    if (withSpecs && hasSpecsSlide(project)) slides.push({ kind: 'specs', project, n, total: projects.length });
  });
  slides.push({ kind: 'closing' });
  return slides;
}

/** Escala un lienzo fijo de 1600×900 para que quepa en el contenedor. */
function useFitScale(ref: React.RefObject<HTMLElement | null>) {
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(Math.min(el.clientWidth / W, el.clientHeight / H));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return scale;
}

export default function Presentation({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const selected = params.get('p')?.split(',').filter(Boolean) ?? null;
  const client = params.get('cliente') ?? '';
  const deckProjects = useMemo(
    () => (selected ? projects.filter((p) => selected.includes(p.slug)) : projects),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projects, params.get('p')],
  );
  const withSpecs = params.get('fichas') !== '0';
  const slides = useMemo(() => buildSlides(deckProjects, client, withSpecs), [deckProjects, client, withSpecs]);

  const [index, setIndex] = useState(() => {
    const start = params.get('s');
    if (start) return Math.max(0, slides.findIndex((s) => s.kind === 'project' && s.project.slug === start));
    const n = Number.parseInt(params.get('slide') ?? '', 10);
    return Number.isFinite(n) ? Math.max(0, Math.min(slides.length - 1, n - 1)) : 0;
  });
  const [overview, setOverview] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [idle, setIdle] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const scale = useFitScale(viewportRef);
  const touchX = useRef<number | null>(null);

  const last = slides.length - 1;
  const safeIndex = Math.min(index, last);
  const go = useCallback((i: number) => setIndex(Math.max(0, Math.min(last, i))), [last]);
  const next = useCallback(() => go(safeIndex + 1), [go, safeIndex]);
  const prev = useCallback(() => go(safeIndex - 1), [go, safeIndex]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else deckRef.current?.requestFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (configOpen || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target.tagName === 'VIDEO' && (e.key === ' ' || e.key.startsWith('Arrow'))) return;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
        case 'Enter':
          e.preventDefault();
          if (overview) setOverview(false);
          else next();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
          e.preventDefault();
          prev();
          break;
        case 'Home':
          go(0);
          break;
        case 'End':
          go(last);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'o':
        case 'O':
        case 'g':
        case 'G':
          setOverview((v) => !v);
          break;
        case 'Escape':
          setOverview(false);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, go, last, overview, configOpen, toggleFullscreen]);

  // En pantalla completa los controles y el cursor se ocultan tras unos segundos sin movimiento.
  useEffect(() => {
    if (!fullscreen) {
      setIdle(false);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const wake = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), 2500);
    };
    wake();
    window.addEventListener('mousemove', wake);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', wake);
    };
  }, [fullscreen]);

  function applyConfig(config: DeckConfig) {
    const qs = configQuery(config, projects.length);
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    setIndex(0);
    setConfigOpen(false);
  }

  const current = slides[safeIndex];
  const progress = slides.length > 1 ? safeIndex / last : 1;

  return (
    <div className="pres-page">
      <header className="pres-top">
        <Link href="/" className="pres-back">
          ← Sitio
        </Link>
        <div className="pres-title">
          <strong>Modo presentación</strong>
          <span>
            {deckProjects.length} proyectos{client ? ` · para ${client}` : ''}
          </span>
        </div>
        <div className="pres-top-actions">
          <span className="pres-keys">
            <kbd>←</kbd>
            <kbd>→</kbd> navegar · <kbd>F</kbd> pantalla completa · <kbd>O</kbd> vista general
          </span>
          <button className="btn btn-outline-light btn-sm" onClick={() => setConfigOpen(true)}>
            Configurar
          </button>
          <button className="btn btn-brand btn-sm pres-fs-btn" onClick={toggleFullscreen}>
            Pantalla completa
          </button>
        </div>
      </header>

      <div ref={deckRef} className={`deck${idle ? ' idle' : ''}${fullscreen ? ' is-fs' : ''}`}>
        <div
          ref={viewportRef}
          className="deck-viewport"
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
            touchX.current = null;
          }}
        >
          {scale > 0 && current && (
            <div className="deck-stage" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
              <div key={safeIndex} className="slide-anim">
                <SlideView slide={current} page={safeIndex + 1} pages={slides.length} />
              </div>
            </div>
          )}
          <button className="deck-hit deck-hit-prev" onClick={prev} aria-label="Anterior" disabled={safeIndex === 0} />
          <button className="deck-hit deck-hit-next" onClick={next} aria-label="Siguiente" disabled={safeIndex === last} />
        </div>

        <div className="deck-progress">
          <div style={{ width: `${progress * 100}%` }} />
        </div>

        <div className="deck-controls">
          <button onClick={prev} disabled={safeIndex === 0} aria-label="Anterior">
            ‹
          </button>
          <span>
            {safeIndex + 1} / {slides.length}
          </span>
          <button onClick={next} disabled={safeIndex === last} aria-label="Siguiente">
            ›
          </button>
          <i />
          <button onClick={() => setOverview((v) => !v)} aria-label="Vista general" title="Vista general (O)">
            ▦
          </button>
          <button onClick={toggleFullscreen} aria-label="Pantalla completa" title="Pantalla completa (F)">
            {fullscreen ? '⤡' : '⛶'}
          </button>
        </div>

        {overview && (
          <div className="deck-overview" onClick={() => setOverview(false)}>
            <div className="deck-overview-grid" onClick={(e) => e.stopPropagation()}>
              {slides.map((s, i) => (
                <button
                  key={i}
                  className={`ov-thumb${i === safeIndex ? ' active' : ''}`}
                  onClick={() => {
                    go(i);
                    setOverview(false);
                  }}
                >
                  <div className="ov-stage">
                    <SlideView slide={s} page={i + 1} pages={slides.length} thumb />
                  </div>
                  <span className="ov-n">{i + 1}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {configOpen && (
        <ConfigPanel
          projects={projects}
          selected={selected}
          client={client}
          withSpecs={withSpecs}
          onClose={() => setConfigOpen(false)}
          onApply={applyConfig}
        />
      )}
    </div>
  );
}

type DeckConfig = { selected: string[]; client: string; withSpecs: boolean };

/** Parámetros de URL de una presentación configurada (se omite lo que está por defecto). */
function configQuery({ selected, client, withSpecs }: DeckConfig, total: number): string {
  const qs = new URLSearchParams();
  if (selected.length !== total) qs.set('p', selected.join(','));
  if (client.trim()) qs.set('cliente', client.trim());
  if (!withSpecs) qs.set('fichas', '0');
  return qs.toString();
}

function ConfigPanel({
  projects,
  selected,
  client,
  withSpecs,
  onClose,
  onApply,
}: {
  projects: Project[];
  selected: string[] | null;
  client: string;
  withSpecs: boolean;
  onClose: () => void;
  onApply: (config: DeckConfig) => void;
}) {
  const [draft, setDraft] = useState<Set<string>>(() => new Set(selected ?? projects.map((p) => p.slug)));
  const [draftClient, setDraftClient] = useState(client);
  const [draftSpecs, setDraftSpecs] = useState(withSpecs);
  const [copied, setCopied] = useState(false);
  const categories = [...new Set(projects.map((p) => p.category).filter((c): c is string => !!c))].sort();
  const ordered = projects.filter((p) => draft.has(p.slug)).map((p) => p.slug);

  const toggle = (slug: string) =>
    setDraft((d) => {
      const n = new Set(d);
      if (n.has(slug)) n.delete(slug);
      else n.add(slug);
      return n;
    });

  const onlyCategory = (cat: string) => setDraft(new Set(projects.filter((p) => p.category === cat).map((p) => p.slug)));

  function copyLink() {
    const qs = configQuery({ selected: ordered, client: draftClient, withSpecs: draftSpecs }, projects.length);
    const url = `${window.location.origin}/presentacion${qs ? `?${qs}` : ''}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="pres-config-backdrop" onClick={onClose}>
      <aside className="pres-config" onClick={(e) => e.stopPropagation()} aria-label="Configurar presentación">
        <div className="pres-config-head">
          <h2>Configurar presentación</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="field">
          <label htmlFor="pres-client">Cliente (aparece en la portada)</label>
          <input
            id="pres-client"
            className="input"
            placeholder="Ej: Municipalidad de Providencia"
            value={draftClient}
            onChange={(e) => setDraftClient(e.target.value)}
          />
        </div>

        <label className="checkbox">
          <input type="checkbox" checked={draftSpecs} onChange={(e) => setDraftSpecs(e.target.checked)} />
          Incluir diapositivas de ficha técnica
        </label>

        <div className="field">
          <label>Proyectos a presentar ({ordered.length})</label>
          <div className="chips" style={{ marginBottom: 6 }}>
            <button className="chip" onClick={() => setDraft(new Set(projects.map((p) => p.slug)))}>
              Todos
            </button>
            <button className="chip" onClick={() => setDraft(new Set())}>
              Ninguno
            </button>
            {categories.map((c) => (
              <button key={c} className="chip" style={colorVars(c)} onClick={() => onlyCategory(c)}>
                Solo {c}
              </button>
            ))}
          </div>
          <div className="pres-config-list">
            {projects.map((p) => (
              <label key={p.id} className="pres-config-item" style={colorVars(p.category)}>
                <input type="checkbox" checked={draft.has(p.slug)} onChange={() => toggle(p.slug)} />
                <span>
                  <strong>{p.title}</strong>
                  <small>{p.category}</small>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="pres-config-actions">
          <button className="btn btn-ghost btn-sm" onClick={copyLink} disabled={!ordered.length}>
            {copied ? '✓ Enlace copiado' : 'Copiar enlace'}
          </button>
          <button className="btn btn-primary" disabled={!ordered.length} onClick={() => onApply({ selected: ordered, client: draftClient, withSpecs: draftSpecs })}>
            Aplicar
          </button>
        </div>
      </aside>
    </div>
  );
}
