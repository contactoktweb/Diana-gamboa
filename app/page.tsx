import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, GraduationCap, FolderDown, Radio, Route, Users, Youtube } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ScamNotice from '@/components/ScamNotice';
import { YOUTUBE } from '@/data/academia';

const beneficios = [
  { icon: BookOpen, title: 'Clases gratuitas desde cero', text: 'Videos organizados para empezar sin conocimientos previos.' },
  { icon: Route, title: 'Una ruta de aprendizaje', text: 'Sabrás siempre qué estudiar y cómo continuar.' },
  { icon: Radio, title: 'Lives gratuitos de análisis', text: 'Análisis en vivo con horarios en tu hora local.' },
  { icon: FolderDown, title: 'Biblioteca de recursos', text: 'Guías y hojas de práctica para descargar.' },
  { icon: Users, title: 'Salón Diana Gamboa', text: 'Clases privadas en vivo para practicar juntos.', premium: true },
  { icon: GraduationCap, title: 'Cursos especializados', text: 'Formaciones por módulos para profundizar.', premium: true },
];

export default function HomePage() {
  return <>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <SiteHeader />
    <main id="contenido">
      <section className="hero" aria-labelledby="hero-title">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Diana Gamboa · Educación bursátil</p>
            <h1 id="hero-title">Aprende a leer el <em>idioma del mercado</em></h1>
            <p className="lead">Una academia para aprender a comprender el comportamiento del precio, desarrollar tu criterio de análisis y avanzar paso a paso, desde los fundamentos hasta una formación más especializada.</p>
            <div className="hero-actions">
              <Link href="/registro" className="btn btn-gold btn-lg">Quiero ser alumno gratis <ArrowRight size={20} aria-hidden="true" /></Link>
              <p className="hero-login">¿Ya eres alumno? <Link href="/ingresar">Iniciar sesión</Link></p>
            </div>
          </div>
          <div className="hero-photo">
            <Image src="/diana-borgona.webp" alt="Diana Gamboa, analista de mercados bursátiles" fill priority sizes="(max-width: 860px) 100vw, 50vw" />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="beneficios-title">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <p className="eyebrow">Tu academia</p>
            <h2 id="beneficios-title">¿Qué encontrarás en la academia?</h2>
            <p>Todo organizado en un solo lugar para que aprendas a tu ritmo.</p>
          </div>
          <ul className="stair">
            {beneficios.map(({ icon: Icon, title, text, premium }, i) => <li key={title} className={`stair-step ${premium ? 'is-premium' : ''}`} data-reveal style={{ '--i': i } as React.CSSProperties}>
              <div className="stair-text">
                <span className="stair-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <div className="stair-candle" aria-hidden="true"><span className="stair-body"><Icon size={22} /></span></div>
            </li>)}
            <li className="stair-group stair-group-free"><span>Gratis con tu registro</span></li>
            <li className="stair-group stair-group-paid"><span>Con Diana · de pago</span></li>
          </ul>
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
            <p className="lead-sm">Soy analista de mercados bursátiles y especialista en acciones y opciones. Mi propósito es que entiendas lo que estás viendo en una gráfica y construyas tu propio criterio.</p>
            <p>No comparto señales para copiar. Te enseño a observar, a hacer las preguntas correctas y a decidir con calma, paso a paso.</p>
            <ol className="about-steps">
              <li><strong>Observar</strong><span>Leer lo que muestra el precio.</span></li>
              <li><strong>Comprender</strong><span>Conectar las piezas con contexto.</span></li>
              <li><strong>Decidir</strong><span>Con criterio propio, no con señales.</span></li>
            </ol>
          </div>
        </div>
      </section>

      <section className="section invite" aria-labelledby="invite-title">
        <div className="wrap invite-inner" data-reveal>
          <h2 id="invite-title">Tu formación empieza con un primer paso</h2>
          <p>Regístrate gratis y accede a tu ruta de aprendizaje, los lives y la biblioteca de recursos.</p>
          <Link href="/registro" className="btn btn-gold btn-lg">Comienza tu formación gratis <ArrowRight size={20} aria-hidden="true" /></Link>
          <a className="invite-yt" href={YOUTUBE} target="_blank" rel="noopener noreferrer"><Youtube size={18} aria-hidden="true" /> ¿Prefieres conocerme primero? Visita mi canal de YouTube</a>
        </div>
      </section>

      <ScamNotice />
    </main>
    <SiteFooter />
  </>;
}
