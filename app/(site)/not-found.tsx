import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="center-screen">
      <div>
        <h1 style={{ fontSize: 40, marginBottom: 12 }}>Página no encontrada</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          El proyecto que buscas no existe o fue retirado.
        </p>
        <Link href="/#proyectos" className="btn btn-primary">
          Ver proyectos
        </Link>
      </div>
    </div>
  );
}
