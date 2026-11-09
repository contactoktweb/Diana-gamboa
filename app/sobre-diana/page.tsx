import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { getContenido } from '@/lib/contenido';
import { Enriquecido } from '@/lib/contenido/texto';
import type { BloqueHistoria } from '@/lib/contenido/predeterminado';

export async function generateMetadata(): Promise<Metadata> {
  const { sobre, global } = await getContenido();
  return { title: `${sobre.etiqueta} | ${global.nombreSitio} · El idioma del mercado`, description: sobre.intro };
}

/** Agrupa los bloques de la historia en partes, separadas por los bloques «separador». */
function partes(bloques: BloqueHistoria[]) {
  const out: BloqueHistoria[][] = [[]];
  for (const b of bloques) {
    if (b.tipo === 'separador') out.push([]);
    else out[out.length - 1].push(b);
  }
  return out.filter(p => p.length);
}

function Bloque({ b }: { b: BloqueHistoria }) {
  switch (b.tipo) {
    case 'destacado': return <p className="story-pull"><Enriquecido texto={b.texto} /></p>;
    case 'grande': return <p className="story-big"><Enriquecido texto={b.texto} /></p>;
    case 'firma': return <blockquote className="signature story-signature">{b.texto}</blockquote>;
    case 'lista': return <ul className="story-pieces">{b.texto.split('\n').filter(l => l.trim()).map((l, i) => <li key={i}><Enriquecido texto={l} /></li>)}</ul>;
    case 'foto': return b.foto ? <figure className="story-photo"><Image src={b.foto} alt={b.texto} fill sizes="(max-width: 760px) 100vw, 720px" /></figure> : null;
    default: return <p><Enriquecido texto={b.texto} /></p>;
  }
}

export default async function SobreDianaPage() {
  const { sobre: c, global: g } = await getContenido();
  return <>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <SiteHeader />
    <main id="contenido">
      <section className="story-hero">
        <div className="wrap story-hero-grid">
          <div className="story-hero-copy">
            <p className="eyebrow">{c.etiqueta}</p>
            <h1>{c.titulo}</h1>
            <p className="lead">{c.intro}</p>
          </div>
          <div className="story-hero-photo">
            <Image src={c.foto} alt={g.nombreSitio} fill priority sizes="(max-width: 860px) 100vw, 40vw" />
          </div>
        </div>
      </section>

      <article className="story wrap">
        {partes(c.bloques).map((parte, i) => {
          // Una foto sola entre dos partes no lleva la línea divisoria de bloque.
          if (parte.length === 1 && parte[0].tipo === 'foto') return <Bloque key={i} b={parte[0]} />;
          return <div className="story-block" key={i}>{parte.map((b, j) => b.tipo === 'foto'
            ? <div key={j} className="story-photo-inline"><Bloque b={b} /></div>
            : <Bloque key={j} b={b} />)}</div>;
        })}
      </article>

      <section className="section invite" aria-labelledby="historia-cta">
        <div className="wrap invite-inner">
          <h2 id="historia-cta">{c.ctaTitulo}</h2>
          <Link href="/registro" className="btn btn-gold btn-lg">{g.botonPrincipal} <ArrowRight size={20} aria-hidden="true" /></Link>
          <p className="cta-note">{g.notaBoton}</p>
        </div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
