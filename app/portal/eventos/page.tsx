import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, ChevronRight } from 'lucide-react';
import { supabaseServidor } from '@/lib/supabase/servidor';
import { getSesion } from '@/lib/sesion';
import { fechaEvento, type Evento } from '@/lib/eventos/formato';

export const metadata: Metadata = { title: 'Eventos | Portal del Alumno' };
export const dynamic = 'force-dynamic';

export default async function EventosPage() {
  const supabase = await supabaseServidor();
  const sesion = await getSesion();
  let eventos: Evento[] = [];
  const cupo = new Map<string, boolean>();
  const inscrito = new Set<string>();
  if (supabase) {
    const { data } = await supabase.from('eventos_privados').select('*').eq('visible', true).order('creado_en', { ascending: false });
    eventos = (data as Evento[]) ?? [];
    await Promise.all(eventos.map(async e => { const { data: hay } = await supabase.rpc('evento_hay_cupo', { p_evento: e.id }); cupo.set(e.id, Boolean(hay)); }));
    if (sesion && eventos.length) {
      const { data: mias } = await supabase.from('inscripciones').select('evento_id').eq('usuario_id', sesion.id).eq('estado', 'pagada');
      for (const m of mias ?? []) inscrito.add(m.evento_id as string);
    }
  }

  return <>
    <section className="lesson-head">
      <div className="wrap">
        <nav className="breadcrumb" aria-label="Estás aquí">
          <Link href="/portal" className="back-link"><ArrowLeft size={18} aria-hidden="true" /> Inicio del portal</Link>
          <ChevronRight size={16} aria-hidden="true" />
          <span aria-current="page">Eventos</span>
        </nav>
        <div className="lesson-title"><div><p className="eyebrow">Solo para alumnos</p><h1>Eventos</h1></div></div>
        <p className="lead-sm">Talleres y clases en vivo con Diana. Entra a cada evento para ver los detalles y reservar tu lugar.</p>
      </div>
    </section>

    <div className="wrap lesson-body">
      {eventos.length === 0
        ? <p className="admin-vacio">Por ahora no hay eventos publicados. Te avisaremos cuando abramos el próximo.</p>
        : <ul className="eventos-lista">{eventos.map(e => <li key={e.id} className="evento-tarjeta">
          <p className="eyebrow"><CalendarDays size={16} aria-hidden="true" /> {fechaEvento(e)}</p>
          <h2>{e.titulo}</h2>
          {e.subtitulo && <p className="evento-sub">{e.subtitulo}</p>}
          {e.resumen && <p>{e.resumen}</p>}
          <div className="evento-tarjeta-pie">
            {inscrito.has(e.id)
              ? <span className="evento-estado es-ok"><CheckCircle2 size={18} aria-hidden="true" /> Ya tienes tu cupo</span>
              : !e.inscripcion_abierta ? <span className="evento-estado es-cerrado">Inscripciones cerradas</span>
                : cupo.get(e.id) ? <span className="evento-estado es-disponible">Cupos disponibles</span>
                  : <span className="evento-estado es-agotado">Cupos agotados</span>}
            <Link href={`/portal/eventos/${e.slug}`} className="btn btn-green btn-sm">Ver el evento <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </li>)}</ul>}
    </div>
  </>;
}
