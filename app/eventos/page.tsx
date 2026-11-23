import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { eventosPublicos, hayCupoPublico } from '@/lib/eventos/publico';
import { fechaEvento } from '@/lib/eventos/formato';

export const metadata: Metadata = { title: 'Eventos y talleres en vivo | Diana Gamboa', description: 'Talleres y clases en vivo con Diana Gamboa.' };
export const dynamic = 'force-dynamic';

export default async function EventosPublicosPage() {
  const eventos = (await eventosPublicos()).filter(e => e.en_lista !== false);
  const cupos = await Promise.all(eventos.map(hayCupoPublico));
  return <>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <SiteHeader />
    <main id="contenido" className="evento-publico">
      <section className="lesson-head">
        <div className="wrap">
          <div className="lesson-title"><div><p className="eyebrow">En vivo con Diana</p><h1>Eventos y talleres</h1></div></div>
          <p className="lead-sm">Clases en vivo para aprender a leer el mercado. La clase se abre dentro de la web, sin instalar nada.</p>
        </div>
      </section>
      <div className="wrap lesson-body">
        {eventos.length === 0
          ? <p className="admin-vacio">Por ahora no hay eventos publicados. Crea tu cuenta gratuita y te avisaremos del próximo.</p>
          : <ul className="eventos-lista">{eventos.map((e, i) => <li key={e.id} className="evento-tarjeta">
            {e.etiqueta && <p className="eyebrow evento-etiqueta">{e.etiqueta}</p>}
            <h2>{e.titulo}</h2>
            <p className="evento-fecha"><CalendarDays size={16} aria-hidden="true" /> {fechaEvento(e)}</p>
            {e.subtitulo && <p className="evento-sub">{e.subtitulo}</p>}
            {e.resumen && <p>{e.resumen}</p>}
            <div className="evento-tarjeta-pie">
              {!e.inscripcion_abierta ? <span className="evento-estado es-cerrado">Inscripciones cerradas</span>
                : cupos[i] ? <span className="evento-estado es-disponible">Cupos disponibles</span>
                  : <span className="evento-estado es-agotado">Cupos agotados</span>}
              <Link href={`/eventos/${e.slug}`} className="btn btn-green btn-sm">Ver el evento <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </li>)}</ul>}
      </div>
    </main>
    <SiteFooter />
  </>;
}
