'use client';

import { useEffect } from 'react';

/** Añade una sombra suave al encabezado cuando la página se desplaza. */
export default function HeaderShadow() {
  useEffect(() => {
    const onScroll = () => document.documentElement.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return null;
}
