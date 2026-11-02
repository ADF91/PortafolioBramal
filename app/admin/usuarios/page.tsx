'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAdminSession } from '@/components/admin/AdminShell';
import { listPanelUsers, manageUser, ROLE_LABELS, type PanelUser, type Role } from '@/lib/admin-client';

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Activo',
  FORCE_CHANGE_PASSWORD: 'Invitación pendiente',
  RESET_REQUIRED: 'Debe cambiar contraseña',
  UNCONFIRMED: 'Sin confirmar',
};

export default function UsersPage() {
  const { username: me } = useAdminSession();
  const [users, setUsers] = useState<PanelUser[] | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('EDITORS');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      const list = await listPanelUsers();
      setUsers(list.sort((a, b) => a.email.localeCompare(b.email)));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(action: () => Promise<void>, ok: string) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await action();
      await load();
      setNotice(ok);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function create(e: React.FormEvent) {
    e.preventDefault();
    const address = email.trim().toLowerCase();
    run(async () => {
      await manageUser({ action: 'create', email: address, role });
      setEmail('');
    }, `Usuario creado. ${address} recibirá un correo con su contraseña temporal.`);
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Usuarios</h1>
          <p>Personas con acceso al panel. Los editores gestionan proyectos y archivos; los administradores, además, usuarios.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-ok">{notice}</div>}

      <section className="panel">
        <h2>Nuevo usuario</h2>
        <form className="user-form" onSubmit={create}>
          <div className="field">
            <label htmlFor="user-email">Email</label>
            <input
              id="user-email"
              className="input"
              type="email"
              required
              placeholder="nombre@bramal.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="user-role">Rol</label>
            <select id="user-role" className="select" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="EDITORS">Editor — proyectos, videos e imágenes</option>
              <option value="ADMINS">Administrador — además gestiona usuarios</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={busy || !email.trim()}>
            Crear e invitar
          </button>
        </form>
        <p className="hint" style={{ marginTop: 12, fontSize: 13, color: 'var(--text-faint)' }}>
          La persona recibe un correo con una contraseña temporal y la cambia en su primer ingreso a /admin.
        </p>
      </section>

      <section className="panel">
        <h2>Usuarios con acceso</h2>
        {users === null ? (
          <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>
        ) : users.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No hay usuarios.</p>
        ) : (
          <div className="user-rows">
            {users.map((u) => {
              const isMe = u.username === me;
              return (
                <div key={u.username} className={`user-row${u.enabled ? '' : ' is-disabled'}`}>
                  <div style={{ minWidth: 0 }}>
                    <strong>
                      {u.email}
                      {isMe && <span className="user-me"> (tú)</span>}
                    </strong>
                    <div className="meta">
                      <span className={`status ${u.enabled ? 'status-pub' : 'status-draft'}`}>
                        {u.enabled ? STATUS_LABELS[u.status] ?? u.status : 'Desactivado'}
                      </span>
                      {u.createdAt && <span>· Creado el {new Date(u.createdAt).toLocaleDateString('es-CL')}</span>}
                    </div>
                  </div>
                  <div className="row-actions">
                    <select
                      className="select"
                      style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
                      value={u.role ?? ''}
                      disabled={busy || isMe}
                      title={isMe ? 'No puedes cambiar tu propio rol' : 'Cambiar rol'}
                      onChange={(e) =>
                        run(
                          () => manageUser({ action: 'setRole', username: u.username, role: e.target.value as Role }),
                          `Rol de ${u.email} actualizado.`,
                        )
                      }
                    >
                      {!u.role && <option value="">Sin rol</option>}
                      <option value="EDITORS">{ROLE_LABELS.EDITORS}</option>
                      <option value="ADMINS">{ROLE_LABELS.ADMINS}</option>
                    </select>
                    {!isMe && (
                      <>
                        <button
                          className="btn btn-ghost btn-sm"
                          disabled={busy}
                          onClick={() =>
                            run(
                              () => manageUser({ action: u.enabled ? 'disable' : 'enable', username: u.username }),
                              `${u.email} ${u.enabled ? 'desactivado' : 'reactivado'}.`,
                            )
                          }
                        >
                          {u.enabled ? 'Desactivar' : 'Reactivar'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={busy}
                          onClick={() => {
                            if (!confirm(`¿Eliminar el acceso de ${u.email}?`)) return;
                            run(() => manageUser({ action: 'delete', username: u.username }), `${u.email} eliminado.`);
                          }}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
