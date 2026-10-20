/** Playlist order and links supplied by Diana Gamboa site requester, Oct 2026. */
export type PlaylistFilter = 'todas' | 'empieza' | 'analisis' | 'profundiza';
export interface DGPlaylist {
  id: string;
  number: string;
  title: string;
  eyebrow: string;
  description: string;
  category: Exclude<PlaylistFilter, 'todas'>;
  categoryLabel: string;
  image: string;
  url: string;
  recommended?: boolean;
  theme: 'gold' | 'emerald' | 'neutral' | 'lime' | 'aqua' | 'light';
}
export const dgPlaylists: DGPlaylist[] = [
  {
    id: 'ojo-pelado', number: '01', title: 'Ojo Pelado | Aprende a Leer el Mercado',
    eyebrow: 'AFINA TU MIRADA',
    description: 'Entrena la observación del precio y comienza a reconocer lo que una gráfica te está mostrando.',
    category: 'empieza', categoryLabel: 'Primeros pasos', image: '/playlists/playlist-01.webp',
    url: 'https://www.youtube.com/watch?v=BvKDWEsfTk0&list=PLHmIgqB9Vfbg', theme: 'gold',
  },
  {
    id: 'proceso-analisis', number: '02', title: 'El Proceso del Análisis',
    eyebrow: 'UN PROCESO, NO UNA CORAZONADA',
    description: 'Explora el razonamiento que hay detrás de una lectura más consciente del gráfico.',
    category: 'analisis', categoryLabel: 'Análisis', image: '/playlists/playlist-02.webp',
    url: 'https://www.youtube.com/watch?v=7p5SL3YJaQc&list=PLIyoxrTDErnQ&pp=0gcJCR4DOCosWNin', theme: 'emerald',
  },
  {
    id: 'antes-del-cierre', number: '03', title: '10 Min Antes del Cierre',
    eyebrow: 'APRENDE A OBSERVAR EL CONTEXTO',
    description: 'Acércate a lecturas del mercado en un momento clave de la sesión y observa cómo se conectan las ideas.',
    category: 'analisis', categoryLabel: 'Análisis', image: '/playlists/playlist-03.webp',
    url: 'https://www.youtube.com/watch?v=xyTE2DWxOMU&list=PLTsiljBk749Q', theme: 'neutral',
  },
  {
    id: 'idioma-mercado', number: '04', title: 'El Idioma del Mercado',
    eyebrow: 'DESCIFRA LO QUE VES',
    description: 'Conoce el lenguaje visual del precio para dar sentido a velas, movimientos y estructuras.',
    category: 'empieza', categoryLabel: 'Primeros pasos', image: '/playlists/playlist-04.webp',
    url: 'https://www.youtube.com/watch?v=1SkHApSmlQI&list=PLH3nzRRh6cOY', theme: 'gold',
  },
  {
    id: 'grafica-accion', number: '05', title: 'Temporada 2: De la Gráfica a la Acción',
    eyebrow: 'PROFUNDIZA EN EL RAZONAMIENTO',
    description: 'Una serie para seguir ejercitando la interpretación y convertir observaciones en preguntas mejor fundamentadas.',
    category: 'profundiza', categoryLabel: 'Profundiza', image: '/playlists/playlist-05.webp',
    url: 'https://www.youtube.com/watch?v=2kigaPEMwGE&list=PLPVYGJqt-RY5w8pyz8vARkwUD9i8fglV-', theme: 'emerald',
  },
  {
    id: 'grafica-desde-cero', number: '06', title: 'Aprende a Leer una Gráfica desde Cero — Curso Gratis',
    eyebrow: 'TU PRIMERA CLASE EMPIEZA AQUÍ',
    description: 'La ruta recomendada para comenzar desde lo esencial: familiarízate con las gráficas y desarrolla una base de lectura propia.',
    category: 'empieza', categoryLabel: 'Primeros pasos', image: '/playlists/playlist-06.webp',
    url: 'https://www.youtube.com/watch?v=S4k6Aa8I1EY&list=PLPVYGJqt-RY7xoxa9Aze4H1OdHMoZbur4', recommended: true, theme: 'neutral',
  },
];
