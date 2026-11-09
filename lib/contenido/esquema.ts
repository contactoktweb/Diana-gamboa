/**
 * Formularios de la administración: qué campos tiene cada sección del contenido,
 * con sus nombres y ayudas para la persona que edita.
 */
import type { NombreSeccion } from './predeterminado';

export type TipoCampo = 'texto' | 'parrafos' | 'largo' | 'url' | 'correo' | 'imagen' | 'archivo' | 'booleano' | 'opciones' | 'lista' | 'titulo';

export interface Campo {
  clave: string;
  etiqueta: string;
  tipo: TipoCampo;
  ayuda?: string;
  opciones?: { valor: string; etiqueta: string }[];
  /** Para listas: campos de cada elemento. */
  campos?: Campo[];
  /** Para listas: nombre de cada elemento («Video», «Recurso»…). */
  elemento?: string;
  /** Para listas: campo que se usa como título del elemento. */
  tituloDe?: string;
  /** Campo que no se puede editar (identificadores). */
  soloLectura?: boolean;
  /** Mostrar solo cuando otro campo del mismo elemento tiene uno de estos valores. */
  mostrarSi?: { clave: string; valores: string[] };
}

export interface DefSeccion { id: NombreSeccion; titulo: string; descripcion: string; ver: string; campos: Campo[] }

export const ICONOS = [
  { valor: 'grafica', etiqueta: 'Gráfica de velas' }, { valor: 'analizar', etiqueta: 'Análisis (barras)' },
  { valor: 'criterio', etiqueta: 'Brújula (criterio)' }, { valor: 'clases', etiqueta: 'Libro (clases)' },
  { valor: 'ruta', etiqueta: 'Ruta' }, { valor: 'lives', etiqueta: 'Transmisión en vivo' },
  { valor: 'biblioteca', etiqueta: 'Carpeta de descargas' }, { valor: 'salon', etiqueta: 'Personas (salón)' },
  { valor: 'cursos', etiqueta: 'Birrete (cursos)' }, { valor: 'accion', etiqueta: 'Objetivo (acción)' },
  { valor: 'metodo', etiqueta: 'Libro abierto (método)' }, { valor: 'proceso', etiqueta: 'Lista (proceso)' },
];

const FORMATO = 'Separa los párrafos con una línea en blanco. Escribe **así** para poner una palabra en negrita.';

export const SECCIONES: DefSeccion[] = [
  {
    id: 'global', titulo: 'Información general', ver: '/',
    descripcion: 'Logos, redes sociales, contacto, botón principal, pie de página y datos para Google.',
    campos: [
      { clave: '', etiqueta: 'Marca', tipo: 'titulo' },
      { clave: 'nombreSitio', etiqueta: 'Nombre de la academia', tipo: 'texto' },
      { clave: 'logo', etiqueta: 'Logo (fondos claros)', tipo: 'imagen', ayuda: 'PNG o SVG con fondo transparente. Se muestra en el encabezado.' },
      { clave: 'logoClaro', etiqueta: 'Logo en negativo (fondos verdes)', tipo: 'imagen', ayuda: 'Versión clara del logo para el pie de página.' },
      { clave: 'botonPrincipal', etiqueta: 'Texto del botón principal de registro', tipo: 'texto', ayuda: 'Aparece en el encabezado y en todos los botones de registro.' },
      { clave: 'notaBoton', etiqueta: 'Nota debajo del botón de registro', tipo: 'texto' },
      { clave: '', etiqueta: 'Contacto y redes oficiales', tipo: 'titulo' },
      { clave: 'correoContacto', etiqueta: 'Correo de contacto', tipo: 'correo', ayuda: 'Si lo dejas vacío, «Contacto» lleva a Instagram.' },
      { clave: 'youtube', etiqueta: 'Enlace del canal de YouTube', tipo: 'url' },
      { clave: 'youtubeUsuario', etiqueta: 'Usuario de YouTube', tipo: 'texto' },
      { clave: 'youtubeLives', etiqueta: 'Enlace de los lives (transmisiones)', tipo: 'url' },
      { clave: 'instagram', etiqueta: 'Enlace de Instagram', tipo: 'url' },
      { clave: 'instagramUsuario', etiqueta: 'Usuario de Instagram', tipo: 'texto' },
      { clave: '', etiqueta: 'Pie de página', tipo: 'titulo' },
      { clave: 'pieFrase', etiqueta: 'Frase del pie de página', tipo: 'texto' },
      { clave: 'avisoEducativo', etiqueta: 'Aviso educativo', tipo: 'parrafos' },
      { clave: '', etiqueta: 'Google y redes sociales (SEO)', tipo: 'titulo' },
      { clave: 'seoTitulo', etiqueta: 'Título en Google', tipo: 'texto' },
      { clave: 'seoDescripcion', etiqueta: 'Descripción en Google', tipo: 'parrafos' },
      { clave: 'seoImagen', etiqueta: 'Imagen al compartir el enlace', tipo: 'imagen' },
      { clave: '', etiqueta: 'Estadísticas de navegación', tipo: 'titulo' },
      { clave: 'clarityId', etiqueta: 'Código de Microsoft Clarity', tipo: 'texto', ayuda: 'Opcional. Copia el identificador del proyecto en clarity.microsoft.com (por ejemplo «abcd1234xy»). Vacío = desactivado.' },
    ],
  },
  {
    id: 'inicio', titulo: 'Página principal', ver: '/',
    descripcion: 'Portada, qué vas a aprender, El Reto, presentación de Diana, espacios de la academia, invitación y aviso de estafas.',
    campos: [
      { clave: '', etiqueta: 'Portada', tipo: 'titulo' },
      { clave: 'heroEtiqueta', etiqueta: 'Etiqueta superior', tipo: 'texto' },
      { clave: 'heroTitulo', etiqueta: 'Título (primera parte)', tipo: 'texto' },
      { clave: 'heroTituloDestacado', etiqueta: 'Título (parte destacada en verde)', tipo: 'texto' },
      { clave: 'heroTexto', etiqueta: 'Texto de apoyo', tipo: 'parrafos' },
      { clave: 'heroFraseTitulo', etiqueta: 'Frase destacada', tipo: 'texto' },
      { clave: 'heroFrase', etiqueta: 'Texto debajo de la frase', tipo: 'texto', ayuda: FORMATO },
      { clave: 'heroFoto', etiqueta: 'Fotografía principal', tipo: 'imagen', ayuda: 'Ideal: recorte de Diana sin fondo (PNG o WebP transparente).' },
      { clave: '', etiqueta: '¿Qué vas a aprender conmigo?', tipo: 'titulo' },
      { clave: 'aprenderEtiqueta', etiqueta: 'Etiqueta', tipo: 'texto' },
      { clave: 'aprenderTitulo', etiqueta: 'Título', tipo: 'texto' },
      { clave: 'aprenderTexto', etiqueta: 'Texto introductorio', tipo: 'parrafos', ayuda: FORMATO },
      { clave: 'aprenderAcento', etiqueta: 'Frase final (en verde)', tipo: 'texto' },
      { clave: 'aprenderFoto', etiqueta: 'Fotografía', tipo: 'imagen' },
      { clave: 'aprendizajes', etiqueta: 'Contenidos', tipo: 'lista', elemento: 'Contenido', tituloDe: 'titulo', campos: [
        { clave: 'titulo', etiqueta: 'Título', tipo: 'texto' },
        { clave: 'texto', etiqueta: 'Descripción', tipo: 'parrafos' },
        { clave: 'icono', etiqueta: 'Ícono', tipo: 'opciones', opciones: ICONOS },
      ] },
      { clave: '', etiqueta: 'El Reto de la Gráfica', tipo: 'titulo' },
      { clave: 'retoMostrar', etiqueta: 'Mostrar la invitación al Reto', tipo: 'booleano' },
      { clave: 'retoEtiqueta', etiqueta: 'Etiqueta', tipo: 'texto' },
      { clave: 'retoTitulo', etiqueta: 'Título', tipo: 'texto' },
      { clave: 'retoTexto', etiqueta: 'Texto', tipo: 'parrafos' },
      { clave: 'retoBoton', etiqueta: 'Texto del botón', tipo: 'texto' },
      { clave: 'retoNota', etiqueta: 'Nota debajo del botón', tipo: 'texto' },
      { clave: '', etiqueta: 'Sobre Diana (resumen)', tipo: 'titulo' },
      { clave: 'sobreEtiqueta', etiqueta: 'Etiqueta', tipo: 'texto' },
      { clave: 'sobreTitulo', etiqueta: 'Título', tipo: 'texto' },
      { clave: 'sobreIntro', etiqueta: 'Primer párrafo', tipo: 'parrafos' },
      { clave: 'sobreTexto', etiqueta: 'Texto', tipo: 'parrafos', ayuda: FORMATO },
      { clave: 'sobreFrase', etiqueta: 'Frase de identidad', tipo: 'texto' },
      { clave: 'sobreBoton', etiqueta: 'Texto del botón', tipo: 'texto' },
      { clave: 'sobreFoto', etiqueta: 'Fotografía', tipo: 'imagen' },
      { clave: '', etiqueta: 'Espacios de la academia (escalera de velas)', tipo: 'titulo' },
      { clave: 'espaciosEtiqueta', etiqueta: 'Etiqueta', tipo: 'texto' },
      { clave: 'espaciosTitulo', etiqueta: 'Título', tipo: 'texto' },
      { clave: 'espaciosSubtitulo', etiqueta: 'Subtítulo', tipo: 'texto' },
      { clave: 'espaciosMostrarPago', etiqueta: 'Mostrar los espacios de pago (Salón y Cursos)', tipo: 'booleano' },
      { clave: 'espaciosGrupoGratis', etiqueta: 'Nombre del grupo gratuito', tipo: 'texto' },
      { clave: 'espaciosGrupoPago', etiqueta: 'Nombre del grupo de pago', tipo: 'texto' },
      { clave: 'espacios', etiqueta: 'Espacios', tipo: 'lista', elemento: 'Espacio', tituloDe: 'titulo', campos: [
        { clave: 'titulo', etiqueta: 'Título', tipo: 'texto' },
        { clave: 'texto', etiqueta: 'Descripción', tipo: 'parrafos' },
        { clave: 'icono', etiqueta: 'Ícono', tipo: 'opciones', opciones: ICONOS },
        { clave: 'pago', etiqueta: 'Es formación de pago (vela dorada)', tipo: 'booleano' },
      ] },
      { clave: '', etiqueta: 'Invitación final', tipo: 'titulo' },
      { clave: 'invitacionTitulo', etiqueta: 'Título', tipo: 'texto' },
      { clave: 'invitacionTexto', etiqueta: 'Texto', tipo: 'parrafos', ayuda: FORMATO },
      { clave: '', etiqueta: 'Prevención de estafas', tipo: 'titulo' },
      { clave: 'estafasEtiqueta', etiqueta: 'Etiqueta', tipo: 'texto' },
      { clave: 'estafasTitulo', etiqueta: 'Título', tipo: 'texto' },
      { clave: 'estafasLista', etiqueta: 'Lo que Diana nunca hace', tipo: 'lista', elemento: 'Punto', tituloDe: 'texto', campos: [
        { clave: 'texto', etiqueta: 'Texto', tipo: 'texto' },
      ] },
      { clave: 'estafasTexto', etiqueta: 'Texto final', tipo: 'parrafos', ayuda: 'Los canales oficiales se toman de «Información general».' },
    ],
  },
  {
    id: 'sobre', titulo: 'Página «Sobre Diana»', ver: '/sobre-diana',
    descripcion: 'La historia completa de Diana, organizada en bloques.',
    campos: [
      { clave: 'etiqueta', etiqueta: 'Etiqueta', tipo: 'texto' },
      { clave: 'titulo', etiqueta: 'Título', tipo: 'texto' },
      { clave: 'intro', etiqueta: 'Introducción', tipo: 'parrafos' },
      { clave: 'foto', etiqueta: 'Fotografía de portada', tipo: 'imagen' },
      { clave: 'bloques', etiqueta: 'Historia', tipo: 'lista', elemento: 'Bloque', tituloDe: 'texto',
        ayuda: 'Cada bloque es un párrafo, una frase destacada, una frase grande, una lista, una foto, una separación o la firma final. Usa las flechas para ordenarlos.',
        campos: [
          { clave: 'tipo', etiqueta: 'Tipo de bloque', tipo: 'opciones', opciones: [
            { valor: 'parrafo', etiqueta: 'Párrafo' }, { valor: 'destacado', etiqueta: 'Frase destacada (línea dorada)' },
            { valor: 'grande', etiqueta: 'Frase grande' }, { valor: 'lista', etiqueta: 'Lista (una línea por punto)' },
            { valor: 'foto', etiqueta: 'Fotografía' }, { valor: 'separador', etiqueta: 'Separación entre partes' },
            { valor: 'firma', etiqueta: 'Firma final' },
          ] },
          { clave: 'texto', etiqueta: 'Texto', tipo: 'parrafos', ayuda: 'Escribe **así** para negrita. En las listas, una línea por punto.', mostrarSi: { clave: 'tipo', valores: ['parrafo', 'destacado', 'grande', 'lista', 'firma'] } },
          { clave: 'texto', etiqueta: 'Descripción de la foto', tipo: 'texto', mostrarSi: { clave: 'tipo', valores: ['foto'] } },
          { clave: 'foto', etiqueta: 'Fotografía', tipo: 'imagen', mostrarSi: { clave: 'tipo', valores: ['foto'] } },
        ] },
      { clave: 'ctaTitulo', etiqueta: 'Título de la invitación final', tipo: 'texto' },
    ],
  },
  {
    id: 'acceso', titulo: 'Registro e inicio de sesión', ver: '/registro',
    descripcion: 'Textos de las pantallas de registro, inicio de sesión y recuperación de contraseña.',
    campos: [
      { clave: 'foto', etiqueta: 'Fotografía lateral', tipo: 'imagen' },
      { clave: 'registroTitulo', etiqueta: 'Registro: título', tipo: 'texto' },
      { clave: 'registroTexto', etiqueta: 'Registro: texto', tipo: 'parrafos' },
      { clave: 'confirmacionTitulo', etiqueta: 'Tras registrarse: título', tipo: 'texto' },
      { clave: 'confirmacionTexto', etiqueta: 'Tras registrarse: texto', tipo: 'parrafos' },
      { clave: 'ingresarTitulo', etiqueta: 'Iniciar sesión: título', tipo: 'texto' },
      { clave: 'ingresarTexto', etiqueta: 'Iniciar sesión: texto', tipo: 'parrafos' },
      { clave: 'recuperarTitulo', etiqueta: 'Recuperar contraseña: título', tipo: 'texto' },
      { clave: 'recuperarTexto', etiqueta: 'Recuperar contraseña: texto', tipo: 'parrafos' },
    ],
  },
  {
    id: 'portal', titulo: 'Portal del Alumno', ver: '/portal',
    descripcion: 'Bienvenida, ruta de aprendizaje, regalo de bienvenida, lives y lema final.',
    campos: [
      { clave: '', etiqueta: 'Bienvenida', tipo: 'titulo' },
      { clave: 'etiqueta', etiqueta: 'Etiqueta', tipo: 'texto' },
      { clave: 'bienvenida', etiqueta: 'Frase debajo del saludo', tipo: 'texto', ayuda: 'El saludo «¡Hola, [nombre]!» se escribe solo.' },
      { clave: 'texto', etiqueta: 'Texto', tipo: 'parrafos' },
      { clave: 'boton', etiqueta: 'Texto del botón', tipo: 'texto' },
      { clave: 'foto', etiqueta: 'Fotografía', tipo: 'imagen' },
      { clave: '', etiqueta: 'Ruta de aprendizaje', tipo: 'titulo' },
      { clave: 'rutaEtiqueta', etiqueta: 'Etiqueta', tipo: 'texto' },
      { clave: 'rutaTitulo', etiqueta: 'Título', tipo: 'texto' },
      { clave: 'rutaTexto', etiqueta: 'Texto', tipo: 'parrafos' },
      { clave: 'grupoSeries', etiqueta: 'Nombre del grupo de series', tipo: 'texto' },
      { clave: 'grupoComplementos', etiqueta: 'Nombre del grupo de recursos complementarios', tipo: 'texto' },
      { clave: 'empiezaAqui', etiqueta: 'Etiqueta de la primera tarjeta', tipo: 'texto' },
      { clave: '', etiqueta: 'Regalo de bienvenida', tipo: 'titulo' },
      { clave: 'regaloTitulo', etiqueta: 'Título', tipo: 'texto' },
      { clave: 'regaloTexto', etiqueta: 'Texto', tipo: 'parrafos', ayuda: 'El archivo es el primer recurso de la Biblioteca. Mientras no tenga PDF, se muestra «Próximamente».' },
      { clave: 'regaloBoton', etiqueta: 'Texto del botón', tipo: 'texto' },
      { clave: '', etiqueta: 'Lives', tipo: 'titulo' },
      { clave: 'livesTexto', etiqueta: 'Texto de la sección de lives', tipo: 'parrafos' },
      { clave: 'livesBoton', etiqueta: 'Texto del botón', tipo: 'texto', ayuda: 'El enlace se toma de «Información general».' },
      { clave: '', etiqueta: 'Cierre', tipo: 'titulo' },
      { clave: 'lema', etiqueta: 'Lema al final del portal', tipo: 'texto' },
    ],
  },
  {
    id: 'rutas', titulo: 'Series y videos', ver: '/portal',
    descripcion: 'Las tarjetas de la ruta de aprendizaje y los videos de YouTube de cada serie.',
    campos: [
      { clave: 'secciones', etiqueta: 'Tarjetas de la ruta', tipo: 'lista', elemento: 'Tarjeta', tituloDe: 'titulo',
        ayuda: 'Para añadir una serie nueva, pulsa «Añadir tarjeta» y escribe un identificador sin espacios (por ejemplo «estrategia»): será la dirección de su página.',
        campos: [
          { clave: 'titulo', etiqueta: 'Título de la tarjeta', tipo: 'texto' },
          { clave: 'numero', etiqueta: 'Número', tipo: 'texto' },
          { clave: 'slug', etiqueta: 'Identificador (dirección de la página)', tipo: 'texto', ayuda: 'Solo letras minúsculas, números y guiones. No lo cambies si la serie ya está publicada.' },
          { clave: 'tipo', etiqueta: 'Grupo', tipo: 'opciones', opciones: [{ valor: 'serie', etiqueta: 'Serie educativa' }, { valor: 'complemento', etiqueta: 'Recurso complementario' }] },
          { clave: 'resumen', etiqueta: 'Resumen (tarjeta)', tipo: 'parrafos' },
          { clave: 'boton', etiqueta: 'Texto del botón', tipo: 'texto' },
          { clave: 'icono', etiqueta: 'Ícono', tipo: 'opciones', opciones: ICONOS },
          { clave: 'tituloPagina', etiqueta: 'Título en su página (opcional)', tipo: 'texto' },
          { clave: 'intro', etiqueta: 'Introducción en su página', tipo: 'parrafos' },
          { clave: 'visible', etiqueta: 'Visible para los alumnos', tipo: 'booleano' },
          { clave: 'laboratorio', etiqueta: 'Incluir el laboratorio de velas', tipo: 'booleano' },
          { clave: 'lives', etiqueta: 'Incluir la invitación a los lives', tipo: 'booleano' },
          { clave: 'recursos', etiqueta: 'Incluir la biblioteca de recursos', tipo: 'booleano' },
          { clave: 'videos', etiqueta: 'Videos o listas de YouTube', tipo: 'lista', elemento: 'Video', tituloDe: 'titulo', campos: [
            { clave: 'titulo', etiqueta: 'Título', tipo: 'texto' },
            { clave: 'descripcion', etiqueta: 'Descripción', tipo: 'parrafos' },
            { clave: 'url', etiqueta: 'Enlace de YouTube', tipo: 'url', ayuda: 'Copia el enlace del video. Si es de una lista de reproducción (incluye «list=»), se mostrará la lista completa.' },
          ] },
        ] },
    ],
  },
  {
    id: 'biblioteca', titulo: 'Biblioteca de recursos', ver: '/portal/biblioteca',
    descripcion: 'Los PDF y materiales descargables. El primero es también el regalo de bienvenida.',
    campos: [
      { clave: 'recursos', etiqueta: 'Recursos', tipo: 'lista', elemento: 'Recurso', tituloDe: 'titulo',
        ayuda: 'Mientras un recurso no tenga archivo, la tarjeta muestra «Próximamente». Al subir el PDF aparece «Descargar».',
        campos: [
          { clave: 'titulo', etiqueta: 'Título', tipo: 'texto' },
          { clave: 'descripcion', etiqueta: 'Descripción', tipo: 'parrafos' },
          { clave: 'formato', etiqueta: 'Formato (PDF, XLSX…)', tipo: 'texto' },
          { clave: 'archivo', etiqueta: 'Archivo', tipo: 'archivo' },
        ] },
    ],
  },
  {
    id: 'formacion', titulo: 'Salón y Cursos', ver: '/portal/salon',
    descripcion: 'Membresía del Salón Diana Gamboa y Cursos Diana Gamboa (formación de pago).',
    campos: [
      { clave: 'mostrar', etiqueta: 'Mostrar esta sección en el Portal', tipo: 'booleano' },
      { clave: 'etiqueta', etiqueta: 'Etiqueta', tipo: 'texto' },
      { clave: 'titulo', etiqueta: 'Título', tipo: 'texto' },
      { clave: 'texto', etiqueta: 'Texto', tipo: 'parrafos' },
      { clave: '', etiqueta: 'Salón Diana Gamboa', tipo: 'titulo' },
      { clave: 'salonEtiqueta', etiqueta: 'Etiqueta', tipo: 'texto' },
      { clave: 'salonTitulo', etiqueta: 'Título', tipo: 'texto' },
      { clave: 'salonResumen', etiqueta: 'Resumen (tarjeta del Portal)', tipo: 'parrafos' },
      { clave: 'salonBoton', etiqueta: 'Texto del botón de la tarjeta', tipo: 'texto' },
      { clave: 'salonFoto', etiqueta: 'Fotografía', tipo: 'imagen' },
      { clave: 'salonLead', etiqueta: 'Página del Salón: frase principal', tipo: 'texto' },
      { clave: 'salonTexto', etiqueta: 'Página del Salón: texto', tipo: 'parrafos' },
      { clave: 'salonPuntos', etiqueta: 'Página del Salón: lo que incluye', tipo: 'lista', elemento: 'Punto', tituloDe: 'texto', campos: [{ clave: 'texto', etiqueta: 'Texto', tipo: 'texto' }] },
      { clave: 'salonUrl', etiqueta: 'Enlace de la membresía', tipo: 'url', ayuda: 'Vacío = se muestra «Próximamente». Cuando la membresía esté abierta, pega aquí el enlace oficial (por ejemplo, el de membresías de YouTube).' },
      { clave: 'salonBotonUnirse', etiqueta: 'Texto del botón para unirse', tipo: 'texto' },
      { clave: 'salonAviso', etiqueta: 'Aviso', tipo: 'parrafos' },
      { clave: '', etiqueta: 'Cursos Diana Gamboa', tipo: 'titulo' },
      { clave: 'cursosEtiqueta', etiqueta: 'Etiqueta', tipo: 'texto' },
      { clave: 'cursosTitulo', etiqueta: 'Título', tipo: 'texto' },
      { clave: 'cursosTexto', etiqueta: 'Texto', tipo: 'parrafos' },
      { clave: 'cursosNota', etiqueta: 'Nota', tipo: 'texto', ayuda: FORMATO },
      { clave: 'cursosUrl', etiqueta: 'Enlace de los cursos', tipo: 'url', ayuda: 'Vacío = se muestra «Próximamente».' },
      { clave: 'cursosBoton', etiqueta: 'Texto del botón (cuando hay enlace)', tipo: 'texto' },
    ],
  },
  {
    id: 'legal', titulo: 'Términos y privacidad', ver: '/privacidad',
    descripcion: 'Textos legales de la academia.',
    campos: [
      { clave: 'terminos', etiqueta: 'Términos y condiciones', tipo: 'largo', ayuda: FORMATO + ' Las líneas que empiezan con «# » se muestran como subtítulo.' },
      { clave: 'privacidad', etiqueta: 'Política de privacidad', tipo: 'largo', ayuda: FORMATO + ' Las líneas que empiezan con «# » se muestran como subtítulo.' },
    ],
  },
];

export const seccionPorId = (id: string) => SECCIONES.find(s => s.id === id);
