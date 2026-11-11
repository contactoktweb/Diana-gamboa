/**
 * Contenido original de la web. Es lo que se muestra mientras no se haya editado nada
 * desde la administración; cada campo guardado en Supabase reemplaza al de aquí.
 *
 * Formato de los textos:
 *  - En los campos de varios párrafos, una línea en blanco separa un párrafo de otro.
 *  - **texto** se muestra en negrita.
 */

export type Icono = 'grafica' | 'analizar' | 'criterio' | 'clases' | 'ruta' | 'lives' | 'biblioteca' | 'salon' | 'cursos' | 'accion' | 'metodo' | 'proceso';

export interface Video { titulo: string; descripcion: string; url: string }
export interface Seccion {
  slug: string; numero: string; titulo: string; tituloPagina: string; resumen: string; intro: string;
  icono: Icono; tipo: 'serie' | 'complemento'; boton: string;
  laboratorio: boolean; lives: boolean; recursos: boolean; visible: boolean; videos: Video[];
}
export interface Recurso { titulo: string; descripcion: string; formato: string; archivo: string }
export interface BloqueHistoria { tipo: 'parrafo' | 'destacado' | 'grande' | 'lista' | 'foto' | 'separador' | 'firma'; texto: string; foto: string }

export const PREDETERMINADO = {
  global: {
    nombreSitio: 'Diana Gamboa',
    logo: '/brand/logo-dg.png',
    logoClaro: '/brand/logo-dg-light.png',
    botonPrincipal: 'Quiero aprender con Diana',
    notaBoton: 'Crea tu cuenta gratis y descubre tu ruta de aprendizaje.',
    correoContacto: '',
    youtube: 'https://www.youtube.com/@DianaGamboaMomentum',
    youtubeLives: 'https://www.youtube.com/@DianaGamboaMomentum/streams',
    youtubeUsuario: '@DianaGamboaMomentum',
    instagram: 'https://www.instagram.com/dianagamboamomentum/',
    instagramUsuario: '@dianagamboamomentum',
    pieFrase: 'El idioma del mercado: aprende a leer, analizar y desarrollar tu propio criterio.',
    avisoEducativo: 'El contenido de esta academia es exclusivamente educativo y no constituye asesoría financiera ni recomendaciones personalizadas de inversión.',
    seoTitulo: 'Diana Gamboa | Aprende a leer el idioma del mercado',
    seoDescripcion: 'Academia de Diana Gamboa para aprender desde cero a leer el idioma del mercado. Clases gratuitas organizadas, lives y recursos para desarrollar tu propio criterio.',
    seoImagen: '/diana-borgona.webp',
    clarityId: '',
  },

  inicio: {
    heroEtiqueta: 'Diana Gamboa · El idioma del mercado',
    heroTitulo: 'Aprende a leer el',
    heroTituloDestacado: 'idioma del mercado',
    heroTexto: 'Aquí aprenderás desde cero a comprender lo que sucede en una gráfica, reconocer el comportamiento del precio y desarrollar tu propio análisis.',
    heroFraseTitulo: 'Antes de comprar. Antes de vender. Antes de buscar una estrategia.',
    heroFrase: 'Hay algo que necesitas aprender: **leer el mercado.**',
    heroFoto: '/diana-borgona.webp',

    aprenderEtiqueta: 'Lo esencial',
    aprenderTitulo: '¿Qué vas a aprender conmigo?',
    aprenderTexto: 'Una gráfica puede parecer complicada cuando no sabes qué estás mirando.\n\nPero cuando comienzas a comprender sus elementos, aprendes a reconocer cómo se mueve el precio y qué información puedes obtener de ese movimiento.',
    aprenderAcento: 'Aquí comenzamos por lo esencial.',
    aprenderFoto: '/fotos/diana-pizarra.webp',
    aprendizajes: [
      { icono: 'grafica', titulo: 'Aprender a leer una gráfica', texto: 'Conoce las velas japonesas, el comportamiento del precio y las herramientas básicas que nos ayudan a comprender lo que estamos observando.' },
      { icono: 'analizar', titulo: 'Aprender a analizar', texto: 'Descubre cómo se relacionan las tendencias, los niveles, las medias móviles y el recorrido del precio para construir una lectura ordenada.' },
      { icono: 'criterio', titulo: 'Desarrollar tu propio criterio', texto: 'Aprende a hacer las preguntas correctas, reunir información y llegar a tus propias conclusiones antes de estudiar estrategias de inversión.' },
    ] as { icono: Icono; titulo: string; texto: string }[],

    retoMostrar: true,
    retoEtiqueta: 'El Reto de la Gráfica',
    retoTitulo: '¿Qué tanto sabes leer el mercado?',
    retoTexto: 'Pon a prueba tus conocimientos con unos pequeños retos sobre velas, tendencias, niveles y medias móviles.',
    retoBoton: 'Acepto el reto',
    retoNota: 'No necesitas experiencia. Aquí también se aprende intentando.',

    sobreEtiqueta: 'Sobre Diana',
    sobreTitulo: 'Hola, soy Diana Gamboa',
    sobreIntro: 'Soy analista del mercado de valores, educadora, madre y una mujer profundamente enamorada de lo que hace.',
    sobreTexto: 'Creo que antes de comprar, vender o buscar una estrategia, necesitas aprender a leer el mercado. Porque detrás de cada vela hay emociones, decisiones y una historia que aprender a interpretar.\n\nY también creo que una mente tranquila, un cuerpo descansado y unas emociones en equilibrio son parte importante de ese aprendizaje.',
    sobreFrase: 'Yo no adivino el mercado. Lo leo. Y te enseño a leerlo.',
    sobreBoton: 'Conoce mi historia',
    sobreFoto: '/diana-gesto.webp',

    espaciosEtiqueta: 'Tu academia',
    espaciosTitulo: 'Tu aprendizaje comienza aquí',
    espaciosSubtitulo: 'Desde tu primera gráfica hasta tu propio análisis.',
    espaciosMostrarPago: false,
    espaciosGrupoGratis: 'Acceso gratuito',
    espaciosGrupoPago: 'Formación adicional de pago',
    espacios: [
      { icono: 'clases', titulo: 'Clases gratuitas desde cero', texto: 'Videos educativos para comenzar sin conocimientos previos.', pago: false },
      { icono: 'ruta', titulo: 'Una ruta de aprendizaje', texto: 'Tus clases organizadas para saber por dónde empezar y cómo continuar.', pago: false },
      { icono: 'lives', titulo: 'Lives gratuitos en YouTube', texto: 'Transmisiones para observar y analizar el mercado conmigo.', pago: false },
      { icono: 'biblioteca', titulo: 'Biblioteca de recursos', texto: 'Guías y materiales para practicar y reforzar lo aprendido.', pago: false },
      { icono: 'salon', titulo: 'Salón Diana Gamboa', texto: 'Clases privadas en vivo para practicar y profundizar en el análisis.', pago: true },
      { icono: 'cursos', titulo: 'Cursos especializados', texto: 'Formaciones para continuar desarrollando tus conocimientos.', pago: true },
    ] as { icono: Icono; titulo: string; texto: string; pago: boolean }[],

    invitacionTitulo: 'Comienza tu formación desde cero',
    invitacionTexto: 'No importa si nunca has abierto una gráfica.\n\nAquí encontrarás una formación organizada para aprender a comprender el mercado, desarrollar tu propio análisis y avanzar a tu ritmo.',

    estafasEtiqueta: 'Prevención de estafas',
    estafasTitulo: 'No tengo Telegram ni WhatsApp de inversiones.',
    estafasLista: [
      { texto: 'No administro cuentas de inversión de mis alumnos.' },
      { texto: 'No solicito dinero para realizar operaciones en nombre de otras personas.' },
      { texto: 'No ofrezco señales privadas de compra y venta.' },
      { texto: 'No solicito contraseñas ni acceso a cuentas de inversión.' },
    ],
    estafasTexto: 'Si alguien te contacta en mi nombre para ofrecerte inversiones o pedirte dinero, es una estafa. Mis únicos canales oficiales son:',
  },

  sobre: {
    etiqueta: 'Sobre Diana',
    titulo: 'Hola, soy Diana Gamboa',
    intro: 'Analista del mercado de valores, educadora, madre y una mujer profundamente enamorada de lo que hace.',
    foto: '/fotos/diana-traje-claro.webp',
    bloques: [
      { tipo: 'parrafo', texto: 'Durante años miré gráficas todos los días, hasta que un día comprendí algo que lo cambió todo:', foto: '' },
      { tipo: 'destacado', texto: 'No puedes pretender ser rentable si primero no aprendes a leer y entender el comportamiento del mercado, vela a vela.', foto: '' },
      { tipo: 'parrafo', texto: 'Saber qué te dice cada vela. Reconocer cómo utilizar los indicadores básicos. Entender lo que visualmente te está mostrando cada uno.', foto: '' },
      { tipo: 'parrafo', texto: 'Ese es el primer objetivo: **aprender a leer el mercado antes de buscar un patrón, antes de aplicar una estrategia y antes de comprar o vender.**', foto: '' },
      { tipo: 'separador', texto: '', foto: '' },
      { tipo: 'parrafo', texto: 'Y aquí viene algo que casi nadie te dice:', foto: '' },
      { tipo: 'grande', texto: 'Cada vela es una emoción.', foto: '' },
      { tipo: 'parrafo', texto: 'Es el resultado de las decisiones de compradores y vendedores, de sus miedos, su euforia, sus dudas y sus expectativas sobre lo que puede suceder con el precio.', foto: '' },
      { tipo: 'parrafo', texto: 'Cuando aprendes a leer una gráfica, también comienzas a reconocer las emociones que se reflejan en el comportamiento del mercado.', foto: '' },
      { tipo: 'destacado', texto: 'Pero ¿cómo vas a leer las emociones del mercado si no sabes reconocer las tuyas?', foto: '' },
      { tipo: 'separador', texto: '', foto: '' },
      { tipo: 'parrafo', texto: 'Soy una mujer espiritual y creo profundamente en la conexión entre la mente, el cuerpo y el alma.', foto: '' },
      { tipo: 'parrafo', texto: 'Una mente tranquila nos ayuda a observar con claridad. Un cuerpo descansado nos permite estar más atentos. Y un alma en paz nos enseña algo que considero fundamental: **saber esperar.**', foto: '' },
      { tipo: 'parrafo', texto: 'Porque si un día tus emociones están hechas un revoltillo, lo mejor es no operar. Así de sencillo.', foto: '' },
      { tipo: 'parrafo', texto: 'El conocimiento es importante, pero también lo son la paciencia, la disciplina y las emociones en equilibrio.', foto: '' },
      { tipo: 'parrafo', texto: 'Por eso, cuando enseño, no solo me importa la gráfica. **También me importa la persona que está frente a ella.**', foto: '' },
      { tipo: 'separador', texto: '', foto: '' },
      { tipo: 'foto', texto: 'Diana Gamboa', foto: '/fotos/diana-blazer-azul.webp' },
      { tipo: 'separador', texto: '', foto: '' },
      { tipo: 'parrafo', texto: 'Así nació el **Método Diana Gamboa**: para enseñarte el idioma del mercado pieza por pieza, en orden, con calma y desde cero.', foto: '' },
      { tipo: 'lista', texto: 'Las velas te cuentan quién tiene el control.\nLas medias móviles te muestran cómo respira el precio.\nLos niveles te dicen dónde abrir los ojos.', foto: '' },
      { tipo: 'parrafo', texto: 'Y cuando aprendes a conectar todas esas piezas, la gráfica deja de ser un misterio y comienza a hablarte.', foto: '' },
      { tipo: 'separador', texto: '', foto: '' },
      { tipo: 'parrafo', texto: 'No importa si nunca has abierto una gráfica. **Aquí nadie se queda atrás.**', foto: '' },
      { tipo: 'parrafo', texto: 'Conmigo no vas a encontrar promesas de dinero fácil, señales para copiar ni atajos.', foto: '' },
      { tipo: 'parrafo', texto: 'Vas a encontrar a alguien que te habla claro, que te muestra lo que funciona y también lo que no, y que celebra contigo ese día en que miras una gráfica y dices:', foto: '' },
      { tipo: 'grande', texto: '«¡Ya la entiendo!»', foto: '' },
      { tipo: 'separador', texto: '', foto: '' },
      { tipo: 'parrafo', texto: 'Porque mi sueño no es que dependas de mí.', foto: '' },
      { tipo: 'destacado', texto: 'Es que un día ya no me necesites.', foto: '' },
      { tipo: 'firma', texto: 'Yo no adivino el mercado. Lo leo. Y te enseño a leerlo.', foto: '' },
    ] as BloqueHistoria[],
    ctaTitulo: 'Comienza tu formación desde cero',
  },

  acceso: {
    foto: '/fotos/diana-chaleco-verde.webp',
    registroTitulo: '¡Bienvenido a tu academia!',
    registroTexto: 'Crea tu cuenta gratuita y descubre tu ruta de aprendizaje. Encontrarás clases organizadas, transmisiones y recursos para comenzar desde cero.',
    ingresarTitulo: 'Bienvenido de nuevo',
    ingresarTexto: 'Ingresa para continuar con tu formación.',
    recuperarTitulo: 'Recupera tu contraseña',
    recuperarTexto: 'Escribe tu correo y te enviaremos un enlace para crear una nueva.',
    confirmacionTitulo: 'Revisa tu correo',
    confirmacionTexto: 'Te enviamos un enlace para confirmar tu cuenta. Al abrirlo entrarás directamente a tu Portal del Alumno.',
  },

  portal: {
    etiqueta: 'Portal del Alumno',
    bienvenida: 'Bienvenido a tu academia',
    texto: 'Este es tu espacio para aprender a leer el mercado, comprender el comportamiento del precio y desarrollar tu propio análisis, paso a paso y a tu ritmo.',
    boton: 'Ir a mis clases',
    foto: '/fotos/diana-blazer-azul.webp',
    rutaEtiqueta: 'Acceso gratuito',
    rutaTitulo: 'Tu ruta de aprendizaje gratuita',
    rutaTexto: 'Comienza por la primera serie y avanza a tu ritmo. También encontrarás transmisiones y materiales para practicar lo aprendido.',
    grupoSeries: 'Series educativas',
    grupoComplementos: 'Recursos complementarios',
    empiezaAqui: 'Empieza aquí',
    regaloTitulo: 'Tu regalo de bienvenida',
    regaloTexto: 'Descarga tu Hoja del Proceso de Análisis y utilízala como guía mientras estudias.',
    regaloBoton: 'Descargar mi guía',
    lema: 'Aprende a leer. Aprende a analizar. Aprende a decidir.',
    livesTexto: 'En estas transmisiones compartimos análisis de gráficas, observamos el comportamiento del precio y conectamos lo aprendido en las clases.\n\nConsulta las próximas transmisiones y los lives anteriores en mi canal de YouTube.',
    livesBoton: 'Ver lives gratuitos',
  },

  rutas: {
    secciones: [
      {
        slug: 'leer-una-grafica', numero: '01', titulo: 'Cómo leer una gráfica desde cero', tituloPagina: '',
        resumen: 'Conoce los elementos de una gráfica y comienza a comprender cómo se mueve el precio.',
        intro: 'Tu punto de partida. Aquí aprenderás qué muestra una gráfica, cómo se forman las velas y qué observar antes de sacar conclusiones.',
        icono: 'grafica', tipo: 'serie', boton: 'Ver clases', laboratorio: true, lives: false, recursos: false, visible: true,
        videos: [{ titulo: 'Aprende a leer una gráfica desde cero', descripcion: 'La serie recomendada para comenzar: velas, tendencias y estructura del precio, sin conocimientos previos.', url: 'https://www.youtube.com/watch?v=S4k6Aa8I1EY&list=PLPVYGJqt-RY7xoxa9Aze4H1OdHMoZbur4' }],
      },
      {
        slug: 'de-la-grafica-a-la-accion', numero: '02', titulo: 'De la Gráfica a la Acción', tituloPagina: '',
        resumen: 'Aprende a relacionar lo que observas en una gráfica con las preguntas y decisiones que forman parte del análisis.',
        intro: 'Relaciona lo que observas en una gráfica con las preguntas y decisiones que forman parte del análisis.',
        icono: 'accion', tipo: 'serie', boton: 'Ver clases', laboratorio: false, lives: false, recursos: false, visible: true,
        videos: [{ titulo: 'Temporada 2: De la Gráfica a la Acción', descripcion: 'Episodios para seguir ejercitando la interpretación del precio paso a paso.', url: 'https://www.youtube.com/watch?v=2kigaPEMwGE&list=PLPVYGJqt-RY5w8pyz8vARkwUD9i8fglV-' }],
      },
      {
        slug: 'metodo-diana-gamboa', numero: '03', titulo: 'Método Diana Gamboa', tituloPagina: '',
        resumen: 'Aprende el idioma del mercado: velas, medias móviles, tendencias y otras herramientas para comprender el comportamiento del precio.',
        intro: 'El idioma del mercado pieza por pieza: velas, medias móviles, tendencias y otras herramientas para comprender el comportamiento del precio.',
        icono: 'metodo', tipo: 'serie', boton: 'Ver clases', laboratorio: false, lives: false, recursos: false, visible: true,
        videos: [{ titulo: 'El Idioma del Mercado', descripcion: 'Conoce el lenguaje visual del precio para dar sentido a velas, movimientos y estructuras.', url: 'https://www.youtube.com/watch?v=1SkHApSmlQI' }],
      },
      {
        slug: 'proceso-de-analisis', numero: '04', titulo: 'El Proceso de Análisis', tituloPagina: '',
        resumen: 'Aprende a seguir un orden para observar una gráfica, reunir información y construir tus propias conclusiones.',
        intro: 'Un orden para observar una gráfica, reunir información y construir tus propias conclusiones.',
        icono: 'proceso', tipo: 'serie', boton: 'Ver clases', laboratorio: false, lives: false, recursos: false, visible: true,
        videos: [{ titulo: 'El Proceso del Análisis', descripcion: 'El razonamiento que hay detrás de una lectura consciente del gráfico.', url: 'https://www.youtube.com/watch?v=7p5SL3YJaQc' }],
      },
      {
        slug: 'lives', numero: '05', titulo: 'Lives gratuitos en YouTube', tituloPagina: '',
        resumen: 'Acompáñame en mis transmisiones para observar y analizar el mercado.',
        intro: 'Acompáñame a leer y analizar el mercado en vivo.',
        icono: 'lives', tipo: 'complemento', boton: 'Ver lives', laboratorio: false, lives: true, recursos: false, visible: true,
        videos: [
          { titulo: '10 Min Antes del Cierre', descripcion: 'Lecturas del mercado en un momento clave de la sesión.', url: 'https://www.youtube.com/watch?v=xyTE2DWxOMU' },
          { titulo: 'Ojo Pelado | Aprende a Leer el Mercado', descripcion: 'Entrena la observación del precio y reconoce lo que te muestra la gráfica.', url: 'https://www.youtube.com/watch?v=BvKDWEsfTk0' },
        ],
      },
      {
        slug: 'biblioteca', numero: '06', titulo: 'Biblioteca de Recursos', tituloPagina: 'Tu biblioteca de recursos',
        resumen: 'Encuentra guías y hojas de práctica para repasar y reforzar lo aprendido.',
        intro: 'Aquí encontrarás materiales para practicar, repasar y reforzar lo aprendido en las clases. Puedes descargarlos y utilizarlos a tu propio ritmo.',
        icono: 'biblioteca', tipo: 'complemento', boton: 'Ver recursos', laboratorio: false, lives: false, recursos: true, visible: true,
        videos: [],
      },
    ] as Seccion[],
  },

  biblioteca: {
    recursos: [
      { titulo: 'Hoja del Proceso de Análisis', descripcion: 'Una guía para organizar tu análisis y recordar qué observar cuando te sientas frente a una gráfica.', formato: 'PDF', archivo: '' },
      { titulo: 'Hoja de práctica: lectura de velas', descripcion: 'Ejercicios para reconocer la apertura, el cierre, el máximo y el mínimo de las velas alcistas y bajistas.', formato: 'PDF', archivo: '' },
      { titulo: 'Glosario del idioma del mercado', descripcion: 'Las palabras y herramientas que utilizamos en nuestras clases, explicadas de manera sencilla.', formato: 'PDF', archivo: '' },
    ] as Recurso[],
  },

  formacion: {
    mostrar: false,
    etiqueta: 'Formación adicional de pago',
    titulo: 'Continúa tu formación con Diana',
    texto: 'Opciones para ampliar tu formación cuando quieras profundizar. No son un requisito para comenzar a estudiar.',
    salonEtiqueta: 'Membresía mensual',
    salonTitulo: 'Salón Diana Gamboa',
    salonResumen: 'Un espacio para llevar lo aprendido a la práctica. Participa en dos clases privadas en vivo al mes, donde analizaremos gráficas, conectaremos las piezas del mercado y practicaremos juntos el proceso de análisis.',
    salonBoton: 'Conocer el Salón',
    salonFoto: '/diana-gesto.webp',
    salonLead: 'Un espacio para llevar lo aprendido a la práctica.',
    salonTexto: 'Participa en dos clases privadas en vivo al mes, donde analizaremos gráficas, conectaremos las piezas del mercado y practicaremos juntos el proceso de análisis.\n\nUn espacio para preguntar, aprender y desarrollar tu propio criterio.',
    salonPuntos: [{ texto: 'Dos clases privadas en vivo al mes' }, { texto: 'Análisis de gráficas' }, { texto: 'Práctica del proceso de análisis' }],
    salonUrl: '',
    salonBotonUnirse: 'Unirme al Salón',
    salonAviso: 'El Salón es un espacio educativo para practicar y profundizar en el análisis. No incluye señales de compra o venta, operaciones para copiar ni asesoría financiera personalizada.',
    cursosEtiqueta: 'Formaciones especializadas',
    cursosTitulo: 'Cursos Diana Gamboa',
    cursosTexto: 'Continúa aprendiendo. Profundiza tus conocimientos. Próximamente encontrarás nuevas formaciones para continuar desarrollando tu análisis y aprender a construir tus propias estrategias.',
    cursosNota: 'Primer programa en preparación: **Estrategia Diana Gamboa**.',
    cursosUrl: '',
    cursosBoton: 'Ver cursos',
  },

  legal: {
    terminos: "**Última actualización: 9 de noviembre de 2026.**\n\nEstos términos regulan el uso de la web www.dianagamboa.com y de la Academia Diana Gamboa (en adelante, «la academia»). Al crear una cuenta o usar la web, aceptas estos términos. Si no estás de acuerdo, no utilices la web.\n\n# 1. Quiénes somos\n\nLa academia es un proyecto educativo de Diana Gamboa dedicado a enseñar a leer y analizar gráficas de los mercados financieros. Puedes escribirnos a hola@dianagamboa.com.\n\n# 2. Contenido educativo, no asesoría financiera\n\nTodo el contenido de la academia (clases, videos, lives, materiales, el Reto de la Gráfica y cualquier comentario de Diana Gamboa) tiene fines **exclusivamente educativos e informativos**.\n\nNo constituye asesoría financiera, de inversión, legal ni tributaria, ni una recomendación de comprar o vender ningún activo. Invertir implica riesgos, incluida la pérdida total del capital. Los resultados pasados no garantizan resultados futuros. Cada persona es la única responsable de sus decisiones de inversión; antes de invertir, consulta con un profesional autorizado en tu país.\n\n# 3. Tu cuenta\n\nPara acceder al Portal del Alumno necesitas una cuenta gratuita. Debes tener al menos 18 años y dar datos verdaderos. Eres responsable de mantener tu contraseña en secreto y de la actividad de tu cuenta. Si crees que alguien la está usando sin tu permiso, escríbenos.\n\nPuedes eliminar tu cuenta cuando quieras desde «Mi cuenta». Podemos suspender o eliminar cuentas que incumplan estos términos.\n\n# 4. Uso permitido\n\nPuedes usar el contenido para tu aprendizaje personal. No está permitido:\n\n**a)** copiar, revender, redistribuir o publicar el contenido de la academia sin autorización por escrito;\n**b)** compartir tu cuenta con otras personas;\n**c)** usar la web para fines ilegales, para enviar spam o para intentar acceder a datos de otras personas o a partes no públicas de la web.\n\n# 5. Propiedad intelectual\n\nLos textos, videos, materiales, diseños, logotipos y la marca «Diana Gamboa» pertenecen a Diana Gamboa o se usan con autorización. Usar la web no te da ningún derecho sobre ellos, salvo el uso personal descrito en estos términos.\n\n# 6. Contenido de terceros\n\nAlgunas clases y lives se muestran desde YouTube y algunos enlaces llevan a sitios de terceros. No controlamos esos servicios y su uso se rige por sus propios términos.\n\n# 7. Servicios de pago\n\nCuando la academia ofrezca servicios de pago (por ejemplo, el Salón Diana Gamboa o los cursos), sus condiciones, precios y forma de pago se informarán antes de contratarlos. Si el pago se hace a través de una plataforma externa, también se aplican sus condiciones.\n\n# 8. Cuidado con las estafas\n\nDiana Gamboa **nunca** te pedirá dinero para invertir por ti, contraseñas ni acceso a tus cuentas de inversión, ni te contactará para ofrecerte rentabilidades garantizadas. Los únicos canales oficiales son los publicados en esta web. Si alguien te escribe en nombre de Diana con ese tipo de ofertas, es un fraude.\n\n# 9. Responsabilidad\n\nLa web se ofrece «tal cual». Hacemos lo posible para que funcione bien y para que el contenido sea correcto, pero no garantizamos que esté libre de errores o interrupciones. En la medida permitida por la ley, la academia no responde por pérdidas derivadas de decisiones de inversión ni del uso que hagas del contenido.\n\n# 10. Cambios\n\nPodemos actualizar estos términos. Publicaremos la versión vigente en esta página con su fecha de actualización. Si el cambio es importante, te avisaremos por correo o en la web.\n\n# 11. Contacto\n\nPara cualquier duda sobre estos términos, escríbenos a hola@dianagamboa.com.",
    privacidad: "**Última actualización: 9 de noviembre de 2026.**\n\nEn esta política te explicamos qué datos recogemos en www.dianagamboa.com, para qué los usamos y qué derechos tienes. Nos tomamos en serio tu privacidad: solo pedimos lo necesario y nunca vendemos tus datos.\n\n# 1. Responsable\n\nLa responsable de tus datos es Diana Gamboa, titular de la Academia Diana Gamboa. Contacto: hola@dianagamboa.com.\n\n# 2. Qué datos recogemos\n\n**Datos de tu cuenta:** nombre, correo electrónico y contraseña. La contraseña se guarda cifrada: nadie de la academia puede verla.\n\n**Tus autorizaciones:** si aceptaste los términos y si quieres recibir novedades por correo.\n\n**Tus resultados del Reto de la Gráfica:** tu experiencia invirtiendo (si la indicas), tus respuestas, tu puntaje y tu nivel. Si haces el Reto sin cuenta, se guardan sin tu nombre; si luego te registras desde el mismo dispositivo, se vinculan a tu cuenta.\n\n**Uso del Portal:** qué secciones visitas y qué materiales descargas, para saber qué contenido es más útil.\n\n**Datos técnicos:** las cookies necesarias para mantener tu sesión iniciada y la información técnica básica que registran los servidores (por ejemplo, dirección IP y navegador) por seguridad.\n\n# 3. Para qué los usamos\n\n**a)** Crear y gestionar tu cuenta y darte acceso al Portal del Alumno.\n**b)** Recomendarte por dónde empezar según tu resultado en el Reto.\n**c)** Enviarte los correos necesarios del servicio (por ejemplo, para recuperar tu contraseña).\n**d)** Enviarte novedades de la academia, **solo si lo autorizaste**.\n**e)** Mejorar las clases y materiales con estadísticas de uso.\n**f)** Proteger la web y prevenir abusos.\n\nLa base para tratar tus datos es tu consentimiento y la prestación del servicio que solicitas al registrarte.\n\n# 4. Con quién se comparten\n\nNo vendemos ni cedemos tus datos. Para que la web funcione, usamos proveedores que los tratan solo por nuestra cuenta:\n\n**Supabase:** base de datos y cuentas de usuario.\n**Vercel:** alojamiento de la web.\n**Resend:** envío de correos.\n**YouTube (Google):** reproducción de los videos. El reproductor solo se carga cuando pulsas «reproducir», y a partir de ahí se aplica la política de privacidad de Google.\n**Microsoft Clarity:** solo si está activado, para entender de forma anónima cómo se usa la web (por ejemplo, mapas de clics).\n\nAlgunos de estos proveedores pueden guardar datos fuera de tu país, con medidas de seguridad adecuadas. También podríamos compartir datos si una autoridad competente lo exige legalmente.\n\n# 5. Cuánto tiempo los guardamos\n\nMientras tengas tu cuenta. Si la eliminas, borramos tu cuenta, tu perfil y tus resultados del Reto. Algunas copias de seguridad pueden tardar un tiempo breve en eliminarse por completo.\n\n# 6. Tus derechos\n\nPuedes pedir en cualquier momento acceder a tus datos, corregirlos, eliminarlos, oponerte a su uso o retirar tu consentimiento:\n\n**a)** Desde «Mi cuenta» puedes dejar de recibir novedades y **eliminar tu cuenta y todos tus datos**.\n**b)** Para cualquier otra solicitud, escríbenos a hola@dianagamboa.com. Te responderemos lo antes posible.\n\nSi crees que no hemos tratado bien tus datos, también puedes reclamar ante la autoridad de protección de datos de tu país.\n\n# 7. Menores de edad\n\nLa academia está dirigida a personas mayores de 18 años. No recogemos a sabiendas datos de menores. Si detectamos una cuenta de un menor, la eliminaremos.\n\n# 8. Seguridad\n\nUsamos conexiones cifradas (HTTPS), contraseñas cifradas y permisos que impiden que un alumno vea los datos de otro. Solo la administradora de la academia puede consultar la lista de alumnos.\n\n# 9. Cambios en esta política\n\nSi cambiamos esta política, publicaremos la nueva versión en esta página con su fecha. Si el cambio es importante, te avisaremos por correo o en la web.\n\n# 10. Contacto\n\nPara cualquier pregunta sobre tus datos, escríbenos a hola@dianagamboa.com.",
  },
};

export type Contenido = typeof PREDETERMINADO;
export type NombreSeccion = keyof Contenido;
