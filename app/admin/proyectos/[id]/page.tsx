'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProjectForm from '@/components/admin/ProjectForm';
import { adminClient } from '@/lib/admin-client';
import type { Project } from '@/lib/types';

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null | undefined>(undefined);

  useEffect(() => {
    adminClient.models.Project.get({ id })
      .then((res) => setProject(res.data ?? null))
      .catch(() => setProject(null));
  }, [id]);

  if (project === undefined) return <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>;
  if (project === null) return <div className="alert alert-error">Proyecto no encontrado.</div>;
  return <ProjectForm project={project} />;
}
