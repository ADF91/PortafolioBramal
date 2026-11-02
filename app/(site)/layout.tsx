import Link from 'next/link';
import { site } from '@/lib/site';
import SocialLinks from '@/components/SocialLinks';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="site-header">
        <div className="container">
          <Link href="/" className="logo" aria-label="Bramal - inicio">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.logo} alt="Bramal" />
          </Link>
          <nav className="site-nav">
            <Link href="/#proyectos">Proyectos</Link>
            <Link href="/#nosotros" className="hide-sm">
              Nosotros
            </Link>
            <Link href="/#contacto" className="hide-sm">
              Contacto
            </Link>
            <Link href="/presentacion" className="btn btn-primary btn-sm">
              Presentación
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={site.logo} alt="Bramal" className="logo-negative" />
              <p>Soluciones tecnológicas para ciudades más seguras, eficientes y conectadas.</p>
            </div>
            <div className="footer-col">
              <h4>Portafolio</h4>
              <Link href="/#proyectos">Proyectos</Link>
              <Link href="/presentacion">Presentación</Link>
            </div>
            <div className="footer-col">
              <h4>Empresa</h4>
              <Link href="/#nosotros">Nosotros</Link>
              <Link href="/#contacto">Contacto</Link>
            </div>
            <div className="footer-col">
              <h4>Síganos</h4>
              <SocialLinks />
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Bramal. Todos los derechos reservados.</span>
            <span>Diseñada por Antonio Donat Fuentes</span>
          </div>
        </div>
      </footer>
    </>
  );
}
