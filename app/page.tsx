import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ScamNotice from '@/components/ScamNotice';
import RetoTeaser from '@/components/reto/RetoTeaser';
import { getContenido } from '@/lib/contenido';
import { Enriquecido, Parrafos } from '@/lib/contenido/texto';
import { Icono } from '@/lib/iconos';

export default async function HomePage() {
  const { inicio: c, global: g } = await getContenido();
  // Los espacios de pago van siempre después de los gratuitos.
  const espacios = [...c.espacios.filter(e => !e.pago), ...(c.espaciosMostrarPago ? c.espacios.filter(e => e.pago) : [])];
  const gratis = espacios.filter(e => !e.pago).length;

  return <>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <SiteHeader />
    <main id="contenido">
      <section className="hero" aria-labelledby="hero-title">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">{c.heroEtiqueta}</p>
            <h1 id="hero-title">{c.heroTitulo} <em>{c.heroTituloDestacado}</em></h1>
            <Parrafos texto={c.heroTexto} className="lead" />
            <div className="hero-actions">
              <Link href="/registro" className="btn btn-gold btn-lg">{g.botonPrincipal} <ArrowRight size={20} aria-hidden="true" /></Link>
              <p className="cta-note">{g.notaBoton}</p>
              <p className="hero-login">¿Ya eres alumno? <Link href="/ingresar">Iniciar sesión</Link></p>
            </div>
            {(c.heroFraseTitulo || c.heroFrase) && <p className="hero-quote"><span>{c.heroFraseTitulo}</span> <Enriquecido texto={c.heroFrase} /></p>}
          </div>
          <div className="hero-photo">
            <Image src={c.heroFoto} alt={`${g.nombreSitio}, analista del mercado de valores`} fill priority sizes="(max-width: 860px) 100vw, 50vw" />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="aprender-title">
        <div className="wrap learn">
          <div className="learn-top">
            <div className="learn-head" data-reveal>
              <p className="eyebrow">{c.aprenderEtiqueta}</p>
              <h2 id="aprender-title">{c.aprenderTitulo}</h2>
              <Parrafos texto={c.aprenderTexto} />
              {c.aprenderAcento && <p className="learn-accent">{c.aprenderAcento}</p>}
            </div>
            {c.aprenderFoto && <figure className="learn-photo" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
              <Image src={c.aprenderFoto} alt={`${g.nombreSitio} explicando velas japonesas`} fill sizes="(max-width: 900px) 100vw, 45vw" />
            </figure>}
          </div>
          <ol className="learn-list">
            {c.aprendizajes.map((a, i) => <li key={i} data-reveal style={{ '--i': i } as React.CSSProperties}>
              <span className="learn-icon"><Icono nombre={a.icono} size={26} /></span>
              <span className="learn-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{a.titulo}</h3>
              <Parrafos texto={a.texto} />
            </li>)}
          </ol>
        </div>
      </section>

      {c.retoMostrar && <RetoTeaser etiqueta={c.retoEtiqueta} titulo={c.retoTitulo} texto={c.retoTexto} boton={c.retoBoton} nota={c.retoNota} />}

      <section className="section section-cream" id="sobre-diana" aria-labelledby="sobre-title">
        <div className="wrap about-grid">
          <div className="about-photo" data-reveal>
            <Image src={c.sobreFoto} alt={g.nombreSitio} fill sizes="(max-width: 860px) 100vw, 40vw" />
          </div>
          <div className="about-copy" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
            <p className="eyebrow">{c.sobreEtiqueta}</p>
            <h2 id="sobre-title">{c.sobreTitulo}</h2>
            <Parrafos texto={c.sobreIntro} className="lead-sm" />
            <Parrafos texto={c.sobreTexto} />
            {c.sobreFrase && <blockquote className="signature">{c.sobreFrase}</blockquote>}
            <Link href="/sobre-diana" className="btn btn-outline">{c.sobreBoton} <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="espacios-title">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <p className="eyebrow">{c.espaciosEtiqueta}</p>
            <h2 id="espacios-title">{c.espaciosTitulo}</h2>
            <p>{c.espaciosSubtitulo}</p>
          </div>
          <ul className={`stair ${c.espaciosMostrarPago ? '' : 'stair-solo-gratis'}`} style={{ '--n': espacios.length, '--col-gratis': `1 / ${gratis + 1}`, '--col-pago': `${gratis + 1} / -1` } as React.CSSProperties}>
            {espacios.map((e, i) => <li key={i} className={`stair-step ${e.pago ? 'is-premium' : ''}`} data-reveal style={{ '--i': i } as React.CSSProperties}>
              <div className="stair-text">
                <span className="stair-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{e.titulo}</h3>
                <p>{e.texto}</p>
              </div>
              <div className="stair-candle" aria-hidden="true"><span className="stair-body"><Icono nombre={e.icono} size={22} /></span></div>
            </li>)}
            <li className="stair-group stair-group-free"><span>{c.espaciosGrupoGratis}</span></li>
            {c.espaciosMostrarPago && <li className="stair-group stair-group-paid"><span>{c.espaciosGrupoPago}</span></li>}
          </ul>
        </div>
      </section>

      <section className="section invite" aria-labelledby="invite-title">
        <div className="wrap invite-inner" data-reveal>
          <h2 id="invite-title">{c.invitacionTitulo}</h2>
          <Parrafos texto={c.invitacionTexto} />
          <Link href="/registro" className="btn btn-gold btn-lg">{g.botonPrincipal} <ArrowRight size={20} aria-hidden="true" /></Link>
          <p className="cta-note">{g.notaBoton}</p>
        </div>
      </section>

      <ScamNotice />
    </main>
    <SiteFooter />
  </>;
}
