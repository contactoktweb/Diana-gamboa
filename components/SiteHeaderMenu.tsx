'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { supabaseNavegador } from '@/lib/supabase/cliente';

export default function SiteHeaderMenu({ boton }: { boton: string }) {
  const [open, setOpen] = useState(false);
  // Las páginas públicas son estáticas: la sesión se consulta en el navegador.
  const [sesion, setSesion] = useState<'alumno' | 'admin' | null>(null);
  useEffect(() => {
    const sb = supabaseNavegador();
    if (!sb) return;
    sb.auth.getSession().then(async ({ data }) => {
      const id = data.session?.user.id;
      if (!id) return;
      const { data: perfil } = await sb.from('perfiles').select('rol').eq('id', id).maybeSingle();
      setSesion(perfil?.rol === 'admin' ? 'admin' : 'alumno');
    });
  }, []);
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => { if (ev.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const close = () => setOpen(false);
  const acceso = sesion ? <Link href={sesion === 'admin' ? '/admin' : '/portal'} onClick={close}>{sesion === 'admin' ? 'Administración' : 'Mi portal'}</Link>
    : <Link href="/ingresar" onClick={close}>Iniciar sesión</Link>;
  return <>
    <nav className="header-nav" aria-label="Navegación principal">
      <Link href="/">Inicio</Link>
      <Link href="/sobre-diana">Sobre Diana</Link>
      {acceso}
      {!sesion && <Link href="/registro" className="btn btn-gold btn-sm">{boton} <ArrowRight aria-hidden="true" /></Link>}
    </nav>
    <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="menu-movil" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setOpen(v => !v)}>
      {open ? <X size={24} /> : <Menu size={24} />}<span>{open ? 'Cerrar' : 'Menú'}</span>
    </button>
    <nav id="menu-movil" className={`mobile-nav ${open ? 'is-open' : ''}`} aria-label="Menú" hidden={!open}>
      <Link href="/" onClick={close}>Inicio</Link>
      <Link href="/sobre-diana" onClick={close}>Sobre Diana</Link>
      {acceso}
      {!sesion && <Link href="/registro" className="btn btn-gold btn-block" onClick={close}>{boton} <ArrowRight aria-hidden="true" /></Link>}
    </nav>
  </>;
}
