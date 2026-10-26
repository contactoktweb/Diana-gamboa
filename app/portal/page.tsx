import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Download, GraduationCap, Users } from 'lucide-react';
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
        <div className="section-head section-head-left" data-reveal>
          <p className="eyebrow">Gratis para alumnos</p>
          <h2 id="ruta-title">Tu ruta de aprendizaje gratuita</h2>
          <p>Comienza por la tarjeta 01 y sigue el orden. Cada sección tiene sus videos y recursos.</p>
        </div>
        <ol className="route-grid">
          {ruta.map((s, i) => <li key={s.slug} data-reveal style={{ '--i': i } as React.CSSProperties}>
            <Link href={`/portal/${s.slug}`} className="route-card">
              <div className="route-media" aria-hidden="true">
                <span className="route-num">{s.number}</span>
                <span className="route-icon"><RouteIcon name={s.icon} /></span>
                {i === 0 && <span className="route-start">Empieza aquí</span>}
              </div>
              <div className="route-body">
                <h3>{s.title}</h3>
                <p>{s.summary}</p>
              </div>
              <div className="route-foot">
                <span>{s.resources ? 'Materiales' : s.schedule ? 'Programación y videos' : 'Videos'}</span>
                <span className="route-go" aria-hidden="true"><ArrowUpRight size={20} /></span>
              </div>
            </Link>
          </li>)}
        </ol>

        <aside className="welcome-gift" data-reveal>
          <span className="welcome-icon"><Download size={26} aria-hidden="true" /></span>
          <div><h2>Tu regalo de bienvenida</h2><p>Descarga la Hoja del Proceso de Análisis y tenla a mano mientras estudias.</p></div>
          <Link href="/portal/biblioteca" className="btn btn-green">Ir a la biblioteca <ArrowRight size={18} aria-hidden="true" /></Link>
        </aside>
      </div>
    </section>

    <section className="section section-green" aria-labelledby="formacion-title">
      <div className="wrap">
        <div className="section-head section-head-left" data-reveal>
          <p className="eyebrow eyebrow-gold">Siguiente nivel</p>
          <h2 id="formacion-title">Continúa tu formación con Diana</h2>
          <p>Espacios adicionales para practicar y profundizar.</p>
        </div>
        <div className="premium-grid">
          {formacion.map((f, i) => <article key={f.key} className={`premium-card premium-${f.key}`} data-reveal style={{ '--i': i } as React.CSSProperties}>
            <div className="premium-content">
              <div className="premium-head">
                <span className="premium-icon">{f.key === 'salon' ? <Users size={24} aria-hidden="true" /> : <GraduationCap size={24} aria-hidden="true" />}</span>
                <span className="premium-tag">{f.tag}</span>
              </div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
              {f.href
                ? <a className="btn btn-gold" href={f.href} target="_blank" rel="noopener noreferrer">{f.cta} <ArrowRight size={18} aria-hidden="true" /></a>
                : <span className="btn btn-ghost" aria-disabled="true">{f.cta}</span>}
            </div>
            <div className="premium-visual" aria-hidden="true">
              {f.key === 'salon'
                ? <Image src="/diana-gesto.webp" alt="" fill sizes="(max-width: 800px) 50vw, 22vw" />
                : <svg viewBox="0 0 160 160"><g fill="none" strokeWidth="5" strokeLinecap="round"><path d="M40 30v100M100 15v110M70 50v95M130 40v80" /><rect x="28" y="55" width="24" height="45" rx="4" /><rect x="58" y="72" width="24" height="50" rx="4" /><rect x="88" y="35" width="24" height="55" rx="4" /><rect x="118" y="58" width="24" height="40" rx="4" /></g></svg>}
            </div>
          </article>)}
        </div>
      </div>
    </section>
  </>;
}
