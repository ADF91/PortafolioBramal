'use client';

import '@aws-amplify/ui-react/styles.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { Authenticator, translations } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { I18n } from 'aws-amplify/utils';
import { ROLE_LABELS, type Role } from '@/lib/admin-client';

I18n.putVocabularies(translations);
I18n.setLanguage('es');

type Session = { role: Role; username: string };

const SessionContext = createContext<Session | null>(null);

/** Rol y usuario de quien está conectado al panel. */
export function useAdminSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useAdminSession debe usarse dentro de AdminShell');
  return session;
}

function AdminGate({ children, signOut, email }: { children: React.ReactNode; signOut?: () => void; email?: string }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const pathname = usePathname();

  useEffect(() => {
    fetchAuthSession()
      .then((s) => {
        const payload = s.tokens?.accessToken.payload;
        const groups = Array.isArray(payload?.['cognito:groups']) ? (payload['cognito:groups'] as string[]) : [];
        const role: Role | null = groups.includes('ADMINS') ? 'ADMINS' : groups.includes('EDITORS') ? 'EDITORS' : null;
        setSession(role ? { role, username: String(payload?.username ?? '') } : null);
      })
      .catch(() => setSession(null));
  }, []);

  const adminOnly = pathname.startsWith('/admin/usuarios');

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
            {session?.role === 'ADMINS' && <Link href="/admin/usuarios">Usuarios</Link>}
            <a href="/presentacion" target="_blank" rel="noopener noreferrer">
              Presentación
            </a>
            <a href="/" target="_blank" rel="noopener noreferrer">
              Ver sitio ↗
            </a>
            <span className="hide-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {email}
              {session ? ` · ${ROLE_LABELS[session.role]}` : ''}
            </span>
            <button className="btn btn-sm" onClick={signOut}>
              Salir
            </button>
          </nav>
        </div>
      </header>
      <main className="admin-main">
        <div className="container">
          {session === undefined && <p style={{ color: 'var(--text-muted)' }}>Verificando permisos…</p>}
          {(session === null || (adminOnly && session?.role !== 'ADMINS')) && (
            <div className="center-screen">
              <div>
                <h1 style={{ fontSize: 28, marginBottom: 8 }}>Acceso restringido</h1>
                <p style={{ color: 'var(--text-muted)' }}>
                  {session
                    ? 'Esta sección es sólo para administradores.'
                    : 'Tu usuario no tiene un rol asignado. Pide a un administrador que te asigne uno.'}
                </p>
              </div>
            </div>
          )}
          {session && !(adminOnly && session.role !== 'ADMINS') && (
            <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
          )}
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
