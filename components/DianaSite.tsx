'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, ChartNoAxesCombined,
  Check, ChevronDown, CirclePlay, Clock3, Compass, Heart, Instagram, Menu,
  ShieldAlert, Sparkles, TrendingUp, Youtube, X,
} from 'lucide-react';

const YOUTUBE = 'https://www.youtube.com/@DianaGamboaMomentum';
const INSTAGRAM = 'https://www.instagram.com/dianagamboamomentum/';
const nav = [
  { name: 'Inicio', url: '#inicio' }, { name: 'El enfoque', url: '#enfoque' },
  { name: 'Laboratorio', url: '#laboratorio' }, { name: 'Aprende', url: '#aprende' },
  { name: 'Playlists', url: '/playlists' }, { name: 'Agenda', url: '#agenda' },
];
const steps = [
  { id: '01', label: 'Observar', subtitle: 'Aprende a ver antes de reaccionar.', description: 'Empieza por reconocer las velas: apertura, cierre, máximos, mínimos y estructura del precio. Identifica qué está sucediendo sin dejarte arrastrar por el ruido.', mini: 'LEER LA EVIDENCIA', icon: BookOpen },
  { id: '02', label: 'Interpretar', subtitle: 'Conecta las piezas del gráfico.', description: 'Relaciona tendencias, impulsos, pausas, soportes y resistencias. Una gráfica deja de ser una colección de líneas cuando encuentras relaciones entre sus movimientos.', mini: 'DAR SENTIDO AL PRECIO', icon: ChartNoAxesCombined },
  { id: '03', label: 'Contextualizar', subtitle: 'La última vela no cuenta toda la historia.', description: 'Entiende cómo se comporta el precio dentro de un contexto más amplio. Aprende a formular preguntas sobre la intención y la estructura del mercado.', mini: 'VER EL PANORAMA', icon: Compass },
  { id: '04', label: 'Construir criterio', subtitle: 'Tu análisis. Tus preguntas.', description: 'Desarrolla una forma de leer el mercado que no dependa de copiar operaciones ni de seguir señales. El objetivo no es predecirlo todo: es pensar por ti.', mini: 'PENSAR CON AUTONOMÍA', icon: TrendingUp },
];
const concepts = [
  { name: 'Velas', tag: '01 / LENGUAJE', headline: 'La vela es información.', detail: 'Abre la gráfica y empieza por cuatro datos: apertura, cierre, máximo y mínimo. Antes de una opinión, busca la evidencia.', takeaway: '¿QUÉ SUCEDIÓ?' },
  { name: 'Tendencia', tag: '02 / ESTRUCTURA', headline: 'Mira la dirección, no el ruido.', detail: 'Reconoce impulsos y retrocesos dentro de la estructura del precio. Un movimiento aislado no es toda la tendencia.', takeaway: '¿CÓMO SE MUEVE?' },
  { name: 'Niveles', tag: '03 / CONTEXTO', headline: 'Una línea no es una promesa.', detail: 'Aprende a observar zonas relevantes de soporte y resistencia sin confundirlas con una predicción o una operación garantizada.', takeaway: '¿DÓNDE IMPORTA?' },
  { name: 'Lectura completa', tag: '04 / CRITERIO', headline: 'Conecta el dibujo con la historia.', detail: 'Integra velas, tendencia, niveles y contexto. Hazte mejores preguntas para formar un análisis propio.', takeaway: '¿QUÉ PUEDO INFERIR?' },
];
const shows = [
  { idx: '01', eyebrow: 'TU PUNTO DE PARTIDA', title: 'Aprende a leer un chart desde cero', text: 'La playlist recomendada para empezar a entender velas, gráficos, tendencias y estructura, sin conocimientos previos.', design: 'chart', cta: 'Empieza desde cero' },
  { idx: '02', eyebrow: 'CADA MIÉRCOLES', title: 'El Método DG', text: 'Un espacio para aprender a analizar el mercado con un método de lectura, preguntas y contexto.', design: 'method', cta: 'Conoce el método' },
  { idx: '03', eyebrow: 'CADA SÁBADO', title: 'De la Gráfica a la Acción', text: 'Aprende a traducir lo que observas en un razonamiento más claro, antes de pensar en decisiones.', design: 'action', cta: 'Explora los episodios' },
];
const candles = [
  [48, 174, 198, 155, 213], [82, 199, 164, 146, 211], [116, 160, 146, 126, 178],
  [150, 146, 167, 130, 184], [184, 170, 130, 114, 182], [218, 128, 113, 96, 143],
  [252, 112, 141, 98, 154], [286, 141, 100, 84, 153], [320, 102, 121, 89, 139],
  [354, 121, 99, 80, 134], [388, 98, 70, 54, 114], [422, 69, 92, 53, 107],
  [456, 91, 65, 44, 109], [490, 66, 48, 29, 84], [524, 47, 70, 35, 91],
];

function ArrowLink({ href, children, light = false, external = false }: { href: string; children: React.ReactNode; light?: boolean; external?: boolean }) {
  const content = <>
    <span className="cta-text"><span>{children}</span><span aria-hidden="true">{children}</span></span>
    <span className="cta-arrow"><ArrowUpRight size={20} strokeWidth={1.8} /></span>
  </>;
  const className = `cta-link magnetic ${light ? 'cta-light' : ''}`;
  return !external && href.startsWith('/')
    ? <Link className={className} href={href}>{content}</Link>
    : <a className={className} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{content}</a>;
}
function SectionEyebrow({ index, children, contrast = false }: { index: string; children: React.ReactNode; contrast?: boolean }) {
  return <div className={`eyebrow ${contrast ? 'eyebrow-light' : ''}`}><span className="eyebrow-num">{index}</span><span className="eyebrow-line"/><span>{children}</span></div>;
}
function Logo({ variant = 'color', compact = false }: { variant?: 'color' | 'white' | 'gold' | 'emerald' | 'lime'; compact?: boolean }) {
  return <span className={`real-logo logo-${variant} ${compact ? 'logo-compact' : ''}`}>
    <Image src={compact ? '/dg-monogram.png' : '/dg-wordmark.png'} alt="Diana Gamboa" width={compact ? 80 : 225} height={compact ? 114 : 122} priority={compact} />
  </span>;
}
function Chart({ active }: { active: number }) {
  return <div className={`market-chart market-chart-${active}`} role="img" aria-label="Gráfico ficticio para explicar velas, tendencia, zonas de precio y contexto. No contiene datos de mercado reales.">
    <div className="market-chart-top"><span><span className="live-signal" /> DG · CHART LAB</span><span>SIMULACIÓN EDUCATIVA / 001</span></div>
    <svg viewBox="0 0 580 280" className="chart-svg" aria-hidden="true">
      <defs><linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#C9A227" stopOpacity=".2"/><stop offset="1" stopColor="#C9A227" stopOpacity="0"/></linearGradient></defs>
      {[32,78,124,170,216,262].map(y => <line className="grid-line" key={'y'+y} x1="12" x2="568" y1={y} y2={y}/>)}
      {[50,116,182,248,314,380,446,512].map(x => <line className="grid-line" key={'x'+x} x1={x} x2={x} y1="14" y2="266"/>)}
      <rect x="20" y="91" width="540" height="55" className="support-zone" rx="3"/>
      <path className="trend-highlight" d="M48 182 L82 180 L116 158 L150 163 L184 148 L218 133 L252 137 L286 115 L320 119 L354 107 L388 83 L422 87 L456 73 L490 54 L524 65" fill="none"/>
      <path className="trend-area" d="M48 182 L82 180 L116 158 L150 163 L184 148 L218 133 L252 137 L286 115 L320 119 L354 107 L388 83 L422 87 L456 73 L490 54 L524 65 L524 270 L48 270Z" fill="url(#trendFill)"/>
      {candles.map((v,i)=>{const [x,o,c,h,l]=v;const positive=c<o;return <g key={i} className={`demo-candle ${positive?'up':'down'}`}>
        <line x1={x} x2={x} y1={h} y2={l}/><rect x={x-7} y={Math.min(o,c)} width="14" height={Math.max(5,Math.abs(o-c))} rx="2"/>
      </g>;})}
      <circle cx="490" cy="52" r="39" className="context-ring"/><circle cx="490" cy="52" r="5" className="context-dot"/><line x1="490" x2="490" y1="16" y2="266" className="context-line"/>
      <text x="23" y="276" className="chart-time">09:00</text><text x="280" y="276" className="chart-time">12:00</text><text x="512" y="276" className="chart-time">16:00</text>
    </svg>
    <div className="market-chart-bottom"><span>PRECIO ↑</span><span>TIEMPO →</span><span className="chart-no-data">NO SON COTIZACIONES REALES</span></div>
  </div>;
}

export default function DianaSite() {
  const root = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState(false);
  const [step, setStep] = useState(0);
  const [concept, setConcept] = useState(0);
  const [faq, setFaq] = useState<number | null>(null);
  const [reading, setReading] = useState(0);
  useEffect(() => {
    if (!root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, touchMultiplier: 1 });
    const ticker = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(ticker);lenis.on('scroll', ScrollTrigger.update);
    const introController = new AbortController();
    const ctx = gsap.context(() => {
      const openingTimeline = gsap.timeline({ paused: true, defaults: { ease:'power4.out' } })
        .from('.site-nav', { y:-45, autoAlpha:0, duration:.95 })
        .from('.hero-line > span', { yPercent:115, duration:1.28, stagger:.12 }, '-=.47')
        .from('.hero-lead, .hero-primary-actions, .hero-footnote', { y:28, autoAlpha:0, stagger:.13, duration:.85 }, '-=.74')
        .from('.portrait-window', { clipPath:'inset(100% 0% 0% 0% round 24px)', duration:1.48, ease:'power3.inOut' }, '-=1.3')
        .from('.hero-floating, .hero-portrait-label', { y:35, autoAlpha:0, stagger:.12, duration:1 }, '-=.65');
      // Let the branded intro finish before animating the hero.
      // When navigating inside the Next.js app, there is no intro and the hero plays immediately.
      const startOpening = () => openingTimeline.play();
      if (document.querySelector('[data-dg-intro]') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.addEventListener('dg:intro-complete', startOpening, { once:true, signal:introController.signal });
      } else { startOpening(); }
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => gsap.from(el, { y:58, opacity:0, duration:1.03, ease:'power3.out', scrollTrigger:{ trigger:el, start:'top 90%', once:true } }));
      gsap.utils.toArray<HTMLElement>('[data-reveal-mask]').forEach(el => gsap.from(el, { clipPath:'inset(0 0 100% 0)', y:50, duration:1.25, ease:'power3.out', scrollTrigger:{ trigger:el, start:'top 87%', once:true } }));
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach(el => gsap.fromTo(el,{yPercent:-6},{yPercent:6,ease:'none',scrollTrigger:{ trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:1.1 }}));
      if (window.innerWidth > 790) gsap.to('.hero-portrait-area',{ yPercent:10,ease:'none',scrollTrigger:{trigger:'.hero-section',start:'top top',end:'bottom top',scrub:1}});
      gsap.to('.hero-ambient',{ rotate:30,ease:'none',scrollTrigger:{trigger:'.hero-section',start:'top top',end:'bottom top',scrub:1.5}});
      gsap.to('.method-progress-fill',{scaleY:1,transformOrigin:'top center',ease:'none',scrollTrigger:{ trigger:'.method-steps',start:'top 70%',end:'bottom 50%',scrub:true }});
      gsap.to('.lab-laser',{xPercent:80,ease:'none',scrollTrigger:{trigger:'.lab-section',start:'top bottom',end:'bottom top',scrub:1}});
      gsap.to('.footer-giant',{xPercent:-9,ease:'none',scrollTrigger:{trigger:'.site-footer',start:'top bottom',end:'bottom bottom',scrub:1}});
      gsap.utils.toArray<HTMLElement>('.feature-track').forEach((el,i)=>gsap.from(el,{scaleX:0,transformOrigin:'left center',duration:1.2,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 92%',once:true},delay:i*.08}));
      gsap.to('.ticker-track',{xPercent:-50,duration:23,ease:'none',repeat:-1});
    },root);
    const resize=()=>ScrollTrigger.refresh(); window.addEventListener('resize',resize);
    return()=>{introController.abort();ctx.revert();window.removeEventListener('resize',resize);gsap.ticker.remove(ticker);lenis.destroy();};
  }, []);
  useEffect(()=>{const fn=(ev:KeyboardEvent)=>{if(ev.key==='Escape')setMenu(false)};window.addEventListener('keydown',fn);return()=>window.removeEventListener('keydown',fn)},[]);
  useEffect(()=>{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const scope=root.current?.querySelector('.market-chart');if(!scope)return;const els=scope.querySelectorAll('.demo-candle');gsap.fromTo(els,{scaleY:.25,transformOrigin:'center center',opacity:.4},{scaleY:1,opacity:1,duration:.56,ease:'back.out(1.2)',stagger:.027,overwrite:true});},[concept]);
  useEffect(()=>{const el=root.current?.querySelector('.site-progress');const onScroll=()=>{const doc=document.documentElement; const amount=doc.scrollTop/Math.max(1,doc.scrollHeight-doc.clientHeight);if(el instanceof HTMLElement)el.style.transform=`scaleX(${amount})`;setReading(Math.round(amount*100));};onScroll();window.addEventListener('scroll',onScroll,{passive:true});return()=>window.removeEventListener('scroll',onScroll);},[]);
  return <div className="website-v2" ref={root}>
    <a className="skip-link" href="#contenido">Saltar al contenido principal</a>
    <div className="site-progress" aria-hidden="true"/>
    <header className="site-nav" id="top">
      <a href="#inicio" className="brand-link" onClick={()=>setMenu(false)} aria-label="Diana Gamboa, inicio"><Logo /></a>
      <nav className="nav-desktop" aria-label="Navegación principal">{nav.map(item=>item.url.startsWith('/')?<Link key={item.url} href={item.url}>{item.name}</Link>:<a key={item.url} href={item.url}>{item.name}</a>)}</nav>
      <div className="nav-control"><a className="nav-channel" href={YOUTUBE} target="_blank" rel="noreferrer">YouTube <ArrowUpRight size={16}/></a><button className={`menu-button ${menu?'is-active':''}`} aria-controls="mobile-menu" aria-expanded={menu} aria-label={menu?'Cerrar menú':'Abrir menú'} onClick={()=>setMenu(v=>!v)}>{menu?<X size={22}/>:<Menu size={22}/>}</button></div>
      <nav id="mobile-menu" className={`mobile-menu ${menu?'visible':''}`} aria-label="Menú desplegable" inert={!menu}>
        <div className="mobile-menu-head"><span>EXPLORA / 2026</span><Logo compact/></div>
        {nav.map((item,i)=>item.url.startsWith('/')?<Link href={item.url} key={item.url} onClick={()=>setMenu(false)}><small>0{i+1}</small><span>{item.name}</span><ArrowUpRight size={25}/></Link>:<a href={item.url} key={item.url} onClick={()=>setMenu(false)}><small>0{i+1}</small><span>{item.name}</span><ArrowUpRight size={25}/></a>)}
        <a href="#oficial" onClick={()=>setMenu(false)}><small>07</small><span>Canales oficiales</span><ArrowUpRight size={25}/></a>
        <div className="menu-foot">NO SEÑALES. MÁS CRITERIO.</div>
      </nav>
    </header>
    <main id="contenido">
      <section className="hero-section" id="inicio" aria-labelledby="hero-title">
        <div className="hero-background-grid" aria-hidden="true"/><div className="hero-ambient" aria-hidden="true"/>
        <div className="hero-layout content-wrap">
          <div className="hero-copy">
            <p className="hero-kicker"><span className="signal-dot"/> DIANA GAMBOA <span className="kicker-separator">/</span> ANALISTA DE MERCADOS BURSÁTILES</p>
            <h1 id="hero-title" className="hero-display"><span className="hero-line"><span>EL MERCADO</span></span><span className="hero-line"><span>NO SE</span></span><span className="hero-line acid"><span>ADIVINA<span className="accent-dot">.</span></span></span><span className="hero-line smaller"><span>SE APRENDE <i>A LEER.</i></span></span></h1>
            <p className="hero-lead">Soy <strong>Diana Gamboa</strong>, analista de mercados bursátiles y especialista en acciones y opciones. Te enseño a leer el lenguaje del precio para construir <strong>tu propio criterio como inversionista.</strong></p>
            <div className="hero-primary-actions"><ArrowLink href="/playlists">Empieza a aprender</ArrowLink><a className="simple-link" href="#enfoque">Descubre mi enfoque <ArrowDownRight size={17}/></a></div>
            <p className="hero-footnote"><Check size={17}/> No copias operaciones. No sigues señales. <strong>Aprendes a interpretar.</strong></p>
          </div>
          <div className="hero-portrait-area" aria-label="Retrato de Diana Gamboa">
            <div className="portrait-window"><div className="portrait-acid-shape"/><div className="portrait-rings"/><Image src="/diana-borgona.webp" alt="Diana Gamboa, analista bursátil, con chaqueta borgoña" fill priority sizes="(max-width: 760px) 95vw, 47vw" className="main-person" /></div>
            <div className="hero-portrait-label"><span className="hp-small">DIANA / GAMBOA</span><span>INTERPRETA<span>CIÓN</span><br/>CON CRITERIO.</span></div>
            <div className="hero-floating"><span><Sparkles size={17}/></span><small>MI OBJETIVO</small><strong>Que aprendas a pensar el mercado por ti.</strong><span className="hero-float-arrow"><ArrowUpRight size={20}/></span></div>
          </div>
          <div className="hero-mobile-objective"><span>MI OBJETIVO / DG</span><strong>Que aprendas a pensar el mercado por ti.</strong><ArrowUpRight size={20}/></div>
        </div>
        <div className="hero-base content-wrap"><span>01 — APRENDER EL IDIOMA DEL MERCADO</span><a href="#enfoque">DESLIZA PARA EXPLORAR <ArrowDown size={17}/></a><span>LECTURA / CONTEXTO / CRITERIO</span></div>
      </section>
      <div className="ticker-band" aria-hidden="true"><div className="ticker-track">{[0,1,2,3].map(i=><span key={i}>APRENDE A LEER <b>✳</b> ANALIZA CON CRITERIO <b>✳</b> PIENSA POR TI <b>✳</b> </span>)}</div></div>

      <section className="method-section" id="enfoque" aria-labelledby="method-title">
        <div className="content-wrap">
          <div className="section-row" data-reveal><SectionEyebrow index="01">EL ENFOQUE DG</SectionEyebrow><span>UNA NUEVA FORMA DE MIRAR EL MERCADO</span></div>
          <div className="method-head-grid"><div><h2 id="method-title" className="oversized-title" data-reveal-mask>NO ES<br/><span className="muted-strike">ADIVINAR.</span><br/>ES <em>ENTENDER.</em></h2></div><div className="method-intro" data-reveal><div className="intro-stamp"><Image src="/diana-negro.webp" alt="Diana Gamboa" fill sizes="125px"/><span className="stamp-star">✳</span></div><p>El mercado parece un idioma imposible cuando nadie te explica sus reglas. <strong>Mi misión es enseñarte a comprender lo que estás viendo</strong>, paso a paso, con claridad y contexto.</p><a href="#laboratorio" className="text-arrow-link">Pruébalo en el laboratorio <ArrowUpRight size={18}/></a></div></div>
          <div className="method-body-grid"><div className="method-rail" data-reveal><div className="method-progress"><span className="method-progress-fill"/></div><div className="method-steps" role="tablist" aria-label="Cuatro pasos del método">{steps.map((s,i)=><button key={s.id} className={`method-step ${step===i?'selected':''}`} type="button" role="tab" aria-selected={step===i} aria-controls="method-detail" id={'method-tab-'+i} onClick={()=>setStep(i)}><span className="step-count">{s.id}</span><span className="step-text"><strong>{s.label}</strong><small>{s.subtitle}</small></span><ArrowUpRight size={23}/></button>)}</div></div><div className="method-detail" id="method-detail" role="tabpanel" aria-labelledby={'method-tab-'+step} key={step}><div className="detail-display"><span>{steps[step].id} / 04</span><span>UN PROCESO, NO UNA SEÑAL</span></div><div className="detail-icon">{(()=>{const Icon=steps[step].icon;return <Icon size={95} strokeWidth={1.2}/>;})()}</div><div className="detail-bottom"><span className="detail-tag">{steps[step].mini}</span><h3>{steps[step].label}<span className="period">.</span></h3><p>{steps[step].description}</p><div className="step-dots">{steps.map((s,i)=><button key={s.id} aria-label={`Ver paso ${i+1}: ${s.label}`} className={step===i?'current':''} onClick={()=>setStep(i)}/>)}</div></div></div></div>
        </div>
      </section>

      <section className="difference-section" id="diferencia" aria-labelledby="difference-title"><div className="difference-ribbon" aria-hidden="true">PIENSA POR TI MISMO / PIENSA POR TI MISMO /</div><div className="content-wrap difference-grid"><div className="difference-copy" data-reveal><SectionEyebrow index="02" contrast>QUÉ ME HACE DIFERENTE</SectionEyebrow><h2 id="difference-title">NO ENSEÑO<br/>A <span>COPIAR.</span><br/><em>ENSEÑO A<br/>PENSAR.</em></h2><p>No encontrarás señales para replicar ni operaciones para seguir ciegamente. Encontrarás herramientas para cuestionar, interpretar y formar tus propias conclusiones.</p><div className="difference-principles"><div><Check size={16}/> Comprender antes de actuar</div><div><Check size={16}/> Leer contexto, no solo patrones</div><div><Check size={16}/> Aprender sin depender de terceros</div></div><ArrowLink href="#aprende">Descubre mis contenidos</ArrowLink></div><div className="difference-photo"><div className="difference-picture" data-reveal-mask><div className="photo-halo"/><Image src="/diana-gesto.webp" fill alt="Diana Gamboa explicando con la mano un gesto de aprobación" sizes="(max-width: 760px) 95vw, 44vw" data-parallax/></div><div className="difference-photo-foot"><span>ANÁLISIS ≠ ADIVINACIÓN</span><span>DG / EDUCACIÓN BURSÁTIL</span></div></div></div></section>

      <section className="lab-section" id="laboratorio" aria-labelledby="lab-title"><div className="lab-laser" aria-hidden="true"/><div className="content-wrap"><div className="section-row" data-reveal><SectionEyebrow index="03" contrast>LABORATORIO INTERACTIVO</SectionEyebrow><span>EXPLORA · CAMBIA · COMPRENDE</span></div><div className="lab-head"><div><h2 id="lab-title" data-reveal>ANTES DE<br/>OPERAR, <em>OBSERVA.</em></h2></div><p data-reveal>Una gráfica tiene mucho que contar. Selecciona un concepto y descubre qué deberías preguntarte al observar el precio.</p></div><div className="lab-main"><div className="lab-side"><span className="section-mini">SELECCIONA UN CONCEPTO / 04</span><div className="lab-tabs" role="tablist" aria-label="Conceptos de la gráfica">{concepts.map((c,i)=><button key={c.name} role="tab" aria-selected={concept===i} aria-controls="lab-detail" id={'lab-tab-'+i} className={concept===i?'active':''} onClick={()=>setConcept(i)}><small>0{i+1}</small><span>{c.name}</span><ArrowUpRight size={18}/></button>)}</div><span className="lab-hint"><span className="signal-dot"/> INTERACCIÓN EDUCATIVA</span></div><div className="lab-chart-wrap"><Chart active={concept}/><div className="lab-description" role="tabpanel" id="lab-detail" aria-labelledby={'lab-tab-'+concept} key={concept}><div><span className="lab-detail-tag">{concepts[concept].tag}</span><h3>{concepts[concept].headline}</h3><p>{concepts[concept].detail}</p></div><div className="lab-question">{concepts[concept].takeaway}<ArrowUpRight size={23}/></div></div></div></div><p className="lab-disclaimer">* Diagrama ilustrativo para aprender conceptos. No contiene precios reales, señales de inversión ni asesoría financiera.</p></div></section>

      <section className="learn-section" id="aprende" aria-labelledby="learn-title"><div className="content-wrap"><div className="section-row" data-reveal><SectionEyebrow index="04">EMPIEZA AQUÍ</SectionEyebrow><span>CONTENIDO EDUCATIVO EN YOUTUBE</span></div><div className="learn-intro"><h2 id="learn-title" data-reveal>UN CAMINO.<br/><em>TRES FORMAS</em> DE APRENDER.</h2><div data-reveal><p>De tu primera vela a una lectura más completa del mercado. Elige por dónde empezar y avanza a tu ritmo.</p><Link className="text-arrow-link" href="/playlists">Explorar las 6 playlists <ArrowUpRight size={18}/></Link></div></div><div className="shows-grid">{shows.map((s,i)=><Link href="/playlists" key={s.idx} className={`show-panel panel-${s.design}`} data-reveal><div className="show-top"><span>{s.idx} / 03</span><ArrowUpRight size={24}/></div><div className="show-art"><div className="show-big-number">{s.idx}</div>{s.design==='chart'?<ChartNoAxesCombined size={80} strokeWidth={1.05}/>:s.design==='method'?<Logo compact/>:<TrendingUp size={87} strokeWidth={1.1}/>}</div><div className="show-content"><span>{s.eyebrow}</span><h3>{s.title}</h3><p>{s.text}</p><div className="show-cta">{s.cta}<ArrowRight size={19}/></div></div></Link>)}</div><div className="learn-after" data-reveal><span><CirclePlay size={22}/> EL APRENDIZAJE ES EL PROTAGONISTA</span><Link href="/playlists" className="all-playlists-link">VER LAS 6 PLAYLISTS <ArrowUpRight size={20}/></Link></div></div></section>

      <section className="agenda-section" id="agenda" aria-labelledby="agenda-title"><div className="agenda-topography" aria-hidden="true"/><div className="content-wrap"><div className="section-row" data-reveal><SectionEyebrow index="05">NOS VEMOS EN YOUTUBE</SectionEyebrow><span>PROGRAMACIÓN PUBLICADA / HORA EST</span></div><div className="agenda-grid"><div className="agenda-left" data-reveal><span className="agenda-asterisk">✳</span><h2 id="agenda-title">NOS VEMOS<br/><em>EN VIVO.</em></h2><p>Aprende con los análisis y episodios educativos de Diana. Estos son los horarios anunciados; confirma cada transmisión en YouTube.</p><ArrowLink href={YOUTUBE} external>Ir al canal oficial</ArrowLink></div><div className="agenda-right" data-reveal><div className="agenda-row"><div className="agenda-row-head"><span>01 / TRANSMISIÓN EN VIVO</span><span><span className="agenda-live-dot"/> DIRECTO</span></div><div className="agenda-row-mid"><h3>Lunes · Miércoles · Viernes</h3><strong>3:45 <small>PM EST</small></strong></div><div className="feature-track"/></div><div className="agenda-row"><div className="agenda-row-head"><span>02 / NUEVO EPISODIO</span><span>MIÉRCOLES</span></div><div className="agenda-row-mid"><h3>El Método DG</h3><strong>4:00 <small>PM EST</small></strong></div><div className="feature-track"/></div><div className="agenda-row"><div className="agenda-row-head"><span>03 / NUEVO EPISODIO</span><span>SÁBADO</span></div><div className="agenda-row-mid"><h3>De la Gráfica a la Acción</h3><strong>4:00 <small>PM EST</small></strong></div><div className="feature-track"/></div><div className="agenda-time-note"><Clock3 size={17}/> Horarios expresados como EST, tal como fueron comunicados. Los horarios y las emisiones pueden cambiar.</div></div></div></div></section>

      <section className="faq-section" id="preguntas"><div className="content-wrap faq-grid"><div data-reveal><SectionEyebrow index="06">PREGUNTAS FRECUENTES</SectionEyebrow><h2>ANTES DE<br/><em>EMPEZAR.</em></h2></div><div className="faq-list" data-reveal>{[
        ['¿Necesito experiencia previa?', 'No. Puedes empezar por “Aprende a Leer un Chart desde Cero”, la playlist recomendada para familiarizarte con el lenguaje de las gráficas.'],
        ['¿Diana comparte señales o inversiones para copiar?', 'No. Su enfoque es educativo: aprender a interpretar velas, tendencias, niveles y contexto para formar un criterio propio.'],
        ['¿Dónde veo los horarios y contenidos?', 'En el canal oficial de YouTube: transmisiones anunciadas lunes, miércoles y viernes; El Método DG los miércoles y De la Gráfica a la Acción los sábados.'],
      ].map(([q,a],i)=><div className={`faq-item ${faq===i?'faq-open':''}`} key={q}><button aria-expanded={faq===i} aria-controls={'faq-answer-'+i} onClick={()=>setFaq(faq===i?null:i)}><span>0{i+1}</span><strong>{q}</strong><ChevronDown size={21}/></button><div id={'faq-answer-'+i} className="faq-answer" hidden={faq!==i}><p>{a}</p></div></div>)}</div></div></section>

      <section className="official-section" id="oficial"><div className="content-wrap"><div className="section-row" data-reveal><SectionEyebrow index="07" contrast>ENCUÉNTRAME EN EL LUGAR CORRECTO</SectionEyebrow><span>VERIFICA SIEMPRE MIS CUENTAS</span></div><div className="official-grid"><div data-reveal><h2>APRENDE EN EL<br/><em>LUGAR CORRECTO.</em></h2><p>Conecta conmigo únicamente a través de mis cuentas oficiales. Nunca envíes dinero a perfiles que afirmen representarme.</p><div className="social-links"><a href={YOUTUBE} target="_blank" rel="noopener noreferrer"><Youtube size={23}/> YouTube <ArrowUpRight size={17}/></a><a href={INSTAGRAM} target="_blank" rel="noopener noreferrer"><Instagram size={23}/> @dianagamboamomentum <ArrowUpRight size={17}/></a></div></div><aside className="security-notice" data-reveal><div className="security-head"><ShieldAlert size={33}/><span>ATENCIÓN / PREVENCIÓN DE ESTAFAS</span></div><h3>No tengo Telegram ni WhatsApp de inversiones.</h3><p>Mis únicas cuentas oficiales son mi canal de YouTube y mi Instagram <strong>@dianagamboamomentum</strong>. Si alguien te contacta en mi nombre para ofrecer inversiones, es una estafa.</p><span className="security-end">PROTEGE TU INFORMACIÓN <ArrowUpRight size={20}/></span></aside></div></div></section>
    </main>
    <footer className="site-footer"><div className="content-wrap"><div className="footer-head"><Logo/><a href="#inicio">VOLVER ARRIBA ↑</a></div><div className="footer-title-wrap"><div className="footer-giant" aria-hidden="true">APRENDE A <em>LEERLO.</em></div></div><div className="footer-base"><div className="footer-copyright-group"><span>© {new Date().getFullYear()} DIANA GAMBOA / EDUCACIÓN BURSÁTIL</span><a href="https://www.kytcode.lat" target="_blank" rel="noopener noreferrer" className="kyt-brand-link">Desarrollado por K&T <Heart size={13} fill="#ffffff" stroke="#ffffff" className="kyt-heart-icon" aria-hidden="true" /></a></div><p>Contenido educativo. No constituye asesoramiento financiero personalizado.</p><div><span className="reader-progress">{reading}% RECORRIDO</span><a href={YOUTUBE} aria-label="YouTube de Diana Gamboa" target="_blank" rel="noopener noreferrer"><Youtube size={18}/></a><a href={INSTAGRAM} aria-label="Instagram de Diana Gamboa" target="_blank" rel="noopener noreferrer"><Instagram size={18}/></a></div></div></div></footer>
  </div>;
}
