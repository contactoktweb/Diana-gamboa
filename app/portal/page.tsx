import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Download, GraduationCap, Users } from 'lucide-react';
import PortalGreeting from '@/components/PortalGreeting';
import DescubreNivel from '@/components/reto/DescubreNivel';
import { EnlaceDescarga } from '@/components/Rastreo';
import { getContenido } from '@/lib/contenido';
import { Enriquecido, Parrafos } from '@/lib/contenido/texto';
import type { Seccion } from '@/lib/contenido/predeterminado';
import { Icono } from '@/lib/iconos';
import { getSesion } from '@/lib/sesion';

function RouteCard({ s, i, start }: { s: Seccion; i: number; start?: string }) {
  return <li data-reveal style={{ '--i': i } as React.CSSProperties}>
    <Link href={`/portal/${s.slug}`} className="route-card">
      <div className="route-media" aria-hidden="true">
        <span className="route-num">{s.numero}</span>
        <span className="route-icon"><Icono nombre={s.icono} size={26} /></span>
        {start && <span className="route-start">{start}</span>}
      </div>
      <div className="route-body">
        <h3>{s.titulo}</h3>
        <p>{s.resumen}</p>
      </div>
      <div className="route-foot">
        <span>{s.boton}</span>
        <span className="route-go" aria-hidden="true"><ArrowUpRight size={20} /></span>
      </div>
    </Link>
  </li>;
}

export default async function PortalPage() {
  const [{ portal: p, rutas, biblioteca, formacion: f }, sesion] = await Promise.all([getContenido(), getSesion()]);
  const visibles = rutas.secciones.filter(s => s.visible);
  const series = visibles.filter(s => s.tipo === 'serie');
  const complementos = visibles.filter(s => s.tipo === 'complemento');
  const guia = biblioteca.recursos[0];

  return <>
    <section className="portal-hero" aria-labelledby="portal-title">
      <div className="portal-hero-photo" aria-hidden="true">
        <Image src={p.foto} alt="" fill priority sizes="(max-width: 860px) 100vw, 62vw" />
      </div>
      <div className="wrap portal-hero-inner">
        <div className="portal-hero-copy">
          <p className="eyebrow eyebrow-gold">{p.etiqueta}</p>
          <h1 id="portal-title"><PortalGreeting nombre={sesion?.perfil?.nombre} /></h1>
          <p className="portal-hero-welcome">{p.bienvenida}</p>
          <Parrafos texto={p.texto} />
          <a href="#ruta-title" className="btn btn-gold">{p.boton} <ArrowRight size={18} aria-hidden="true" /></a>
        </div>
      </div>
    </section>

    <section className="section" aria-labelledby="ruta-title">
      <div className="wrap">
        <DescubreNivel />

        <div className="section-head section-head-left" data-reveal>
          <p className="eyebrow">{p.rutaEtiqueta}</p>
          <h2 id="ruta-title">{p.rutaTitulo}</h2>
          <Parrafos texto={p.rutaTexto} />
        </div>

        {series.length > 0 && <>
          <h3 className="route-group">{p.grupoSeries}</h3>
          <ol className="route-grid route-grid-series">
            {series.map((s, i) => <RouteCard key={s.slug} s={s} i={i} start={i === 0 ? p.empiezaAqui : undefined} />)}
          </ol>
        </>}

        {complementos.length > 0 && <>
          <h3 className="route-group">{p.grupoComplementos}</h3>
          <ul className="route-grid route-grid-extra">
            {complementos.map((s, i) => <RouteCard key={s.slug} s={s} i={i} />)}
          </ul>
        </>}

        {guia && <aside className="welcome-gift" data-reveal>
          <span className="welcome-icon"><Download size={26} aria-hidden="true" /></span>
          <div><h2>{p.regaloTitulo}</h2><Parrafos texto={p.regaloTexto} /></div>
          {guia.archivo
            ? <EnlaceDescarga href={guia.archivo} recurso={guia.titulo} className="btn btn-green">{p.regaloBoton} <Download size={18} aria-hidden="true" /></EnlaceDescarga>
            : <span className="btn btn-ghost" aria-disabled="true">Próximamente</span>}
        </aside>}
      </div>
    </section>

    {f.mostrar && <section className="section section-green" aria-labelledby="formacion-title">
      <div className="wrap">
        <div className="section-head section-head-left" data-reveal>
          <p className="eyebrow eyebrow-gold">{f.etiqueta}</p>
          <h2 id="formacion-title">{f.titulo}</h2>
          <Parrafos texto={f.texto} />
        </div>
        <div className="premium-grid">
          <article className="premium-card premium-salon" data-reveal>
            <div className="premium-content">
              <div className="premium-head">
                <span className="premium-icon"><Users size={24} aria-hidden="true" /></span>
                <span className="premium-tag">{f.salonEtiqueta}</span>
              </div>
              <h3>{f.salonTitulo}</h3>
              <Parrafos texto={f.salonResumen} />
              <Link href="/portal/salon" className="btn btn-gold">{f.salonBoton} <ArrowRight size={18} aria-hidden="true" /></Link>
            </div>
            <div className="premium-visual" aria-hidden="true">
              <Image src={f.salonFoto} alt="" fill sizes="(max-width: 800px) 50vw, 22vw" />
            </div>
          </article>
          <article className="premium-card premium-cursos" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
            <div className="premium-content">
              <div className="premium-head">
                <span className="premium-icon"><GraduationCap size={24} aria-hidden="true" /></span>
                <span className="premium-tag">{f.cursosEtiqueta}</span>
              </div>
              <h3>{f.cursosTitulo}</h3>
              <Parrafos texto={f.cursosTexto} />
              {f.cursosNota && <p className="premium-note"><Enriquecido texto={f.cursosNota} /></p>}
              {f.cursosUrl
                ? <a className="btn btn-gold" href={f.cursosUrl} target="_blank" rel="noopener noreferrer">{f.cursosBoton} <ArrowRight size={18} aria-hidden="true" /></a>
                : <span className="btn btn-ghost" aria-disabled="true">Próximamente</span>}
            </div>
            <div className="premium-visual" aria-hidden="true">
              <svg viewBox="0 0 160 160"><g fill="none" strokeWidth="5" strokeLinecap="round"><path d="M40 30v100M100 15v110M70 50v95M130 40v80" /><rect x="28" y="55" width="24" height="45" rx="4" /><rect x="58" y="72" width="24" height="50" rx="4" /><rect x="88" y="35" width="24" height="55" rx="4" /><rect x="118" y="58" width="24" height="40" rx="4" /></g></svg>
            </div>
          </article>
        </div>
      </div>
    </section>}
  </>;
}
