import type { Metadata } from 'next';
import PlaylistsSite from '@/components/PlaylistsSite';

export const metadata: Metadata = {
  title: 'Playlists | Diana Gamboa — Aprende a leer el mercado',
  description: 'Explora las seis playlists oficiales de Diana Gamboa, desde la lectura de gráficas para principiantes hasta el proceso del análisis y la interpretación del mercado.',
};

export default function PlaylistsPage() { return <PlaylistsSite/>; }
