'use client';

import '@aws-amplify/ui-react/styles.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Authenticator, translations } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { I18n } from 'aws-amplify/utils';

I18n.putVocabularies(translations);
I18n.setLanguage('es');

function AdminGate({ children, signOut, email }: { children: React.ReactNode; signOut?: () => void; email?: string }) {
  const [state, setState] = useState<'loading' | 'ok' | 'denied'>('loading');

  useEffect(() => {
    fetchAuthSession()
      .then((s) => {
        const groups = s.tokens?.accessToken.payload['cognito:groups'];
        setState(Array.isArray(groups) && groups.includes('ADMINS') ? 'ok' : 'denied');
      })
      .catch(() => setState('denied'));
  }, []);

  return (
    <div className="admin-shell">
      <header className="admin-bar">
        <div className="container">
          <Link href="/admin" className="admin-brand">
            Bramal <span>Admin</span>
          </Link>
          <nav>
            <Link href="/admin">Proyectos</Link>
            <Link href="/admin/proyectos/nuevo">Nuevo</Link>
            <a href="/presentacion" target="_blank" rel="noopener noreferrer">
              ▶ Presentación
            </a>
            <a href="/" target="_blank" rel="noopener noreferrer">
              Ver sitio ↗
            </a>
            <span className="hide-sm" style={{ color: 'var(--text-faint)' }}>
              {email}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={signOut}>
              Salir
            </button>
          </nav>
        </div>
      </header>
      <main className="admin-main">
        <div className="container">
          {state === 'loading' && <p style={{ color: 'var(--text-muted)' }}>Verificando permisos…</p>}
          {state === 'denied' && (
            <div className="center-screen">
              <div>
                <h1 style={{ fontSize: 28, marginBottom: 8 }}>Acceso restringido</h1>
                <p style={{ color: 'var(--text-muted)' }}>
                  Tu usuario no pertenece al grupo de administradores (ADMINS).
                </p>
              </div>
            </div>
          )}
          {state === 'ok' && children}
        </div>
      </main>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <Authenticator hideSignUp>
      {({ signOut, user }) => (
        <AdminGate signOut={signOut} email={user?.signInDetails?.loginId}>
          {children}
        </AdminGate>
      )}
    </Authenticator>
  );
}
