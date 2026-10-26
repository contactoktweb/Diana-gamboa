import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';

/* Tipografías del manual de marca, servidas desde el propio sitio. */
const centuryGothic = localFont({
  src: [
    { path: './fonts/CenturyGothic-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/CenturyGothic-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-century',
  display: 'swap',
  fallback: ['Poppins', 'system-ui', 'sans-serif'],
});
const meshitara = localFont({
  src: './fonts/MeshitaraSans-Regular.woff2',
  variable: '--font-meshitara',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'Diana Gamboa | Aprende a leer el idioma del mercado',
  description: 'Academia de educación bursátil de Diana Gamboa. Clases gratuitas organizadas, lives de análisis y recursos para desarrollar tu propio criterio.',
  applicationName: 'Diana Gamboa — Academia',
  openGraph: {
    title: 'Diana Gamboa — Aprende a leer el idioma del mercado',
    description: 'Regístrate gratis y sigue una ruta de aprendizaje clara, desde los fundamentos hasta una formación especializada.',
    type: 'website', locale: 'es_CO',
    images: [{ url: '/diana-borgona.webp', alt: 'Diana Gamboa, analista de mercados bursátiles' }],
  },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0B3D2E' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" className={`${centuryGothic.variable} ${meshitara.variable}`}><body>{children}</body></html>;
}
