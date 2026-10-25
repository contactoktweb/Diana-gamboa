import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Download, GraduationCap, Users } from 'lucide-react';
import PortalGreeting from '@/components/PortalGreeting';
import RouteIcon from '@/components/RouteIcon';
import { formacion, ruta } from '@/data/academia';

export default function PortalPage() {
  return <>
    <section className="portal-hero" aria-labelledby="portal-title">
      <div className="wrap portal-hero-grid">
        <div>
          <p className="portal-quote">«Toda buena decisión comienza con un buen análisis».</p>
          <h1 id="portal-title"><PortalGreeting /> <span>Te damos la bienvenida a tu Portal del Alumno</span></h1>
          <p>Tu espacio para aprender, practicar y avanzar a tu propio ritmo.</p>
        </div>
        <div className="portal-hero-photo" aria-hidden="true">
          <Image src="/diana-negro.webp" alt="" fill priority sizes="(max-width: 860px) 60vw, 30vw" />
        </div>
      </div>
    </section>

    <section className="section" aria-labelledby="ruta-title">
      <div className="wrap">
        <div className="section-head section-head-left">
          <p className="eyebrow">Gratis para alumnos</p>
          <h2 id="ruta-title">Tu ruta de aprendizaje gratuita</h2>
          <p>Comienza por la tarjeta 01 y sigue el orden. Cada sección tiene sus videos y recursos.</p>
        </div>
        <ol className="route-grid">
          {ruta.map(s => <li key={s.slug}>
            <Link href={`/portal/${s.slug}`} className="route-card">
              <span className="route-top"><span className="route-num">{s.number}</span><span className="route-icon"><RouteIcon name={s.icon} /></span></span>
              <h3>{s.title}</h3>
              <p>{s.summary}</p>
              <span className="route-cta">Entrar <ArrowRight size={18} aria-hidden="true" /></span>
            </Link>
          </li>)}
        </ol>

        <aside className="welcome-gift">
          <Download size={28} aria-hidden="true" />
          <div><h2>Tu regalo de bienvenida</h2><p>Descarga la Hoja del Proceso de Análisis y tenla a mano mientras estudias.</p></div>
          <Link href="/portal/biblioteca" className="btn btn-green">Ir a la biblioteca</Link>
        </aside>
      </div>
    </section>

    <section className="section section-green" aria-labelledby="formacion-title">
      <div className="wrap">
        <div className="section-head section-head-left">
          <p className="eyebrow eyebrow-gold">Siguiente nivel</p>
          <h2 id="formacion-title">Continúa tu formación con Diana</h2>
          <p>Espacios adicionales para practicar y profundizar.</p>
        </div>
        <div className="premium-grid">
          {formacion.map(f => <article key={f.key} className="premium-card">
            <span className="premium-icon">{f.key === 'salon' ? <Users size={28} aria-hidden="true" /> : <GraduationCap size={28} aria-hidden="true" />}</span>
            <span className="tag tag-gold">{f.tag}</span>
            <h3>{f.title}</h3>
            <p>{f.description}</p>
            {f.href
              ? <a className="btn btn-gold" href={f.href} target="_blank" rel="noopener noreferrer">{f.cta} <ArrowRight size={18} aria-hidden="true" /></a>
              : <span className="btn btn-disabled" aria-disabled="true">{f.cta}</span>}
          </article>)}
        </div>
      </div>
    </section>
  </>;
}
