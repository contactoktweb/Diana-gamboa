import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'i.ytimg.com' }] },
  // La antigua biblioteca de playlists ahora vive dentro del Portal del Alumno.
  async redirects() {
    return [{ source: '/playlists', destination: '/portal', permanent: false }];
  },
};
export default nextConfig;
