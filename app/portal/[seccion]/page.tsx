import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ExternalLink, FileText } from 'lucide-react';
import ChartLab from '@/components/ChartLab';
import LiveSchedule from '@/components/LiveSchedule';
import RouteIcon from '@/components/RouteIcon';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import { parseYouTube, recursos, ruta } from '@/data/academia';

type Props = { params: Promise<{ seccion: string }> };

export function generateStaticParams() { return ruta.map(s => ({ seccion: s.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seccion } = await params;
  const s = ruta.find(r => r.slug === seccion);
  return { title: s ? `${s.title} | Portal del Alumno` : 'Portal del Alumno' };
}

export default async function SeccionPage({ params }: Props) {
  const { seccion } = await params;
  const index = ruta.findIndex(r => r.slug === seccion);
  if (index < 0) notFound();
  const s = ruta[index];
  const next = ruta[index + 1];
  const prev = ruta[index - 1];

  return <>
    <section className="lesson-head">
      <div className="wrap">
        <Link href="/portal" className="back-link"><ArrowLeft size={18} aria-hidden="true" /> Volver al portal</Link>
        <div className="lesson-title">
          <span className="route-icon route-icon-lg"><RouteIcon name={s.icon} size={30} /></span>
          <div><p className="eyebrow">Ruta gratuita · {s.number} de {ruta.length.toString().padStart(2, '0')}</p><h1>{s.title}</h1></div>
        </div>
        <p className="lead-sm">{s.intro}</p>
      </div>
    </section>

    <div className="wrap lesson-body">
      {s.schedule && <section className="lesson-block" data-reveal aria-labelledby="prog-title">
        <h2 id="prog-title">Programación de lives</h2>
        <LiveSchedule />
      </section>}

      {s.series.map((serie, i) => {
        const { videoId, listId } = parseYouTube(serie.url);
        return <section className="lesson-block" data-reveal key={serie.title} aria-labelledby={`serie-${i}`}>
          <div className="serie-head">
            <div><h2 id={`serie-${i}`}>{serie.title}</h2><p>{serie.description}</p></div>
            <a href={serie.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">Ver en YouTube <ExternalLink size={16} aria-hidden="true" /></a>
          </div>
          <YouTubeEmbed videoId={videoId} listId={listId} title={serie.title} />
          {listId && <p className="serie-tip">Usa el ícono de lista en el reproductor para ver todos los episodios en orden.</p>}
        </section>;
      })}

      {s.lab && <section className="lesson-block" data-reveal aria-labelledby="lab-title">
        <h2 id="lab-title">Laboratorio: practica la lectura de una gráfica</h2>
        <p>Selecciona un concepto y observa qué cambia en el gráfico.</p>
        <ChartLab />
      </section>}

      {s.resources && <section className="lesson-block" data-reveal aria-labelledby="rec-title">
        <h2 id="rec-title">Tus materiales</h2>
        <ul className="resource-list">
          {recursos.map(r => <li key={r.title} className="resource">
            <span className="resource-icon"><FileText size={24} aria-hidden="true" /><small>{r.format}</small></span>
            <div><h3>{r.title}</h3><p>{r.description}</p></div>
            {r.file
              ? <a className="btn btn-green btn-sm" href={r.file} download>Descargar {r.format}</a>
              : <span className="btn btn-disabled btn-sm" aria-disabled="true">Próximamente</span>}
          </li>)}
        </ul>
      </section>}

      <nav className="lesson-nav" data-reveal aria-label="Navegación de la ruta">
        {prev ? <Link href={`/portal/${prev.slug}`}><small>Anterior</small><span><ArrowLeft size={18} aria-hidden="true" /> {prev.number}. {prev.title}</span></Link> : <span />}
        {next ? <Link href={`/portal/${next.slug}`} className="lesson-nav-next"><small>Siguiente</small><span>{next.number}. {next.title} <ArrowRight size={18} aria-hidden="true" /></span></Link>
          : <Link href="/portal" className="lesson-nav-next"><small>Terminaste la ruta</small><span>Volver al portal <ArrowRight size={18} aria-hidden="true" /></span></Link>}
      </nav>
    </div>
  </>;
}
