import Link from 'next/link';
import { NIVELES } from '@/data/reto';

const INDICE = [
  ['entrar', 'Entrar a la administración'],
  ['resumen', 'El resumen de la academia'],
  ['editar', 'Cómo editar el contenido'],
  ['recetas', 'Tareas frecuentes, paso a paso'],
  ['alumnos', 'Alumnos y descargas'],
  ['correos', 'Correos'],
  ['reto', 'El Reto de la Gráfica'],
  ['privacidad', 'Privacidad y buenas prácticas'],
  ['problemas', 'Si algo no funciona'],
] as const;

export default function ManualPage() {
  return <article className="manual">
    <header className="admin-cabecera">
      <h1>Manual de uso</h1>
      <p>Todo lo que necesitas para administrar la academia sin conocimientos técnicos.</p>
    </header>

    <nav className="manual-indice" aria-label="Índice del manual">
      <ol>{INDICE.map(([id, t]) => <li key={id}><a href={`#${id}`}>{t}</a></li>)}</ol>
    </nav>

    <section id="entrar">
      <h2>1. Entrar a la administración</h2>
      <ol>
        <li>Ve a la web y pulsa <strong>«Iniciar sesión»</strong>.</li>
        <li>Escribe el correo y la contraseña de tu cuenta de administración.</li>
        <li>Entrarás directamente a esta zona. También puedes escribir la dirección <code>/admin</code> después del dominio de la web.</li>
      </ol>
      <p>Desde el Portal del Alumno verás además el botón <strong>«Administración»</strong>. Solo la cuenta de Diana tiene acceso a esta zona.</p>
      <p className="manual-nota">La primera vez, Diana recibe un correo «Crea tu contraseña de administración». Al pulsar el botón crea su contraseña y entra directamente aquí.</p>
      <p className="manual-nota">¿Olvidaste tu contraseña? Pulsa «¿Olvidaste tu contraseña?» en la pantalla de inicio de sesión y sigue el enlace que llega a tu correo.</p>
    </section>

    <section id="resumen">
      <h2>2. El resumen de la academia</h2>
      <p>Es la primera pantalla. Muestra:</p>
      <ul>
        <li><strong>Alumnos registrados</strong> y cuántos se sumaron en los últimos 7 y 30 días.</li>
        <li><strong>Aceptan novedades:</strong> cuántos autorizaron recibir correos de la academia.</li>
        <li><strong>Retos completados y abandonados</strong> (empezados y no terminados).</li>
        <li><strong>Nivel con el que llegan:</strong> el resultado del primer Reto de cada persona.</li>
        <li><strong>Aciertos por tema</strong> y <strong>preguntas en las que más se equivocan</strong>: te ayudan a decidir qué clases o materiales preparar.</li>
        <li><strong>Secciones más visitadas</strong> del portal y <strong>recursos más descargados</strong>.</li>
      </ul>
      <p className="manual-nota">Pasa el cursor (o el dedo) sobre una barra para ver el detalle.</p>
    </section>

    <section id="editar">
      <h2>3. Cómo editar el contenido</h2>
      <ol>
        <li>En el menú, entra a <strong>«Contenido de la web»</strong>.</li>
        <li>Elige la parte que quieres cambiar (por ejemplo, «Página principal»).</li>
        <li>Cambia los textos, imágenes o enlaces que necesites.</li>
        <li>Pulsa <strong>«Guardar y publicar»</strong> (abajo). Los cambios aparecen en la web <strong>al instante</strong>.</li>
        <li>Pulsa <strong>«Ver en la web»</strong> para comprobar cómo quedó.</li>
      </ol>
      <p>Si intentas salir con cambios sin guardar, el navegador te avisará.</p>

      <h3>Formato de los textos</h3>
      <ul>
        <li><strong>Párrafos:</strong> deja una línea en blanco entre un párrafo y otro.</li>
        <li><strong>Negrita:</strong> escribe dos asteriscos antes y después: <code>**leer el mercado**</code> se ve como <strong>leer el mercado</strong>.</li>
        <li><strong>Subtítulos</strong> (solo en términos y privacidad): empieza la línea con <code># </code>.</li>
      </ul>

      <h3>Listas (videos, recursos, espacios, bloques de la historia…)</h3>
      <ul>
        <li>Pulsa el nombre de un elemento para abrirlo y editarlo.</li>
        <li>Con las flechas <strong>↑ ↓</strong> cambias su orden; con el botón de copiar lo <strong>duplicas</strong>; con la papelera lo <strong>quitas</strong>.</li>
        <li>Con <strong>«Añadir…»</strong> creas uno nuevo al final.</li>
      </ul>

      <h3>Imágenes y archivos</h3>
      <ul>
        <li>Pulsa <strong>«Subir imagen»</strong> o <strong>«Cambiar»</strong> y elige el archivo de tu computador. Verás una vista previa.</li>
        <li><strong>Logos:</strong> PNG o SVG con fondo transparente.</li>
        <li><strong>Fotos de Diana:</strong> JPG o WebP de al menos 1200 px de ancho. Para la foto principal de la portada, lo ideal es un recorte sin fondo (PNG o WebP transparente).</li>
        <li><strong>PDF y otros archivos:</strong> hasta 20 MB.</li>
      </ul>
      <p className="manual-nota">Recuerda pulsar «Guardar y publicar» después de subir una imagen: subirla no la publica por sí sola.</p>

      <h3>Deshacer un cambio</h3>
      <ul>
        <li>Abre <strong>«Historial y versiones anteriores»</strong> al final de la sección y pulsa <strong>«Restaurar»</strong> en la versión que quieras.</li>
        <li><strong>«Volver al contenido original»</strong> recupera los textos con los que se entregó la web. Lo que tenías queda guardado en el historial.</li>
      </ul>
    </section>

    <section id="recetas">
      <h2>4. Tareas frecuentes, paso a paso</h2>
      <dl className="manual-recetas">
        <dt>Cambiar el logo</dt>
        <dd>Contenido de la web › <strong>Información general</strong> › «Logo» (encabezado) y «Logo en negativo» (pie de página verde) › Guardar y publicar.</dd>
        <dt>Cambiar el correo de contacto o las redes sociales</dt>
        <dd>Contenido de la web › <strong>Información general</strong> › «Contacto y redes oficiales». Los avisos de estafas usan estos mismos datos.</dd>
        <dt>Cambiar el texto del botón «Quiero aprender con Diana»</dt>
        <dd>Información general › «Texto del botón principal de registro». Cambia en todos los botones de la web a la vez.</dd>
        <dt>Añadir un video a una serie</dt>
        <dd>Contenido de la web › <strong>Series y videos</strong> › abre la tarjeta de la serie › «Videos o listas de YouTube» › «Añadir video». Pega el enlace de YouTube (si incluye <code>list=</code>, se muestra la lista completa).</dd>
        <dt>Crear una serie nueva</dt>
        <dd>Series y videos › «Añadir tarjeta». Escribe el título, el número, un identificador sin espacios (por ejemplo <code>estrategia</code>), elige el grupo y el ícono, marca «Visible» y añade sus videos.</dd>
        <dt>Ocultar una serie sin borrarla</dt>
        <dd>Series y videos › abre la tarjeta › desmarca «Visible para los alumnos».</dd>
        <dt>Publicar un PDF en la Biblioteca</dt>
        <dd>Contenido de la web › <strong>Biblioteca de recursos</strong> › abre el recurso › «Subir archivo». El botón cambia de «Próximamente» a «Descargar». <strong>El primer recurso es también el regalo de bienvenida</strong> del portal.</dd>
        <dt>Abrir la membresía del Salón</dt>
        <dd>Contenido de la web › <strong>Salón y Cursos</strong> › «Enlace de la membresía»: pega el enlace oficial (por ejemplo, el de membresías de YouTube). Mientras esté vacío, se muestra «Próximamente».</dd>
        <dt>Publicar los cursos</dt>
        <dd>Salón y Cursos › «Enlace de los cursos». Vacío = «Próximamente».</dd>
        <dt>Mostrar u ocultar el Salón y los Cursos</dt>
        <dd>En la página principal: Página principal › «Mostrar los espacios de pago». En el portal: Salón y Cursos › «Mostrar esta sección en el Portal».</dd>
        <dt>Cambiar la historia de «Sobre Diana»</dt>
        <dd>Contenido de la web › <strong>Página «Sobre Diana»</strong> › «Historia». Cada bloque tiene un tipo: párrafo, frase destacada, frase grande, lista, foto, separación entre partes o firma final.</dd>
        <dt>Publicar los términos y la política de privacidad</dt>
        <dd>Contenido de la web › <strong>Términos y privacidad</strong>.</dd>
        <dt>Activar Microsoft Clarity</dt>
        <dd>Crea un proyecto gratis en clarity.microsoft.com, copia su identificador y pégalo en Información general › «Código de Microsoft Clarity». Menciónalo en la política de privacidad.</dd>
      </dl>
    </section>

    <section id="alumnos">
      <h2>5. Alumnos y descargas</h2>
      <ul>
        <li><strong>Buscar y filtrar:</strong> por nombre o correo, por nivel inicial del Reto y por fecha de registro. Pulsa «Filtrar».</li>
        <li><strong>Descargar Excel o CSV:</strong> descarga la lista con los filtros que tengas aplicados (una fila por alumno, con su nivel inicial, sus aciertos por tema y su nivel actual).</li>
        <li><strong>Detalle de cada intento del Reto:</strong> una fila por respuesta, para análisis más profundos.</li>
        <li><strong>Crear un alumno:</strong> botón «Crear alumno». Escribe su nombre y su correo: recibirá un correo con una <strong>contraseña provisional</strong> y, al entrar por primera vez, creará la suya.</li>
        <li><strong>Eliminar una cuenta:</strong> botón «…» › «Eliminar cuenta y datos». Úsalo cuando un alumno lo pida. No se puede deshacer. Los alumnos también pueden eliminar su cuenta desde «Mi cuenta».</li>
      </ul>
    </section>

    <section id="correos">
      <h2>6. Correos</h2>
      <ul>
        <li><strong>Lista de novedades:</strong> solo quienes marcaron «Quiero recibir novedades». Descárgala en Excel o CSV para usarla en Mailchimp, Brevo u otra herramienta, o copia todos los correos de una vez.</li>
        <li><strong>Correos automáticos:</strong> confirmación de correo, recuperación de contraseña, contraseña provisional e invitación de administración. Los envía la academia con Resend, con el diseño de la web. En «Correos» puedes ver cómo se ve cada uno.</li>
      </ul>
      <p className="manual-nota">Al escribir a varios alumnos desde tu correo, usa siempre «CCO» (copia oculta).</p>
    </section>

    <section id="reto">
      <h2>7. El Reto de la Gráfica</h2>
      <p>Cinco retos con 20 respuestas: velas (8), movimiento del precio (3), líneas de tendencia (2), niveles (2) y medias móviles (5). Solo puntúa el <strong>primer intento</strong> de cada pregunta. Niveles:</p>
      <ul>{NIVELES.map(n => <li key={n.nombre}><strong>{n.nombre}</strong> ({n.min}–{n.max} puntos): {n.mensaje}</li>)}</ul>
      <p>Lo pueden hacer visitantes sin cuenta y alumnos. Si un visitante se registra después desde el mismo dispositivo, su resultado pasa a su cuenta. Se conserva el primer resultado (nivel inicial) y los siguientes muestran su progreso.</p>
      <h3>Ver los resultados</h3>
      <ol>
        <li>Entra a <strong>Resultados del Reto</strong> en el menú. Verás cada partida: fecha, persona (o «Visitante sin cuenta»), puntaje sobre 20, nivel, aciertos por tema y cuánto tardó.</li>
        <li>Filtra por nombre o correo, por alumnos o visitantes, por nivel, por fechas o por partidas sin terminar.</li>
        <li>Pulsa <strong>Ver respuestas</strong> para ver la partida pregunta por pregunta (si acertó a la primera y cuántos intentos necesitó) y todas las partidas de esa persona.</li>
        <li>Desde <strong>Alumnos</strong>, el enlace «Ver sus retos» bajo el nivel inicial lleva directo a los retos de ese alumno.</li>
        <li>Para trabajar en Excel, pulsa <strong>Descargar detalle (Excel)</strong>.</li>
      </ol>
      <p>Todo se guarda automáticamente mientras la persona juega: si abandona a la mitad, la partida aparece como «Sin terminar».</p>
    </section>

    <section id="privacidad">
      <h2>8. Privacidad y buenas prácticas</h2>
      <ul>
        <li>Cada alumno solo ve sus propios datos. Solo las cuentas administradoras ven los datos de todos.</li>
        <li>No compartas tu contraseña: la cuenta de administración es solo tuya.</li>
        <li>Guarda los archivos descargados (Excel, CSV) en un lugar seguro: contienen datos personales.</li>
        <li>Cierra sesión al usar un computador compartido.</li>
      </ul>
    </section>

    <section id="problemas">
      <h2>9. Si algo no funciona</h2>
      <dl className="manual-recetas">
        <dt>Guardé y no veo el cambio en la web</dt>
        <dd>Recarga la página. En el celular, cierra la pestaña y vuelve a abrirla.</dd>
        <dt>«Tu sesión expiró o no tienes permiso»</dt>
        <dd>Cierra sesión, vuelve a entrar e intenta de nuevo. Tus cambios no se pierden mientras no cierres la página.</dd>
        <dt>Un alumno no recibe el correo de confirmación</dt>
        <dd>Pídele que revise «spam» o «promociones». Si sigue sin llegar, puede pedir uno nuevo con «¿Olvidaste tu contraseña?».</dd>
        <dt>Una imagen no se sube</dt>
        <dd>Revisa que pese menos de 20 MB y que sea JPG, PNG, WebP o SVG.</dd>
      </dl>
      <p>Para la configuración técnica (claves, dominio, Resend) consulta el documento <strong>«Puesta en marcha»</strong> que entregó el desarrollador (archivo <code>docs/PUESTA-EN-MARCHA.md</code> del proyecto) o escribe a K&amp;T.</p>
      <p><Link href="/admin" className="btn btn-outline btn-sm">Volver al resumen</Link></p>
    </section>
  </article>;
}
