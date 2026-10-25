/**
 * Contenido de la academia Diana Gamboa.
 * Todo lo editable (series, horarios, recursos, cursos) vive aquí para que el portal
 * pueda crecer sin tocar los componentes.
 */

export const YOUTUBE = 'https://www.youtube.com/@DianaGamboaMomentum';
export const YOUTUBE_MEMBERSHIP = 'https://www.youtube.com/@DianaGamboaMomentum/join';
export const INSTAGRAM = 'https://www.instagram.com/dianagamboamomentum/';

export interface Serie {
  title: string;
  description: string;
  /** Enlace original de YouTube (video + lista). */
  url: string;
}

export interface Recurso {
  title: string;
  description: string;
  format: string;
  /** Ruta del archivo en /public. Si no existe todavía, se muestra «Próximamente». */
  file?: string;
}

export interface SeccionRuta {
  slug: string;
  number: string;
  title: string;
  summary: string;
  intro: string;
  icon: 'grafica' | 'accion' | 'metodo' | 'proceso' | 'lives' | 'biblioteca';
  series: Serie[];
  /** Incluye el laboratorio interactivo de lectura de gráficas. */
  lab?: boolean;
  /** Incluye la programación de transmisiones. */
  schedule?: boolean;
  /** Incluye la lista de recursos descargables. */
  resources?: boolean;
}

/* Las series provienen de las playlists ya compartidas. La asignación a cada sección es
   provisional hasta recibir los nombres definitivos de las series. */
export const ruta: SeccionRuta[] = [
  {
    slug: 'leer-una-grafica',
    number: '01',
    title: 'Cómo leer una gráfica desde cero',
    summary: 'Conoce los elementos de una gráfica y aprende a interpretarlos.',
    intro: 'Tu punto de partida. Aquí aprenderás qué muestra una gráfica, cómo se forman las velas y qué preguntas hacerte antes de sacar conclusiones.',
    icon: 'grafica',
    lab: true,
    series: [
      {
        title: 'Aprende a leer una gráfica desde cero',
        description: 'La serie recomendada para comenzar: velas, tendencias y estructura del precio, sin conocimientos previos.',
        url: 'https://www.youtube.com/watch?v=S4k6Aa8I1EY&list=PLPVYGJqt-RY7xoxa9Aze4H1OdHMoZbur4',
      },
    ],
  },
  {
    slug: 'de-la-grafica-a-la-accion',
    number: '02',
    title: 'De la Gráfica a la Acción',
    summary: 'Traduce lo que observas en un razonamiento claro y ordenado.',
    intro: 'Aprende a convertir tus observaciones en preguntas mejor fundamentadas, antes de pensar en cualquier decisión.',
    icon: 'accion',
    series: [
      {
        title: 'Temporada 2: De la Gráfica a la Acción',
        description: 'Episodios para seguir ejercitando la interpretación del precio paso a paso.',
        url: 'https://www.youtube.com/watch?v=2kigaPEMwGE&list=PLPVYGJqt-RY5w8pyz8vARkwUD9i8fglV-',
      },
    ],
  },
  {
    slug: 'metodo-diana-gamboa',
    number: '03',
    title: 'Método Diana Gamboa',
    summary: 'El idioma del mercado: velas, tendencias y comportamiento del precio.',
    intro: 'La forma en que Diana lee el mercado: observar, interpretar, poner en contexto y construir tu propio criterio.',
    icon: 'metodo',
    series: [
      {
        title: 'El Idioma del Mercado',
        description: 'Conoce el lenguaje visual del precio para dar sentido a velas, movimientos y estructuras.',
        url: 'https://www.youtube.com/watch?v=1SkHApSmlQI',
      },
    ],
  },
  {
    slug: 'proceso-de-analisis',
    number: '04',
    title: 'El Proceso de Análisis',
    summary: 'Sigue un orden para leer la gráfica y construir conclusiones.',
    intro: 'Un análisis no es una corazonada. Aquí verás el orden que sigue Diana para estudiar una compañía y llegar a conclusiones propias.',
    icon: 'proceso',
    series: [
      {
        title: 'El Proceso del Análisis',
        description: 'El razonamiento que hay detrás de una lectura consciente del gráfico.',
        url: 'https://www.youtube.com/watch?v=7p5SL3YJaQc',
      },
    ],
  },
  {
    slug: 'lives',
    number: '05',
    title: 'Lives gratuitos de YouTube',
    summary: 'Acompaña a Diana en sus análisis en vivo y vuelve a ver las transmisiones.',
    intro: 'Consulta la programación en tu hora local y vuelve a ver las transmisiones anteriores cuando quieras.',
    icon: 'lives',
    schedule: true,
    series: [
      {
        title: '10 Min Antes del Cierre',
        description: 'Lecturas del mercado en un momento clave de la sesión.',
        url: 'https://www.youtube.com/watch?v=xyTE2DWxOMU',
      },
      {
        title: 'Ojo Pelado | Aprende a Leer el Mercado',
        description: 'Entrena la observación del precio y reconoce lo que te muestra la gráfica.',
        url: 'https://www.youtube.com/watch?v=BvKDWEsfTk0',
      },
    ],
  },
  {
    slug: 'biblioteca',
    number: '06',
    title: 'Biblioteca de Recursos',
    summary: 'Descarga hojas de práctica, guías y tu documento del Proceso de Análisis.',
    intro: 'Todos tus materiales descargables en un solo lugar. Iremos sumando nuevas guías a medida que avances.',
    icon: 'biblioteca',
    resources: true,
    series: [],
  },
];

export const recursos: Recurso[] = [
  { title: 'Hoja del Proceso de Análisis', description: 'Tu guía de bienvenida para analizar una gráfica paso a paso.', format: 'PDF' },
  { title: 'Hoja de práctica: lectura de velas', description: 'Ejercicios para identificar apertura, cierre, máximos y mínimos.', format: 'PDF' },
  { title: 'Glosario del idioma del mercado', description: 'Los términos esenciales explicados de forma sencilla.', format: 'PDF' },
];

export interface Transmision {
  title: string;
  /** 0 = domingo … 6 = sábado */
  days: number[];
  /** Hora de Nueva York (ET), formato 24 h. */
  time: string;
}

/* PROVISIONAL: horarios anteriores. Reemplazar con la programación definitiva de Diana. */
export const programacion: Transmision[] = [
  { title: 'Live de análisis del mercado', days: [1, 3, 5], time: '15:45' },
  { title: 'Nuevo episodio: Método Diana Gamboa', days: [3], time: '16:00' },
  { title: 'Nuevo episodio: De la Gráfica a la Acción', days: [6], time: '16:00' },
];

export const formacion = [
  {
    key: 'salon',
    title: 'Salón Diana Gamboa',
    tag: 'Membresía mensual',
    description: 'Dos clases privadas en vivo al mes para practicar juntos el análisis de diferentes compañías, con materiales de apoyo y hojas de práctica descargables.',
    cta: 'Conocer la membresía',
    href: YOUTUBE_MEMBERSHIP,
  },
  {
    key: 'cursos',
    title: 'Cursos Diana Gamboa',
    tag: 'Compra individual',
    description: 'Programas especializados de formación, comenzando con Estrategia Diana Gamboa. Módulos, lecciones cortas y materiales descargables.',
    cta: 'Próximamente',
    href: undefined,
  },
] as const;

/** Extrae el id de video y, si es completo, el id de la lista de un enlace de YouTube. */
export function parseYouTube(url: string) {
  const u = new URL(url);
  const list = u.searchParams.get('list');
  // Los ids de lista válidos tienen 34 caracteres; los recortados se ignoran.
  return { videoId: u.searchParams.get('v') ?? '', listId: list && list.length >= 24 ? list : undefined };
}
