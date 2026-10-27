/**
 * Contenido de la academia Diana Gamboa.
 * Todo lo editable (series, recursos, membresía, cursos) vive aquí para que el portal
 * pueda crecer sin tocar los componentes.
 */

export const YOUTUBE = 'https://www.youtube.com/@DianaGamboaMomentum';
/** Sección de transmisiones (próximas y anteriores) del canal. */
export const YOUTUBE_LIVES = 'https://www.youtube.com/@DianaGamboaMomentum/streams';
export const INSTAGRAM = 'https://www.instagram.com/dianagamboamomentum/';

/** Enlace oficial de la membresía del Salón. Mientras sea `undefined` se muestra «Próximamente». */
export const SALON_URL: string | undefined = undefined;

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
  /** Ruta del archivo en /public (por ejemplo '/recursos/proceso-de-analisis.pdf').
      Si no está definida, la tarjeta muestra «Próximamente». */
  file?: string;
}

export interface SeccionRuta {
  slug: string;
  number: string;
  title: string;
  summary: string;
  intro: string;
  /** Título de la página de la sección, si es distinto del de la tarjeta. */
  heading?: string;
  icon: 'grafica' | 'accion' | 'metodo' | 'proceso' | 'lives' | 'biblioteca';
  /** 'serie': serie educativa. 'complemento': lives y biblioteca. */
  kind: 'serie' | 'complemento';
  /** Texto del botón de la tarjeta en el portal. */
  cta: string;
  series: Serie[];
  /** Incluye el laboratorio interactivo de lectura de gráficas. */
  lab?: boolean;
  /** Muestra la invitación a las transmisiones de YouTube. */
  lives?: boolean;
  /** Incluye la lista de recursos descargables. */
  resources?: boolean;
}

/* Las series provienen de las playlists ya compartidas. */
export const ruta: SeccionRuta[] = [
  {
    slug: 'leer-una-grafica',
    number: '01',
    title: 'Cómo leer una gráfica desde cero',
    summary: 'Conoce los elementos de una gráfica y comienza a comprender cómo se mueve el precio.',
    intro: 'Tu punto de partida. Aquí aprenderás qué muestra una gráfica, cómo se forman las velas y qué observar antes de sacar conclusiones.',
    icon: 'grafica',
    kind: 'serie',
    cta: 'Ver clases',
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
    summary: 'Aprende a relacionar lo que observas en una gráfica con las preguntas y decisiones que forman parte del análisis.',
    intro: 'Relaciona lo que observas en una gráfica con las preguntas y decisiones que forman parte del análisis.',
    icon: 'accion',
    kind: 'serie',
    cta: 'Ver clases',
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
    summary: 'Aprende el idioma del mercado: velas, medias móviles, tendencias y otras herramientas para comprender el comportamiento del precio.',
    intro: 'El idioma del mercado pieza por pieza: velas, medias móviles, tendencias y otras herramientas para comprender el comportamiento del precio.',
    icon: 'metodo',
    kind: 'serie',
    cta: 'Ver clases',
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
    summary: 'Aprende a seguir un orden para observar una gráfica, reunir información y construir tus propias conclusiones.',
    intro: 'Un orden para observar una gráfica, reunir información y construir tus propias conclusiones.',
    icon: 'proceso',
    kind: 'serie',
    cta: 'Ver clases',
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
    title: 'Lives gratuitos en YouTube',
    summary: 'Acompáñame en mis transmisiones para observar y analizar el mercado.',
    intro: 'Acompáñame a leer y analizar el mercado en vivo.',
    icon: 'lives',
    kind: 'complemento',
    cta: 'Ver lives',
    lives: true,
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
    heading: 'Tu biblioteca de recursos',
    summary: 'Encuentra guías y hojas de práctica para repasar y reforzar lo aprendido.',
    intro: 'Aquí encontrarás materiales para practicar, repasar y reforzar lo aprendido en las clases. Puedes descargarlos y utilizarlos a tu propio ritmo.',
    icon: 'biblioteca',
    kind: 'complemento',
    cta: 'Ver recursos',
    resources: true,
    series: [],
  },
];

/* Para publicar un recurso: copiar el PDF en /public/recursos y añadir su ruta en `file`.
   El primero es también el regalo de bienvenida del portal. */
export const recursos: Recurso[] = [
  { title: 'Hoja del Proceso de Análisis', description: 'Una guía para organizar tu análisis y recordar qué observar cuando te sientas frente a una gráfica.', format: 'PDF' },
  { title: 'Hoja de práctica: lectura de velas', description: 'Ejercicios para reconocer la apertura, el cierre, el máximo y el mínimo de las velas alcistas y bajistas.', format: 'PDF' },
  { title: 'Glosario del idioma del mercado', description: 'Las palabras y herramientas que utilizamos en nuestras clases, explicadas de manera sencilla.', format: 'PDF' },
];

/** Extrae el id de video y, si es completo, el id de la lista de un enlace de YouTube. */
export function parseYouTube(url: string) {
  const u = new URL(url);
  const list = u.searchParams.get('list');
  // Los ids de lista válidos tienen 34 caracteres; los recortados se ignoran.
  return { videoId: u.searchParams.get('v') ?? '', listId: list && list.length >= 24 ? list : undefined };
}
