'use client';

import { useEffect } from 'react';

/**
 * Hace aparecer suavemente los elementos con [data-reveal] al entrar en pantalla.
 * También vigila el contenido que llega después (por ejemplo, tras la pantalla «Cargando…»),
 * para que ningún bloque se quede invisible.
 */
export default function RevealOnScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    root.classList.add('js-reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    const vigilados = new WeakSet<Element>();
    const buscar = () => document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)').forEach(el => {
      if (vigilados.has(el)) return;
      vigilados.add(el);
      io.observe(el);
    });
    buscar();
    const mo = new MutationObserver(buscar);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
  return null;
}
