import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle, ArrowLeft, CalendarDays, CheckCircle2, ChevronRight, Clock3 } from 'lucide-react';
import Inscripcion, { type EstadoUsuario } from '@/components/eventos/Inscripcion';
import TextoEvento from '@/components/eventos/TextoEvento';
import HoraLocal from '@/components/eventos/HoraLocal';
import { Parrafos } from '@/lib/contenido/texto';
import { supabaseServidor } from '@/lib/supabase/servidor';
import { getSesion } from '@/lib/sesion';
import { stripeActivo } from '@/lib/stripe';
import { procesarSesionPagada } from '@/lib/eventos/pago';
import { fechaEvento, precioTexto, type Evento } from '@/lib/eventos/formato';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await supabaseServidor();
  const { slug } = await params;
  const { data } = supabase ? await supabase.from('eventos_privados').select('titulo').eq('slug', slug).maybeSingle() : { data: null };
  return { title: `${data?.titulo ?? 'Evento'} | Portal del Alumno` };
}

export default async function EventoPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const q = await searchParams;
  const supabase = await supabaseServidor();
  const sesion = await getSesion();
  if (!supabase) notFound();
  const { data: evento } = await supabase.from('eventos_privados').select('*').eq('slug', slug).eq('visible', true).maybeSingle<Evento>();
  if (!evento) notFound();

  // Regreso desde Stripe: se confirma el pago aquí mismo por si el aviso de Stripe aún no llegó.
  let errorPago = '';
  if (q.pago === 'ok' && q.session_id) {
    try { await procesarSesionPagada(q.session_id); } catch (e) { errorPago = (e as Error).message; }
  }

  let estado: EstadoUsuario = 'ninguno';
  if (sesion) {
    const { data: mias } = await supabase.from('inscripciones').select('estado').eq('evento_id', evento.id).eq('usuario_id', sesion.id).in('estado', ['pagada', 'verificacion', 'preinscrita', 'espera']);
    const estados = (mias ?? []).map(m => m.estado as string);
    estado = estados.includes('pagada') ? 'pagada' : estados.includes('verificacion') ? 'verificacion' : estados.includes('preinscrita') ? 'preinscrita' : estados.includes('espera') ? 'espera' : 'ninguno';
  }
  const { data: hayCupo } = await supabase.rpc('evento_hay_cupo', { p_evento: evento.id });
  const precio = precioTexto(evento.precio_centavos);
  // Con claves de Stripe: pago automático. Sin claves pero con enlace de pago: pago por enlace y verificación.
  const modo = stripeActivo ? 'stripe' : evento.enlace_pago ? 'enlace' : 'preinscripcion';
  const inscripcion = (boton?: string) => <Inscripcion eventoId={evento.id} precio={precio} hayCupo={Boolean(hayCupo)} abierta={evento.inscripcion_abierta}
    modo={modo} enlacePago={evento.enlace_pago} correo={sesion?.correo} estado={estado} boton={boton} />;

  return <>
    <section className="lesson-head evento-head">
      <div className="wrap">
        <nav className="breadcrumb" aria-label="Estás aquí">
          <Link href="/portal/eventos" className="back-link"><ArrowLeft size={18} aria-hidden="true" /> Eventos</Link>
          <ChevronRight size={16} aria-hidden="true" />
          <span aria-current="page">{evento.titulo}</span>
        </nav>
        <div className="lesson-title"><div>
          {evento.detalles && <p className="eyebrow">{evento.detalles}</p>}
          <h1>{evento.titulo}</h1>
        </div></div>
        {evento.subtitulo && <p className="lead-sm">{evento.subtitulo}</p>}
        <ul className="evento-datos">
          <li><CalendarDays size={18} aria-hidden="true" /> {fechaEvento(evento)}</li>
          {evento.horario && <li><Clock3 size={18} aria-hidden="true" /> {evento.horario}</li>}
          {evento.hora_inicio && <HoraLocal iso={evento.hora_inicio} />}
        </ul>
        {q.pago === 'ok' && estado === 'pagada' && <p className="auth-ok evento-aviso" role="status"><CheckCircle2 size={18} aria-hidden="true" /> ¡Pago aprobado! Ya tienes tu cupo. Te enviamos la confirmación por correo.</p>}
        {q.pago === 'ok' && estado !== 'pagada' && <p className="auth-ok evento-aviso" role="status">Estamos confirmando tu pago con Stripe. Si en unos minutos no aparece tu cupo, recarga esta página. {errorPago}</p>}
        {q.pago === 'cancelado' && <p className="auth-error evento-aviso" role="alert">El pago no se completó y no se te cobró nada. Puedes intentarlo de nuevo.</p>}
        {inscripcion()}
      </div>
    </section>

    <div className="wrap lesson-body evento-cuerpo">
      {estado === 'pagada' && evento.acceso && <section className="evento-acceso" aria-label="Tu acceso">
        <h2><CheckCircle2 size={22} aria-hidden="true" /> Tu acceso al evento</h2>
        <TextoEvento texto={evento.acceso} />
      </section>}

      <article className="evento-texto"><TextoEvento texto={evento.contenido} /></article>

      {estado !== 'pagada' && <section className="evento-reserva" aria-labelledby="reserva-titulo">
        <h2 id="reserva-titulo">Reserva tu lugar</h2>
        {evento.detalles && <p>{evento.detalles}</p>}
        <p className="evento-nota">Inscripciones abiertas hasta llenar los cupos.</p>
        {inscripcion()}
      </section>}

      {evento.aviso && <aside className="evento-riesgo" aria-label="Aviso de riesgo">
        <h2><AlertTriangle size={20} aria-hidden="true" /> Aviso de riesgo</h2>
        <Parrafos texto={evento.aviso} />
      </aside>}
    </div>
  </>;
}
