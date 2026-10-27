import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Download, GraduationCap, Users } from 'lucide-react';
import PortalGreeting from '@/components/PortalGreeting';
import RouteIcon from '@/components/RouteIcon';
import { recursos, ruta, type SeccionRuta } from '@/data/academia';

function RouteCard({ s, i, start }: { s: SeccionRuta; i: number; start?: boolean }) {
  return <li data-reveal style={{ '--i': i } as React.CSSProperties}>
    <Link href={`/portal/${s.slug}`} className="route-card">
      <div className="route-media" aria-hidden="true">
        <span className="route-num">{s.number}</span>
        <span className="route-icon"><RouteIcon name={s.icon} /></span>
        {start && <span className="route-start">Empieza aquí</span>}
      </div>
      <div className="route-body">
        <h3>{s.title}</h3>
        <p>{s.summary}</p>
      </div>
      <div className="route-foot">
        <span>{s.cta}</span>
        <span className="route-go" aria-hidden="true"><ArrowUpRight size={20} /></span>
      </div>
    </Link>
  </li>;
}

export default function PortalPage() {
  const series = ruta.filter(s => s.kind === 'serie');
  const complementos = ruta.filter(s => s.kind === 'complemento');
  const guia = recursos[0];

  return <>
    <section className="portal-hero" aria-labelledby="portal-title">
      <div className="wrap portal-hero-grid">
        <div>
          <h1 id="portal-title"><PortalGreeting /> <span>Bienvenido a tu academia</span></h1>
          <p>Este es tu espacio para aprender a leer el mercado, comprender el comportamiento del precio y desarrollar tu propio análisis, paso a paso y a tu ritmo.</p>
        </div>
        <div className="portal-hero-photo" aria-hidden="true">
          <Image src="/diana-negro.webp" alt="" fill priority sizes="(max-width: 860px) 60vw, 30vw" />
        </div>
      </div>
    </section>

    <section className="section" aria-labelledby="ruta-title">
      <div className="wrap">
        <div className="section-head section-head-left" data-reveal>
          <p className="eyebrow">Acceso gratuito</p>
          <h2 id="ruta-title">Tu ruta de aprendizaje gratuita</h2>
          <p>Comienza por la primera serie y avanza a tu ritmo. También encontrarás transmisiones y materiales para practicar lo aprendido.</p>
        </div>

        <h3 className="route-group">Series educativas</h3>
        <ol className="route-grid route-grid-series">
          {series.map((s, i) => <RouteCard key={s.slug} s={s} i={i} start={i === 0} />)}
        </ol>

        <h3 className="route-group">Recursos complementarios</h3>
        <ul className="route-grid route-grid-extra">
          {complementos.map((s, i) => <RouteCard key={s.slug} s={s} i={i} />)}
        </ul>

        <aside className="welcome-gift" data-reveal>
          <span className="welcome-icon"><Download size={26} aria-hidden="true" /></span>
          <div><h2>Tu regalo de bienvenida</h2><p>Descarga tu Hoja del Proceso de Análisis y utilízala como guía mientras estudias.</p></div>
          {guia.file
            ? <a href={guia.file} download className="btn btn-green">Descargar mi guía <Download size={18} aria-hidden="true" /></a>
            : <span className="btn btn-ghost" aria-disabled="true">Próximamente</span>}
        </aside>
      </div>
    </section>

    <section className="section section-green" aria-labelledby="formacion-title">
      <div className="wrap">
        <div className="section-head section-head-left" data-reveal>
          <p className="eyebrow eyebrow-gold">Formación adicional de pago</p>
          <h2 id="formacion-title">Continúa tu formación con Diana</h2>
          <p>Opciones para ampliar tu formación cuando quieras profundizar. No son un requisito para comenzar a estudiar.</p>
        </div>
        <div className="premium-grid">
          <article className="premium-card premium-salon" data-reveal>
            <div className="premium-content">
              <div className="premium-head">
                <span className="premium-icon"><Users size={24} aria-hidden="true" /></span>
                <span className="premium-tag">Membresía mensual</span>
              </div>
              <h3>Salón Diana Gamboa</h3>
              <p>Un espacio para llevar lo aprendido a la práctica. Participa en dos clases privadas en vivo al mes, donde analizaremos gráficas, conectaremos las piezas del mercado y practicaremos juntos el proceso de análisis.</p>
              <Link href="/portal/salon" className="btn btn-gold">Conocer el Salón <ArrowRight size={18} aria-hidden="true" /></Link>
            </div>
            <div className="premium-visual" aria-hidden="true">
              <Image src="/diana-gesto.webp" alt="" fill sizes="(max-width: 800px) 50vw, 22vw" />
            </div>
          </article>
          <article className="premium-card premium-cursos" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
            <div className="premium-content">
              <div className="premium-head">
                <span className="premium-icon"><GraduationCap size={24} aria-hidden="true" /></span>
                <span className="premium-tag">Formaciones especializadas</span>
              </div>
              <h3>Cursos Diana Gamboa</h3>
              <p>Continúa aprendiendo. Profundiza tus conocimientos. Próximamente encontrarás nuevas formaciones para continuar desarrollando tu análisis y aprender a construir tus propias estrategias.</p>
              <p className="premium-note">Primer programa en preparación: <strong>Estrategia Diana Gamboa</strong>.</p>
              <span className="btn btn-ghost" aria-disabled="true">Próximamente</span>
            </div>
            <div className="premium-visual" aria-hidden="true">
              <svg viewBox="0 0 160 160"><g fill="none" strokeWidth="5" strokeLinecap="round"><path d="M40 30v100M100 15v110M70 50v95M130 40v80" /><rect x="28" y="55" width="24" height="45" rx="4" /><rect x="58" y="72" width="24" height="50" rx="4" /><rect x="88" y="35" width="24" height="55" rx="4" /><rect x="118" y="58" width="24" height="40" rx="4" /></g></svg>
            </div>
          </article>
        </div>
      </div>
    </section>
  </>;
}
