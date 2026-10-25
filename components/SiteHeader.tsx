'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import Brand from './Brand';

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => { if (ev.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const close = () => setOpen(false);
  return <header className="site-header">
    <div className="wrap header-inner">
      <Brand />
      <nav className="header-nav" aria-label="Navegación principal">
        <Link href="/">Inicio</Link>
        <a href="/#sobre-diana">Sobre Diana</a>
        <Link href="/ingresar">Iniciar sesión</Link>
        <Link href="/registro" className="btn btn-gold btn-sm">Quiero ser alumno gratis</Link>
      </nav>
      <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="menu-movil" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setOpen(v => !v)}>
        {open ? <X size={24} /> : <Menu size={24} />}<span>{open ? 'Cerrar' : 'Menú'}</span>
      </button>
    </div>
    <nav id="menu-movil" className={`mobile-nav ${open ? 'is-open' : ''}`} aria-label="Menú" hidden={!open}>
      <Link href="/" onClick={close}>Inicio</Link>
      <a href="/#sobre-diana" onClick={close}>Sobre Diana</a>
      <Link href="/ingresar" onClick={close}>Iniciar sesión</Link>
      <Link href="/registro" className="btn btn-gold btn-block" onClick={close}>Quiero ser alumno gratis</Link>
    </nav>
  </header>;
}
