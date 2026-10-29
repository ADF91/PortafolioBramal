import type { Metadata } from 'next';
import { Suspense } from 'react';
import Presentation from '@/components/presentation/Presentation';
import { getPublishedProjects } from '@/lib/projects';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Presentación',
  description: 'Presentación del portafolio de proyectos de Bramal.',
};

export default async function PresentationPage() {
  const projects = await getPublishedProjects();
  return (
    <Suspense>
      <Presentation projects={projects} />
    </Suspense>
  );
}
