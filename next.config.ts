import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      // Imágenes subidas desde la administración (Supabase Storage).
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
  // La antigua biblioteca de playlists ahora vive dentro del Portal del Alumno.
  async redirects() {
    return [{ source: '/playlists', destination: '/portal', permanent: false }];
  },
};
export default nextConfig;
