import type { Metadata, Viewport } from 'next';
import './globals.css';
import SiteIntro from '@/components/SiteIntro';

export const metadata: Metadata = {
  title: 'Diana Gamboa | Aprende a leer el mercado',
  description: 'Diana Gamboa es analista bursátil y especialista en acciones y opciones. Aprende a interpretar velas, tendencias, soportes, resistencias y contexto sin copiar señales.',
  applicationName: 'Diana Gamboa — Educación bursátil',
  openGraph: {
    title: 'Diana Gamboa — El mercado no se adivina. Se aprende a leer.',
    description: 'Aprende a leer gráficos desde cero. Sin señales para copiar: análisis, contexto y criterio propio.',
    type: 'website', locale: 'es_CO',
    images: [{url:'/diana-borgona.webp',alt:'Diana Gamboa, analista de mercados bursátiles'}],
  },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = {width:'device-width',initialScale:1,themeColor:'#0B3D2E'};
export default function RootLayout({children}: Readonly<{children:React.ReactNode}>) {
  return <html lang="es"><body><SiteIntro />{children}</body></html>;
}
