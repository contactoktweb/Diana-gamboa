import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Script from 'next/script';
import HeaderShadow from '@/components/HeaderShadow';
import { getContenido } from '@/lib/contenido';

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

/** Dirección pública de la web (para las imágenes al compartir enlaces). */
function urlSitio() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  return url ? new URL(url) : undefined;
}

export async function generateMetadata(): Promise<Metadata> {
  const { global: g } = await getContenido();
  return {
    title: g.seoTitulo,
    description: g.seoDescripcion,
    applicationName: `${g.nombreSitio} — Academia`,
    metadataBase: urlSitio(),
    openGraph: { title: g.seoTitulo, description: g.seoDescripcion, type: 'website', locale: 'es_CO', images: [{ url: g.seoImagen, alt: g.nombreSitio }] },
    robots: { index: true, follow: true },
  };
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0B3D2E' };
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { global: g } = await getContenido();
  const clarity = /^[a-z0-9]{6,20}$/i.test(g.clarityId.trim()) ? g.clarityId.trim() : '';
  return <html lang="es" className={`${centuryGothic.variable} ${meshitara.variable}`}><body>
    <HeaderShadow />{children}
    {/* Microsoft Clarity: solo si la administración configuró su código. */}
    {clarity && <Script id="clarity" strategy="afterInteractive">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarity}");`}</Script>}
  </body></html>;
}
