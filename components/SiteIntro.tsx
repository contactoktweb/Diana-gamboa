'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Branded introductory sequence adapted from the loader in the supplied V5 reference.
 * A single instance lives in app/layout.tsx, so Next.js client-side navigation does not replay it.
 * Progress is an intentional introductory animation (NOT a fabricated network download percentage).
 */
export default function SiteIntro() {
  const [phase, setPhase] = useState<'counting' | 'leaving' | 'finished'>('counting');
  const numberRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const phaseRef = useRef<'counting' | 'leaving' | 'finished'>('counting');
  const skipRef = useRef<() => void>(() => {});

  const finish = useCallback(() => {
    if (phaseRef.current !== 'counting') return;
    phaseRef.current = 'leaving';
    if (numberRef.current) numberRef.current.textContent = '100';
    if (fillRef.current) fillRef.current.style.transform = 'scaleX(1)';
    setPhase('leaving');
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      phaseRef.current = 'finished';
      setPhase('finished');
      window.dispatchEvent(new Event('dg:intro-complete'));
      return;
    }
    // The content is usable even if CSS animation is unavailable or the tab is backgrounded.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    let raf = 0;
    let revealTimer = 0;
    let removeTimer = 0;
    let started = 0;
    let completed = false;
    const duration = 1950;
    function release() {
      if (completed) return;
      completed = true;
      document.body.style.overflow = previousOverflow;
      window.dispatchEvent(new Event('dg:intro-complete'));
    }
    function beginExit() {
      if (phaseRef.current !== 'counting') return;
      finish();
      cancelAnimationFrame(raf);
      // Fire when the turqoise screen wipe has started uncovering the hero.
      revealTimer = window.setTimeout(release, 570);
      removeTimer = window.setTimeout(() => {
        release();
        phaseRef.current = 'finished';
        setPhase('finished');
      }, 1420);
    }
    skipRef.current = beginExit;
    const frame = (time: number) => {
      if (!started) started = time;
      if (phaseRef.current !== 'counting') return;
      const value = Math.min(1, (time - started) / duration);
      if (numberRef.current) numberRef.current.textContent = String(Math.round(value * 100)).padStart(2, '0');
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${value})`;
      if (value < 1) raf = requestAnimationFrame(frame);
      else beginExit();
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(revealTimer);
      window.clearTimeout(removeTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [finish]);

  if (phase === 'finished') return null;
  return <>
    <div className={`dg-entry-screen${phase === 'leaving' ? ' dg-entry-screen--out' : ''}`} data-dg-intro="" aria-label="Presentación de Diana Gamboa">
      <div className="dg-entry-top"><span>DIANA GAMBOA</span><span>MARKET EDUCATION / MOMENTUM</span></div>
      <div className="dg-entry-main">
        <svg viewBox="0 0 120 145" fill="none" role="img" aria-label="Monograma DG con velas bursátiles" className="dg-entry-mark">
          <path d="M60 16v88c0 25-19 27-31 16M28 72c0-30 42-30 42-2s-39 30-42 4M78 18v31M91 8v28M103 23v17" />
        </svg>
        <div className="dg-entry-name" aria-hidden="true">DIANA<br/>GAMBOA<span>.</span></div>
      </div>
      <div className="dg-entry-progressbar-wrap">
        <button className="dg-entry-skip" type="button" onClick={() => skipRef.current()}>SALTAR INTRO <span aria-hidden="true">↗</span></button>
        <p className="dg-entry-count"><span ref={numberRef}>00</span><small> / 100</small></p>
      </div>
      <div className="dg-entry-progressbar" aria-hidden="true"><span ref={fillRef}/></div>
      <div className="dg-entry-bottom"><span>EL MERCADO TIENE UN IDIOMA</span><span>Y VAS A APRENDER A LEERLO ↗</span></div>
    </div>
    <div className={`dg-entry-wipe${phase === 'leaving' ? ' dg-entry-wipe--play' : ''}`} aria-hidden="true" />
  </>;
}
