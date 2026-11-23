import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Clock3, Lock, Video } from 'lucide-react';
import SalaZoom from '@/components/eventos/SalaZoom';
import HoraLocal from '@/components/eventos/HoraLocal';
import { accesoSala } from '@/lib/eventos/sala';
import { vincularPorCorreo } from '@/lib/eventos/pago';
import { getSesion } from '@/lib/sesion';
import { fechaEvento } from '@/lib/eventos/formato';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Sala de clase | Portal del Alumno' };

export default async function SalaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sesion = await getSesion();
  if (sesion) await vincularPorCorreo(sesion.id, sesion.correo);
  const a = await accesoSala(slug);
  const volver = <Link href={`/portal/eventos/${slug}`} className="back-link"><ArrowLeft size={18} aria-hidden="true" /> Volver al evento</Link>;

  if (!a.ok) {
    const texto = {
      sesion: 'Inicia sesión para entrar a la clase.',
      evento: 'No encontramos este evento.',
      sin_pago: 'La sala de clase es solo para las personas inscritas en este evento.',
      sin_sala: 'La sala de esta clase se abrirá antes de la hora de inicio. Te avisaremos por correo.',
      sin_zoom: 'La sala de clase se abrirá antes de la hora de inicio. Te avisaremos por correo.',
    }[a.motivo];
    return <section className="lesson-head"><div className="wrap">
      <nav className="breadcrumb" aria-label="Estás aquí">{volver}</nav>
      <div className="lesson-title"><div><p className="eyebrow">Sala de clase</p><h1>{a.evento?.titulo ?? 'Sala de clase'}</h1></div></div>
      <p className="evento-estado es-cerrado sala-aviso">{a.motivo === 'sin_pago' ? <Lock size={18} aria-hidden="true" /> : <Clock3 size={18} aria-hidden="true" />} {texto}</p>
      {a.evento && <ul className="evento-datos"><li>{fechaEvento(a.evento)}</li>{a.evento.hora_inicio && <HoraLocal iso={a.evento.hora_inicio} />}</ul>}
    </div></section>;
  }

  return <section className="sala">
    <div className="wrap sala-cabecera">
      {volver}
      <h1><Video size={20} aria-hidden="true" /> {a.evento.titulo}</h1>
      <p>{a.anfitriona ? 'Entras como anfitriona: das paso a los alumnos desde la sala de espera.' : 'Escribe tu nombre completo si Zoom te lo pide: así te reconocemos en la sala de espera.'}</p>
    </div>
    <SalaZoom slug={a.evento.slug} />
  </section>;
}
