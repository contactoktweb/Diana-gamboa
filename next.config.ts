import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Comprobantes de pago (el navegador reduce las fotos; Vercel admite hasta ~4,5 MB por envío).
  experimental: { serverActions: { bodySizeLimit: '5mb' } },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      // Imágenes subidas desde la administración (Supabase Storage).
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
  // La antigua biblioteca de playlists ahora vive dentro del Portal del Alumno.
  async redirects() {
    return [
      { source: '/playlists', destination: '/portal', permanent: false },
      // Enlace corto del taller para el live y para Instagram.
      { source: '/taller', destination: '/portal/eventos/call-o-put', permanent: false },
    ];
  },
};
export default nextConfig;
