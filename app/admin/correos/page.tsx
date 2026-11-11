import Link from 'next/link';
import { CheckCircle2, CircleAlert, Download } from 'lucide-react';
import CopiarTexto from '@/components/admin/CopiarTexto';
import { correoConfirmacion, correoInvitacionAdmin, correoProvisional, correoRecuperacion } from '@/lib/correo/plantillas';
import { envioPropio, REMITENTE } from '@/lib/correo/enviar';
import { getContenido } from '@/lib/contenido';
import { supabaseServidor } from '@/lib/supabase/servidor';
import { urlDelSitio } from '@/lib/sitio';

export default async function CorreosPage() {
  const supabase = await supabaseServidor();
  const { global: g } = await getContenido();
  const sitio = await urlDelSitio();
  let suscritos: { nombre: string; correo: string }[] = [];
  if (supabase) {
    const { data } = await supabase.rpc('admin_alumnos');
    suscritos = ((data ?? []) as { nombre: string; correo: string; acepta_novedades: boolean }[]).filter(a => a.acepta_novedades);
  }
  const ejemplo = `${sitio}/ingresar`;
  const correos = [
    { nombre: 'Confirmación de correo', cuando: 'Cuando alguien crea su cuenta, solo si la confirmación de correo está activada en Supabase.', ...correoConfirmacion({ sitio, nombre: 'María', enlace: ejemplo }) },
    { nombre: 'Recuperación de contraseña', cuando: 'Cuando un alumno pulsa «¿Olvidaste tu contraseña?».', ...correoRecuperacion({ sitio, nombre: 'María', enlace: ejemplo }) },
    { nombre: 'Contraseña provisional', cuando: 'Cuando creas un alumno desde «Alumnos › Crear alumno».', ...correoProvisional({ sitio, nombre: 'María', correo: 'maria@ejemplo.com', clave: 'Kp7mR4wZq2' }) },
    { nombre: 'Invitación de administración', cuando: 'Para que la administradora cree su contraseña.', ...correoInvitacionAdmin({ sitio, nombre: 'Diana', enlace: ejemplo }) },
  ];

  return <>
    <header className="admin-cabecera">
      <h1>Correos</h1>
      <p>Lista de alumnos que aceptaron recibir novedades, y los correos automáticos que envía la academia.</p>
    </header>

    <section className="admin-panel">
      <h2>Alumnos que aceptan novedades</h2>
      <p className="admin-nota">Solo puedes escribir con novedades a quienes marcaron esta opción al registrarse o en «Mi cuenta». Es independiente de la aceptación de los términos.</p>
      <p className="admin-gran-numero"><strong>{suscritos.length}</strong> {suscritos.length === 1 ? 'persona' : 'personas'}</p>
      <div className="admin-botones">
        <a className="btn btn-green btn-sm" href="/admin/exportar/novedades?formato=xlsx"><Download size={16} aria-hidden="true" /> Descargar lista (Excel)</a>
        <a className="btn btn-outline btn-sm" href="/admin/exportar/novedades?formato=csv"><Download size={16} aria-hidden="true" /> CSV (para Resend, Mailchimp, Brevo…)</a>
        {suscritos.length > 0 && <CopiarTexto texto={suscritos.map(s => s.correo).join(', ')} etiqueta="Copiar todos los correos" />}
      </div>
      <p className="admin-nota">Consejo: al enviar a varias personas desde tu correo, pon las direcciones en «CCO» (copia oculta) para proteger su privacidad.</p>
    </section>

    <section className="admin-panel">
      <h2>Correo de contacto de la web</h2>
      <p>{g.correoContacto ? <>Los visitantes ven <strong>{g.correoContacto}</strong> en «Contacto».</> : 'Aún no hay un correo de contacto: «Contacto» lleva a Instagram.'}</p>
      <Link href="/admin/contenido/global" className="btn btn-outline btn-sm">Cambiar el correo de contacto</Link>
    </section>

    <section className="admin-panel">
      <h2>Correos automáticos</h2>
      {envioPropio
        ? <p className="correos-estado es-ok"><CheckCircle2 size={20} aria-hidden="true" /> Los correos se envían con Resend desde <strong>{REMITENTE}</strong>.</p>
        : <p className="correos-estado es-pendiente"><CircleAlert size={20} aria-hidden="true" /> Resend aún no está configurado: por ahora los correos de registro y recuperación los envía Supabase con su diseño básico.</p>}
      <ul className="correos-lista">
        {correos.map(c => <li key={c.nombre}>
          <div><h3>{c.nombre}</h3><p>{c.cuando}</p></div>
          <p className="correos-asunto"><span>Asunto:</span> {c.asunto}</p>
          <details>
            <summary>Ver el correo</summary>
            <iframe title={`Vista previa: ${c.nombre}`} className="correos-vista" srcDoc={c.html} />
          </details>
          <CopiarTexto texto={c.html} etiqueta="Copiar HTML" />
        </li>)}
      </ul>
    </section>
  </>;
}
