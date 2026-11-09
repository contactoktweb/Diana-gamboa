import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ChevronRight, ExternalLink, FileText, Radio } from 'lucide-react';
import ChartLab from '@/components/ChartLab';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import { EnlaceDescarga, Visita } from '@/components/Rastreo';
import { getContenido } from '@/lib/contenido';
import { Parrafos } from '@/lib/contenido/texto';
import { Icono } from '@/lib/iconos';
import { parseYouTube, urlOEmbed } from '@/lib/youtube';

type Props = { params: Promise<{ seccion: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seccion } = await params;
  const { rutas } = await getContenido();
  const s = rutas.secciones.find(r => r.slug === seccion);
  return { title: s ? `${s.titulo} | Portal del Alumno` : 'Portal del Alumno' };
}

export default async function SeccionPage({ params }: Props) {
  const { seccion } = await params;
  const { rutas, biblioteca, portal: p, global: g } = await getContenido();
  const ruta = rutas.secciones.filter(r => r.visible);
  const index = ruta.findIndex(r => r.slug === seccion);
  if (index < 0) notFound();
  const s = ruta[index];
  // Las playlists pegadas sin video inicial toman su portada de YouTube (se guarda un día).
  const portadas = await Promise.all(s.videos.map(async v => {
    const yt = parseYouTube(v.url);
    const u = yt && !yt.videoId ? urlOEmbed(v.url) : null;
    if (!u) return undefined;
    try { const r = await fetch(u, { next: { revalidate: 86400 } }); return r.ok ? ((await r.json()).thumbnail_url as string) : undefined; } catch { return undefined; }
  }));
  const next = ruta[index + 1];
  const prev = ruta[index - 1];

  return <>
    <Visita referencia={s.slug} />
    <section className="lesson-head">
      <div className="wrap">
        <nav className="breadcrumb" aria-label="Estás aquí">
          <Link href="/portal" className="back-link"><ArrowLeft size={18} aria-hidden="true" /> Inicio del portal</Link>
          <ChevronRight size={16} aria-hidden="true" />
          <span aria-current="page">{s.titulo}</span>
        </nav>
        <div className="lesson-title">
          <span className="route-icon route-icon-lg"><Icono nombre={s.icono} size={30} /></span>
          <div><p className="eyebrow">{s.tipo === 'serie' ? `Serie educativa · ${s.numero}` : 'Recurso complementario'}</p><h1>{s.tituloPagina || s.titulo}</h1></div>
        </div>
        <Parrafos texto={s.intro} className="lead-sm" />
      </div>
    </section>

    <div className="wrap lesson-body">
      {s.lives && <section className="lives-cta" data-reveal aria-label="Transmisiones en YouTube">
        <span className="lives-icon"><Radio size={28} aria-hidden="true" /></span>
        <div><Parrafos texto={p.livesTexto} /></div>
        <a href={g.youtubeLives} target="_blank" rel="noopener noreferrer" className="btn btn-gold">{p.livesBoton} <ExternalLink size={18} aria-hidden="true" /></a>
      </section>}

      {s.videos.map((v, i) => {
        const yt = parseYouTube(v.url);
        const poster = yt && !yt.videoId ? portadas[i] : undefined;
        return <section className="lesson-block serie" data-reveal key={i} aria-labelledby={`serie-${i}`}>
          <div className="serie-video">{yt ? <YouTubeEmbed videoId={yt.videoId} listId={yt.listId} title={v.titulo} poster={poster} /> : null}</div>
          <div className="serie-info">
            <h2 id={`serie-${i}`}>{v.titulo}</h2>
            <Parrafos texto={v.descripcion} />
            {yt?.listId && <p className="serie-tip">Usa el ícono de lista en el reproductor para ver todos los episodios en orden.</p>}
            <a href={v.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">Ver en YouTube <ExternalLink size={16} aria-hidden="true" /></a>
          </div>
        </section>;
      })}

      {s.laboratorio && <section className="lesson-block" data-reveal aria-labelledby="lab-title">
        <h2 id="lab-title">Laboratorio: practica la lectura de una gráfica</h2>
        <p>Selecciona un concepto y observa qué cambia en el gráfico.</p>
        <ChartLab />
      </section>}

      {s.recursos && <section className="lesson-block" data-reveal aria-labelledby="rec-title">
        <h2 id="rec-title" className="sr-only">Materiales</h2>
        <ul className="resource-list">
          {biblioteca.recursos.map((r, i) => <li key={i} className="resource">
            <span className="resource-icon"><FileText size={24} aria-hidden="true" /><small>{r.formato}</small></span>
            <div><h3>{r.titulo}</h3><Parrafos texto={r.descripcion} /></div>
            {r.archivo
              ? <EnlaceDescarga className="btn btn-green btn-sm" href={r.archivo} recurso={r.titulo}>Descargar {r.formato}</EnlaceDescarga>
              : <span className="btn btn-disabled btn-sm" aria-disabled="true">Próximamente</span>}
          </li>)}
        </ul>
      </section>}

      <nav className="lesson-nav" data-reveal aria-label="Navegación de la ruta">
        {prev ? <Link href={`/portal/${prev.slug}`}><small>Anterior</small><span><ArrowLeft size={18} aria-hidden="true" /> {prev.numero}. {prev.titulo}</span></Link> : <span />}
        {next ? <Link href={`/portal/${next.slug}`} className="lesson-nav-next"><small>Siguiente</small><span>{next.numero}. {next.titulo} <ArrowRight size={18} aria-hidden="true" /></span></Link>
          : <Link href="/portal" className="lesson-nav-next"><small>Inicio del portal</small><span>Volver a mis clases <ArrowRight size={18} aria-hidden="true" /></span></Link>}
      </nav>
    </div>
  </>;
}
