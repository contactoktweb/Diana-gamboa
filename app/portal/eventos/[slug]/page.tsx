import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle, ArrowLeft, CalendarDays, CheckCircle2, ChevronRight, Clock3, Video } from 'lucide-react';
import Inscripcion, { type EstadoUsuario } from '@/components/eventos/Inscripcion';
import TextoEvento from '@/components/eventos/TextoEvento';
import HoraLocal from '@/components/eventos/HoraLocal';
import { Parrafos } from '@/lib/contenido/texto';
import { supabaseServidor } from '@/lib/supabase/servidor';
import { getSesion } from '@/lib/sesion';
import { stripeActivo } from '@/lib/stripe';
import { procesarSesionPagada, vincularPorCorreo } from '@/lib/eventos/pago';
import { salaLista } from '@/lib/eventos/sala';
import { MENSAJE_PRIORIDAD, sinPrioridad } from '@/lib/eventos/prioridad';
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
  // La administradora también ve los eventos ocultos (vista previa antes de publicarlos).
  const esAdmin = sesion?.perfil?.rol === 'admin';
  const { data: evento } = await supabase.from('eventos_privados').select('*').eq('slug', slug).maybeSingle<Evento>();
  if (!evento || (!evento.visible && !esAdmin)) notFound();

  // Regreso desde Stripe: se confirma el pago aquí mismo por si el aviso de Stripe aún no llegó.
  let errorPago = '';
  if (q.pago === 'ok' && q.session_id) {
    try { await procesarSesionPagada(q.session_id); } catch (e) { errorPago = (e as Error).message; }
  }

  // Cupos aprobados desde la administración con el correo de esta cuenta.
  if (sesion) await vincularPorCorreo(sesion.id, sesion.correo);
  let estado: EstadoUsuario = 'ninguno';
  // Consultas independientes en paralelo (la página carga más rápido).
  const [{ data: mias }, { data: hayCupo }] = await Promise.all([
    sesion
      ? supabase.from('inscripciones').select('estado').eq('evento_id', evento.id).eq('usuario_id', sesion.id).in('estado', ['pagada', 'verificacion', 'preinscrita', 'espera'])
      : Promise.resolve({ data: null }),
    supabase.rpc('evento_hay_cupo', { p_evento: evento.id }),
  ]);
  if (sesion) {
    const estados = (mias ?? []).map(m => m.estado as string);
    estado = estados.includes('pagada') ? 'pagada' : estados.includes('verificacion') ? 'verificacion' : estados.includes('preinscrita') ? 'preinscrita' : estados.includes('espera') ? 'espera' : 'ninguno';
  }
  const precio = precioTexto(evento.precio_centavos);
  // Con claves de Stripe: pago automático. Sin claves pero con enlace de pago: pago por enlace y verificación.
  const modo = stripeActivo ? 'stripe' : evento.enlace_pago ? 'enlace' : 'preinscripcion';
  // Etapa de prioridad: solo compra la lista de espera del grupo anterior.
  const bloqueo = sesion && estado === 'ninguno' && await sinPrioridad(evento, sesion.id, sesion.correo, sesion.perfil?.rol === 'admin') ? MENSAJE_PRIORIDAD : undefined;
  const inscripcion = (boton?: string) => <Inscripcion eventoId={evento.id} precio={precio} hayCupo={Boolean(hayCupo)} abierta={evento.inscripcion_abierta}
    modo={modo} enlacePago={evento.enlace_pago} correo={sesion?.correo} estado={estado} boton={boton} bloqueo={bloqueo} />;
  const conSala = estado === 'pagada' && await salaLista(evento.id);

  return <>
    <section className="lesson-head evento-head">
      <div className="wrap">
        {!evento.visible && <p className="admin-aviso" role="status"><strong>Vista previa:</strong> este evento está oculto y solo tú puedes verlo. Para publicarlo, marca «Visible en la web» en Administración → Eventos.</p>}
        <nav className="breadcrumb" aria-label="Estás aquí">
          <Link href="/portal/eventos" className="back-link"><ArrowLeft size={18} aria-hidden="true" /> Eventos</Link>
          <ChevronRight size={16} aria-hidden="true" />
          <span aria-current="page">{evento.titulo}</span>
        </nav>
        <div className="lesson-title"><div>
          {(evento.etiqueta || evento.detalles) && <p className="eyebrow">{evento.etiqueta || evento.detalles}</p>}
          <h1>{evento.titulo}</h1>
        </div></div>
        {evento.subtitulo && <p className="lead-sm">{evento.subtitulo}</p>}
        <ul className="evento-datos">
          <li><CalendarDays size={18} aria-hidden="true" /> {fechaEvento(evento)}</li>
          {evento.horario && <li><Clock3 size={18} aria-hidden="true" /> {evento.horario}</li>}
          {evento.hora_inicio && <HoraLocal iso={evento.hora_inicio} />}
        </ul>
        {evento.etiqueta && evento.detalles && <p className="evento-detalles">{evento.detalles}</p>}
        {q.pago === 'ok' && estado === 'pagada' && <p className="auth-ok evento-aviso" role="status"><CheckCircle2 size={18} aria-hidden="true" /> ¡Gracias por tu confianza! Tu pago fue aprobado y ya tienes tu cupo. Te enviamos la confirmación por correo.</p>}
        {q.pago === 'ok' && estado !== 'pagada' && <p className="auth-ok evento-aviso" role="status">Estamos confirmando tu pago con Stripe. Si en unos minutos no aparece tu cupo, recarga esta página. {errorPago}</p>}
        {q.pago === 'cancelado' && <p className="auth-error evento-aviso" role="alert">El pago no se completó y no se te cobró nada. Puedes intentarlo de nuevo.</p>}
        {inscripcion()}
      </div>
    </section>

    <div className="wrap lesson-body evento-cuerpo">
      {estado === 'pagada' && (evento.acceso || conSala) && <section className="evento-acceso" aria-label="Tu acceso">
        <h2><CheckCircle2 size={22} aria-hidden="true" /> Tu acceso al evento</h2>
        {conSala && <div className="evento-sala">
          <p>La clase se abre aquí mismo, dentro de la web. No necesitas instalar Zoom. Entra unos 10 minutos antes.</p>
          <Link href={`/portal/eventos/${evento.slug}/sala`} className="btn btn-green btn-lg"><Video size={20} aria-hidden="true" /> Entrar a la clase</Link>
        </div>}
        {evento.acceso && <TextoEvento texto={evento.acceso} />}
      </section>}

      <article className="evento-texto"><TextoEvento texto={evento.contenido} /></article>

      {estado !== 'pagada' && <section className="evento-reserva" aria-labelledby="reserva-titulo">
        <h2 id="reserva-titulo">Reserva tu cupo</h2>
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
