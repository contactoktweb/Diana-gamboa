import Link from 'next/link';
import { Download, ExternalLink } from 'lucide-react';
import CopiarTexto from '@/components/admin/CopiarTexto';
import { CORREOS } from '@/lib/correos';
import { getContenido } from '@/lib/contenido';
import { supabaseServidor } from '@/lib/supabase/servidor';
import { SUPABASE_URL } from '@/lib/supabase/config';

export default async function CorreosPage() {
  const supabase = await supabaseServidor();
  const { global: g } = await getContenido();
  let suscritos: { nombre: string; correo: string }[] = [];
  if (supabase) {
    const { data } = await supabase.rpc('admin_alumnos');
    suscritos = ((data ?? []) as { nombre: string; correo: string; acepta_novedades: boolean }[]).filter(a => a.acepta_novedades);
  }
  const ref = SUPABASE_URL.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
  const panel = ref ? `https://supabase.com/dashboard/project/${ref}/auth/templates` : 'https://supabase.com/dashboard';

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
        <a className="btn btn-outline btn-sm" href="/admin/exportar/novedades?formato=csv"><Download size={16} aria-hidden="true" /> CSV (para Mailchimp, Brevo…)</a>
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
      <p className="admin-nota">Los envía Supabase solos. Para que salgan en español y con la marca, copia cada plantilla en Supabase (solo se hace una vez): <em>Authentication › Email Templates</em>, elige la plantilla, pega el asunto y el contenido y pulsa «Save».</p>
      <a href={panel} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm"><ExternalLink size={16} aria-hidden="true" /> Abrir las plantillas en Supabase</a>
      <ul className="correos-lista">
        {CORREOS.map(c => <li key={c.id}>
          <div className="correos-cabecera">
            <div><h3>{c.nombre}</h3><p>{c.cuando} En Supabase: <strong>{c.plantillaSupabase}</strong>.</p></div>
          </div>
          <p className="correos-asunto"><span>Asunto:</span> {c.asunto} <CopiarTexto texto={c.asunto} etiqueta="Copiar asunto" pequeno /></p>
          <details>
            <summary>Ver el correo</summary>
            <iframe title={`Vista previa: ${c.nombre}`} className="correos-vista" srcDoc={c.html.replaceAll('{{ .SiteURL }}', '').replaceAll('{{ .Email }}', 'antes@ejemplo.com').replaceAll('{{ .NewEmail }}', 'nuevo@ejemplo.com')} />
          </details>
          <CopiarTexto texto={c.html} etiqueta="Copiar el contenido (HTML)" />
        </li>)}
      </ul>
    </section>
  </>;
}
