'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowDown, ArrowLeft, ArrowUpRight, Check, Heart, Instagram, ListVideo, Menu, Play, ShieldCheck, X, Youtube } from 'lucide-react';
import { dgPlaylists, type PlaylistFilter } from '@/data/playlists';

const groups: {key: PlaylistFilter; label: string; short: string}[] = [
  {key:'todas',label:'Todas las playlists',short:'Todas'},
  {key:'empieza',label:'Primeros pasos',short:'Empieza'},
  {key:'analisis',label:'Análisis',short:'Análisis'},
  {key:'profundiza',label:'Profundiza',short:'Avanza'},
];
const YOUTUBE = 'https://www.youtube.com/@DianaGamboaMomentum';
const INSTAGRAM = 'https://www.instagram.com/dianagamboamomentum/';

export default function PlaylistsSite() {
  const root = useRef<HTMLDivElement>(null);
  const [filter,setFilter] = useState<PlaylistFilter>('todas');
  const [menu,setMenu] = useState(false);
  const visible = dgPlaylists.filter(p => filter === 'todas' || p.category === filter);

  useEffect(() => {
    const onKey=(ev:KeyboardEvent)=>{if(ev.key==='Escape')setMenu(false)};
    window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);
  },[]);

  useEffect(() => {
    if(!root.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.registerPlugin(ScrollTrigger);
    if(reduced) return;
    const lenis = new Lenis({duration:1.05,smoothWheel:true});
    const tick=(t:number)=>lenis.raf(t*1000);
    gsap.ticker.add(tick); lenis.on('scroll',ScrollTrigger.update);
    const introController = new AbortController();
    const ctx=gsap.context(()=>{
      const tl=gsap.timeline({paused:true,defaults:{ease:'power4.out'}});
      tl.from('.playlist-navigation',{y:-55,opacity:0,duration:.85})
        .from('.playlist-hero-kicker',{y:28,opacity:0,duration:.7},'-=.25')
        .from('.playlist-hero-line > span',{yPercent:115,stagger:.14,duration:1.35},'-=.45')
        .from('.playlist-hero-description',{y:32,opacity:0,duration:.8},'-=.75')
        .from('.playlist-hero-visual',{clipPath:'inset(95% 0 0 0 round 38px)',duration:1.4,ease:'power3.inOut'},'-=1.2')
        .from('.playlist-hero-chip',{x:55,opacity:0,duration:.8},'-=.6');
      // Let the branded intro finish before animating the hero.
      // When navigating inside the Next.js app, there is no intro and the hero plays immediately.
      const startOpening = () => tl.play();
      if (document.querySelector('[data-dg-intro]') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.addEventListener('dg:intro-complete', startOpening, { once:true, signal:introController.signal });
      } else { startOpening(); }
      gsap.to('.playlist-orbit',{rotate:75,ease:'none',scrollTrigger:{trigger:'.playlists-hero',start:'top top',end:'bottom top',scrub:1.2}});
      gsap.to('.playlist-cover-portrait',{yPercent:8,ease:'none',scrollTrigger:{trigger:'.playlists-hero',start:'top top',end:'bottom top',scrub:1}});
      gsap.utils.toArray<HTMLElement>('.playlist-reveal').forEach(el=>{
        gsap.from(el,{y:62,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}});
      });
      gsap.utils.toArray<HTMLElement>('.playlist-track-line').forEach(el=>{
        gsap.fromTo(el,{scaleX:0},{scaleX:1,transformOrigin:'left',ease:'none',scrollTrigger:{trigger:el,start:'top 90%',end:'top 55%',scrub:true}});
      });
    },root);
    const update=()=>ScrollTrigger.refresh();window.addEventListener('resize',update);
    return()=>{introController.abort();ctx.revert(); window.removeEventListener('resize',update);lenis.destroy();gsap.ticker.remove(tick);};
  },[]);

  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const scope=root.current?.querySelector('.playlist-library-grid');
    if(!scope)return;
    const els=scope.querySelectorAll('.playlist-card');
    gsap.fromTo(els,{opacity:0,y:32,scale:.96},{opacity:1,y:0,scale:1,stagger:.075,duration:.66,ease:'power3.out',overwrite:true,onComplete:()=>ScrollTrigger.refresh()});
  },[filter]);

  return <div className="playlists-page" ref={root}>
    <a className="skip-link" href="#biblioteca">Saltar a las playlists</a>
    <header className="playlist-navigation">
      <Link className="playlist-logo" href="/" aria-label="Diana Gamboa, ir al inicio"><Image src="/dg-wordmark.png" alt="Diana Gamboa" width={198} height={105} priority/></Link>
      <nav aria-label="Navegación de playlists" className="playlist-nav-links"><Link href="/">Inicio</Link><a href="#biblioteca">Biblioteca</a><a href="#ruta">Cómo empezar</a></nav>
      <div className="playlist-nav-tools"><a href={YOUTUBE} target="_blank" rel="noopener noreferrer" className="playlist-nav-channel">Canal de YouTube <ArrowUpRight size={16}/></a><button type="button" className="playlist-menu-button" onClick={()=>setMenu(m=>!m)} aria-expanded={menu} aria-controls="playlist-menu" aria-label={menu?'Cerrar menú':'Abrir menú'}>{menu?<X size={21}/>:<Menu size={21}/>}</button></div>
      <nav id="playlist-menu" className={'playlist-menu '+(menu?'show':'')} inert={!menu} aria-label="Menú móvil de playlists">
        <span>EXPLORA / DIANA GAMBOA</span>
        <Link href="/" onClick={()=>setMenu(false)}>Inicio <ArrowUpRight/></Link>
        <a href="#biblioteca" onClick={()=>setMenu(false)}>Las playlists <ArrowUpRight/></a>
        <a href="#ruta" onClick={()=>setMenu(false)}>Por dónde empezar <ArrowUpRight/></a>
        <a href={YOUTUBE} target="_blank" rel="noopener noreferrer">YouTube oficial <ArrowUpRight/></a>
      </nav>
    </header>

    <main>
      <section className="playlists-hero" aria-labelledby="playlists-heading">
        <div className="playlist-hero-lines" aria-hidden="true"/>
        <div className="playlist-orbit" aria-hidden="true"/>
        <div className="content-wrap playlist-hero-grid">
          <div className="playlist-hero-copy">
            <p className="playlist-hero-kicker"><span className="playlist-signal"/> DIANA GAMBOA / TU BIBLIOTECA DE APRENDIZAJE</p>
            <h1 id="playlists-heading" className="playlist-hero-title">
              <span className="playlist-hero-line"><span>APRENDE</span></span>
              <span className="playlist-hero-line"><span>A <em>LEER</em></span></span>
              <span className="playlist-hero-line"><span>EL MERCADO<span className="playlist-end-dot">.</span></span></span>
            </h1>
            <p className="playlist-hero-description">Seis playlists. Distintos puntos de entrada. <strong>Un mismo objetivo: que comprendas el lenguaje del mercado y construyas tu propio criterio.</strong> Elige una serie y aprende a tu ritmo.</p>
            <div className="playlist-hero-buttons"><a className="playlist-pill-button" href="#biblioteca">Explorar las 6 playlists <span><ArrowDown size={22}/></span></a><Link href="/" className="playlist-hero-back"><ArrowLeft size={17}/> Volver al inicio</Link></div>
            <div className="playlist-hero-count"><strong>06</strong><span>PLAYLISTS PARA EXPLORAR<br/>Y SEGUIR APRENDIENDO</span></div>
          </div>
          <div className="playlist-hero-visual">
            <div className="playlist-cover-ring" aria-hidden="true"/>
            <div className="playlist-cover-disc" aria-hidden="true"/>
            <div className="playlist-hero-behind" aria-hidden="true"><span>EDUCACIÓN<br/>BURSÁTIL</span><ArrowUpRight size={33}/></div>
            <div className="playlist-portrait-frame"><Image src="/diana-negro.webp" fill priority sizes="(max-width: 800px) 95vw, 47vw" alt="Diana Gamboa presentando su contenido educativo" className="playlist-cover-portrait"/></div>
            <div className="playlist-hero-chip"><ListVideo size={17}/> 06 LISTAS / CANAL OFICIAL</div>
          </div>
        </div>
        <div className="content-wrap playlist-hero-bottom"><span>UN LENGUAJE QUE SE APRENDE</span><a href="#biblioteca">SCROLL PARA EXPLORAR <ArrowDown size={18}/></a><span>NO SEÑALES. MÁS CRITERIO.</span></div>
      </section>

      <div className="playlist-marquee" aria-hidden="true"><div className="playlist-marquee-track">{[0,1,2,3].map(x=><span key={x}>OBSERVA <b>✳</b> INTERPRETA <b>✳</b> COMPRENDE <b>✳</b> DECIDE CON CRITERIO <b>✳</b> </span>)}</div></div>

      <section className="playlist-library" id="biblioteca" aria-labelledby="library-heading">
        <div className="content-wrap">
          <div className="playlist-section-tag playlist-reveal"><span>01 / BIBLIOTECA</span><i/>CONTENIDO DEL CANAL OFICIAL</div>
          <div className="playlist-library-intro playlist-reveal"><div><h2 id="library-heading">ELIGE TU<br/><em>PRÓXIMA LECCIÓN.</em></h2></div><div><p>Desde lo esencial hasta una lectura más elaborada. Explora estas seis playlists en el orden en que fueron compartidas y abre cada una en YouTube.</p><span>06 / LISTAS DISPONIBLES</span></div></div>
          <div className="playlist-filters" role="group" aria-label="Filtrar las playlists por contenido">{groups.map(g=><button key={g.key} type="button" className={filter===g.key?'selected':''} onClick={()=>setFilter(g.key)} aria-pressed={filter===g.key}><span className="filter-desktop">{g.label}</span><span className="filter-mobile">{g.short}</span>{filter===g.key&&<span className="filter-active-dot"/>}</button>)}</div>
          <div className="playlist-result-count" aria-live="polite">{visible.length.toString().padStart(2,'0')} PLAYLISTS · {filter==='todas'?'TODAS LAS SERIES':groups.find(g=>g.key===filter)?.label.toUpperCase()}</div>
          <div className="playlist-library-grid" key={filter}>
            {visible.map((p)=>
              <article className={`playlist-card playlist-theme-${p.theme}`} key={p.id} id={'playlist-'+p.number} onPointerMove={(ev)=>{ if(ev.pointerType!=='mouse')return; const rect=ev.currentTarget.querySelector('.playlist-card-cover')?.getBoundingClientRect(); if(!rect)return; const cover=ev.currentTarget.querySelector('.playlist-card-cover') as HTMLElement | null; cover?.style.setProperty('--mx',`${((ev.clientX-rect.left)/rect.width)*100}%`); cover?.style.setProperty('--my',`${((ev.clientY-rect.top)/rect.height)*100}%`); }}>
                <a className="playlist-card-link" href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir en YouTube: ${p.title}`}>
                  <div className="playlist-card-cover"><div className="playlist-card-cover-inside"><Image src={p.image} alt={`Miniatura original de la playlist ${p.title}`} fill sizes="(max-width:600px) 94vw, (max-width:1050px) 49vw, 32vw"/></div><span className="playlist-card-image-id">DG / {p.number}</span><span className="playlist-play-button"><Play size={23} fill="currentColor"/></span></div>
                  <div className="playlist-card-info"><div className="playlist-card-meta"><span>{p.number} / 06</span><span>{p.categoryLabel.toUpperCase()}</span></div><p className="playlist-card-eyebrow">{p.eyebrow}</p><h3>{p.title}</h3><p className="playlist-card-desc">{p.description}</p><div className="playlist-card-bottom"><span>{p.recommended?'RECOMENDADA PARA EMPEZAR':'VER PLAYLIST EN YOUTUBE'}</span><span className="playlist-card-arrow"><ArrowUpRight size={21}/></span></div></div>
                </a>
              </article>
            )}
          </div>
          <p className="playlist-library-note"><ShieldCheck size={18}/> Los enlaces abren las playlists proporcionadas del canal oficial de Diana Gamboa. La información es educativa, no son señales ni recomendaciones de inversión.</p>
        </div>
      </section>

      <section className="playlist-route" id="ruta" aria-labelledby="route-heading"><div className="content-wrap playlist-route-layout"><div className="playlist-route-copy playlist-reveal"><div className="playlist-section-tag"><span>02 / POR DÓNDE EMPEZAR</span><i/>SIN PRISAS, A TU RITMO</div><h2 id="route-heading">NO NECESITAS<br/>ADIVINAR.<br/><em>NECESITAS ENTENDER.</em></h2><p>¿Es tu primera vez frente a una gráfica? Empieza por la playlist de lectura desde cero. Después explora el idioma del mercado, el proceso del análisis y las demás series.</p><a href={dgPlaylists[5].url} target="_blank" rel="noopener noreferrer" className="playlist-pill-button playlist-pill-dark">Empezar desde cero <span><ArrowUpRight size={20}/></span></a></div><div className="playlist-route-graphic playlist-reveal"><div className="playlist-route-orbit"/><Image src="/diana-gesto.webp" fill sizes="(max-width:780px) 96vw, 42vw" alt="Diana Gamboa"/><div className="playlist-route-stamp"><Check size={20}/><span>TÚ CONSTRUYES<br/>TU CRITERIO</span></div></div></div></section>

      <section className="playlist-official"><div className="content-wrap playlist-official-inner playlist-reveal"><div><span>03 / CANALES OFICIALES</span><h2>APRENDE EN EL<br/><em>LUGAR CORRECTO.</em></h2><p>Diana no tiene Telegram ni WhatsApp de inversiones. Verifica siempre que estás en su canal oficial y no sigas mensajes de suplantadores.</p></div><div className="playlist-official-actions"><a href={YOUTUBE} target="_blank" rel="noopener noreferrer"><Youtube/> YouTube oficial <ArrowUpRight/></a><a href={INSTAGRAM} target="_blank" rel="noopener noreferrer"><Instagram/> @dianagamboamomentum <ArrowUpRight/></a></div></div></section>
    </main>
    <footer className="playlist-footer"><div className="content-wrap"><div className="playlist-footer-top"><Link href="/" aria-label="Volver a Diana Gamboa inicio"><Image src="/dg-wordmark.png" alt="Diana Gamboa" width={183} height={100}/></Link><Link href="/">VOLVER AL INICIO <ArrowUpRight size={16}/></Link></div><p className="playlist-footer-big" aria-hidden="true">MIRA. <em>COMPRENDE.</em></p><div className="playlist-footer-low"><div className="footer-copyright-group"><span>© {new Date().getFullYear()} DIANA GAMBOA / EDUCACIÓN BURSÁTIL</span><a href="https://www.kytcode.lat" target="_blank" rel="noopener noreferrer" className="kyt-brand-link">Desarrollado por K&T <Heart size={13} fill="#ffffff" stroke="#ffffff" className="kyt-heart-icon" aria-hidden="true" /></a></div><span>Contenido educativo, no asesoría financiera personalizada.</span><span>INTERPRETA CON CRITERIO ↗</span></div></div></footer>
  </div>;
}
