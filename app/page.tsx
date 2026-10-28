import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, ChartCandlestick, ChartNoAxesCombined, Compass, FolderDown, GraduationCap, Radio, Route, Users } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ScamNotice from '@/components/ScamNotice';

const aprendizajes = [
  { icon: ChartCandlestick, title: 'Aprender a leer una gráfica', text: 'Conoce las velas japonesas, el comportamiento del precio y las herramientas básicas que nos ayudan a comprender lo que estamos observando.' },
  { icon: ChartNoAxesCombined, title: 'Aprender a analizar', text: 'Descubre cómo se relacionan las tendencias, los niveles, las medias móviles y el recorrido del precio para construir una lectura ordenada.' },
  { icon: Compass, title: 'Desarrollar tu propio criterio', text: 'Aprende a hacer las preguntas correctas, reunir información y llegar a tus propias conclusiones antes de estudiar estrategias de inversión.' },
];

const espacios = [
  { icon: BookOpen, title: 'Clases gratuitas desde cero', text: 'Videos educativos para comenzar sin conocimientos previos.' },
  { icon: Route, title: 'Una ruta de aprendizaje', text: 'Tus clases organizadas para saber por dónde empezar y cómo continuar.' },
  { icon: Radio, title: 'Lives gratuitos en YouTube', text: 'Transmisiones para observar y analizar el mercado conmigo.' },
  { icon: FolderDown, title: 'Biblioteca de recursos', text: 'Guías y materiales para practicar y reforzar lo aprendido.' },
  { icon: Users, title: 'Salón Diana Gamboa', text: 'Clases privadas en vivo para practicar y profundizar en el análisis.', premium: true },
  { icon: GraduationCap, title: 'Cursos especializados', text: 'Formaciones para continuar desarrollando tus conocimientos.', premium: true },
];

export default function HomePage() {
  return <>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <SiteHeader />
    <main id="contenido">
      <section className="hero" aria-labelledby="hero-title">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Diana Gamboa · El idioma del mercado</p>
            <h1 id="hero-title">Aprende a leer el <em>idioma del mercado</em></h1>
            <p className="hero-quote">Antes de comprar, antes de vender y antes de buscar una estrategia, hay algo que necesitas aprender: <strong>leer el mercado.</strong></p>
            <p className="lead">Aquí aprenderás desde cero a comprender lo que sucede en una gráfica, reconocer el comportamiento del precio y desarrollar tu propio análisis.</p>
            <div className="hero-actions">
              <Link href="/registro" className="btn btn-gold btn-lg">Quiero aprender con Diana <ArrowRight size={20} aria-hidden="true" /></Link>
              <p className="cta-note">Crea tu cuenta gratis y descubre tu ruta de aprendizaje.</p>
              <p className="hero-login">¿Ya eres alumno? <Link href="/ingresar">Iniciar sesión</Link></p>
            </div>
          </div>
          <div className="hero-photo">
            <Image src="/diana-borgona.webp" alt="Diana Gamboa, analista del mercado de valores" fill priority sizes="(max-width: 860px) 100vw, 50vw" />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="aprender-title">
        <div className="wrap learn">
          <div className="learn-top">
            <div className="learn-head" data-reveal>
              <p className="eyebrow">Lo esencial</p>
              <h2 id="aprender-title">¿Qué vas a aprender conmigo?</h2>
              <p>Una gráfica puede parecer complicada cuando no sabes qué estás mirando.</p>
              <p>Pero cuando comienzas a comprender sus elementos, aprendes a reconocer cómo se mueve el precio y qué información puedes obtener de ese movimiento.</p>
              <p className="learn-accent">Aquí comenzamos por lo esencial.</p>
            </div>
            <figure className="learn-photo" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
              <Image src="/fotos/diana-pizarra.webp" alt="Diana Gamboa explicando velas japonesas en una pizarra" fill sizes="(max-width: 900px) 100vw, 45vw" />
            </figure>
          </div>
          <ol className="learn-list">
            {aprendizajes.map(({ icon: Icon, title, text }, i) => <li key={title} data-reveal style={{ '--i': i } as React.CSSProperties}>
              <span className="learn-icon"><Icon size={26} aria-hidden="true" /></span>
              <span className="learn-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>)}
          </ol>
        </div>
      </section>

      <section className="section section-cream" id="sobre-diana" aria-labelledby="sobre-title">
        <div className="wrap about-grid">
          <div className="about-photo" data-reveal>
            <Image src="/diana-gesto.webp" alt="Diana Gamboa sonriendo" fill sizes="(max-width: 860px) 100vw, 40vw" />
          </div>
          <div className="about-copy" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
            <p className="eyebrow">Sobre Diana</p>
            <h2 id="sobre-title">Hola, soy Diana Gamboa</h2>
            <p className="lead-sm">Soy analista del mercado de valores, educadora, madre y una mujer profundamente enamorada de lo que hace.</p>
            <p>Creo que antes de comprar, vender o buscar una estrategia, necesitas aprender a leer el mercado. Porque detrás de cada vela hay emociones, decisiones y una historia que aprender a interpretar.</p>
            <p>Y también creo que una mente tranquila, un cuerpo descansado y unas emociones en equilibrio son parte importante de ese aprendizaje.</p>
            <blockquote className="signature">Yo no adivino el mercado. Lo leo. Y te enseño a leerlo.</blockquote>
            <Link href="/sobre-diana" className="btn btn-outline">Conoce mi historia <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="espacios-title">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <p className="eyebrow">Tu academia</p>
            <h2 id="espacios-title">Tu aprendizaje comienza aquí</h2>
            <p>Desde tu primera gráfica hasta tu propio análisis.</p>
          </div>
          <ul className="stair">
            {espacios.map(({ icon: Icon, title, text, premium }, i) => <li key={title} className={`stair-step ${premium ? 'is-premium' : ''}`} data-reveal style={{ '--i': i } as React.CSSProperties}>
              <div className="stair-text">
                <span className="stair-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <div className="stair-candle" aria-hidden="true"><span className="stair-body"><Icon size={22} /></span></div>
            </li>)}
            <li className="stair-group stair-group-free"><span>Acceso gratuito</span></li>
            <li className="stair-group stair-group-paid"><span>Formación adicional de pago</span></li>
          </ul>
        </div>
      </section>

      <section className="section invite" aria-labelledby="invite-title">
        <div className="wrap invite-inner" data-reveal>
          <h2 id="invite-title">Comienza tu formación desde cero</h2>
          <p>No importa si nunca has abierto una gráfica.</p>
          <p>Aquí encontrarás una formación organizada para aprender a comprender el mercado, desarrollar tu propio análisis y avanzar a tu ritmo.</p>
          <Link href="/registro" className="btn btn-gold btn-lg">Quiero aprender con Diana <ArrowRight size={20} aria-hidden="true" /></Link>
          <p className="cta-note">Crea tu cuenta gratis y descubre tu ruta de aprendizaje.</p>
        </div>
      </section>

      <ScamNotice />
    </main>
    <SiteFooter />
  </>;
}
