import type { Metadata } from 'next';
import { Inter, Jost } from 'next/font/google';
import ConfigureAmplify from '@/components/ConfigureAmplify';
import { site } from '@/lib/site';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
// Geométrica tipo Futura: armoniza con la tipografía del lema "Mejorando Ciudades" del logo.
const jost = Jost({ subsets: ['latin'], variable: '--font-heading', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://portafolio.bramal.cl'),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: { type: 'website', locale: 'es_CL', siteName: site.name },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${jost.variable}`}>
      <body>
        <ConfigureAmplify />
        {children}
      </body>
    </html>
  );
}
