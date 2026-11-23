import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle, ArrowRight, CalendarDays, CheckCircle2, Clock3, Lock, Video, X } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import TextoEvento from '@/components/eventos/TextoEvento';
import HoraLocal from '@/components/eventos/HoraLocal';
import { Parrafos } from '@/lib/contenido/texto';
import { getSesion } from '@/lib/sesion';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { eventosPublicos, hayCupoPublico } from '@/lib/eventos/publico';
import { fechaEvento } from '@/lib/eventos/formato';
import { vincularPorCorreo } from '@/lib/eventos/pago';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [e] = await eventosPublicos(slug);
  if (!e) return { title: 'Evento | Diana Gamboa' };
  const descripcion = e.resumen || e.subtitulo;
  return { title: `${e.titulo} | Diana Gamboa`, description: descripcion, openGraph: { title: e.titulo, description: descripcion, type: 'website' } };
}

/** Página pública del evento: se puede compartir y ver sin cuenta. La compra se hace dentro del portal. */
export default async function EventoPublicoPage({ params }: Props) {
  const { slug } = await params;
  const [e] = await eventosPublicos(slug);
  if (!e) notFound();
  const [sesion, hayCupo] = await Promise.all([getSesion(), hayCupoPublico(e)]);
  const portal = `/portal/eventos/${e.slug}`;
  let pagado = false;
  if (sesion) {
    // Cupos aprobados con el correo de esta cuenta quedan unidos a ella.
    await vincularPorCorreo(sesion.id, sesion.correo);
    const admin = supabaseAdmin();
    const { data } = admin ? await admin.from('inscripciones').select('id').eq('evento_id', e.id).eq('estado', 'pagada').eq('usuario_id', sesion.id).limit(1) : { data: null };
    pagado = Boolean(data?.length);
  }

  const llamado = (principal = true) => {
    if (pagado) return <div className="evento-inscripcion">
      <p className="evento-estado es-ok"><CheckCircle2 size={20} aria-hidden="true" /> Ya tienes tu cupo en este evento.</p>
      <Link href={portal} className="btn btn-green btn-lg"><Video size={20} aria-hidden="true" /> Ir al evento en mi portal</Link>
    </div>;
    if (!e.inscripcion_abierta) return <p className="evento-estado es-cerrado"><Lock size={20} aria-hidden="true" /> Las inscripciones están cerradas.</p>;
    if (!hayCupo) return <div className="evento-inscripcion">
      <p className="evento-estado es-agotado"><X size={20} aria-hidden="true" /> Cupos agotados</p>
      <Link href={sesion ? portal : `/registro?next=${encodeURIComponent(portal)}`} className="btn btn-outline">Avisarme si se libera un cupo</Link>
    </div>;
    return <div className="evento-inscripcion">
      <p className="evento-estado es-disponible"><CheckCircle2 size={20} aria-hidden="true" /> Cupos disponibles</p>
      <Link href={sesion ? portal : `/registro?next=${encodeURIComponent(portal)}`} className={`btn btn-green ${principal ? 'btn-lg' : ''}`}>Reserva tu lugar <ArrowRight aria-hidden="true" /></Link>
      {!sesion && <p className="evento-nota evento-nota-texto">Primero creas tu cuenta gratuita (o <Link href={`/ingresar?next=${encodeURIComponent(portal)}`}>inicias sesión</Link>) y luego pagas de forma segura con Stripe.</p>}
    </div>;
  };

  return <>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <SiteHeader />
    <main id="contenido" className="evento-publico">
      <section className="lesson-head evento-head">
        <div className="wrap">
          <div className="lesson-title"><div>
            {e.detalles && <p className="eyebrow">{e.detalles}</p>}
            <h1>{e.titulo}</h1>
          </div></div>
          {e.subtitulo && <p className="lead-sm">{e.subtitulo}</p>}
          <ul className="evento-datos">
            <li><CalendarDays size={18} aria-hidden="true" /> {fechaEvento(e)}</li>
            {e.horario && <li><Clock3 size={18} aria-hidden="true" /> {e.horario}</li>}
            {e.hora_inicio && <HoraLocal iso={e.hora_inicio} />}
          </ul>
          {llamado()}
        </div>
      </section>

      <div className="wrap lesson-body evento-cuerpo">
        <article className="evento-texto"><TextoEvento texto={e.contenido} /></article>
        {!pagado && <section className="evento-reserva" aria-labelledby="reserva-titulo">
          <h2 id="reserva-titulo">Reserva tu lugar</h2>
          {e.detalles && <p>{e.detalles}</p>}
          <p className="evento-nota">La clase es en vivo y se abre dentro de la web: no necesitas instalar nada.</p>
          {llamado(false)}
        </section>}
        {e.aviso && <aside className="evento-riesgo" aria-label="Aviso de riesgo">
          <h2><AlertTriangle size={20} aria-hidden="true" /> Aviso de riesgo</h2>
          <Parrafos texto={e.aviso} />
        </aside>}
      </div>
    </main>
    <SiteFooter />
  </>;
}
