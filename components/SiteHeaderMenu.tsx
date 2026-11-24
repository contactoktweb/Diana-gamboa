'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, ChevronRight, Home, LayoutDashboard, LogIn, UserRound } from 'lucide-react';
import { supabaseNavegador } from '@/lib/supabase/cliente';

const ENLACES = [
  { href: '/', titulo: 'Inicio', detalle: 'La puerta de la academia', Icono: Home },
  { href: '/sobre-diana', titulo: 'Sobre Diana', detalle: 'Su historia y su forma de enseñar', Icono: UserRound },
  { href: '/eventos', titulo: 'Eventos', detalle: 'Talleres en vivo con cupos limitados', Icono: CalendarDays },
];

export default function SiteHeaderMenu({ boton }: { boton: string }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
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
  // Con el menú abierto, la página de fondo no se desplaza.
  useEffect(() => {
    document.documentElement.classList.toggle('menu-abierto', open);
    return () => document.documentElement.classList.remove('menu-abierto');
  }, [open]);
  useEffect(() => setOpen(false), [path]);

  const close = () => setOpen(false);
  const actual = (href: string) => (href === '/' ? path === '/' : path.startsWith(href)) ? 'page' as const : undefined;
  const destino = sesion === 'admin' ? { href: '/admin', texto: 'Administración' } : { href: '/portal', texto: 'Mi portal' };
  const acceso = sesion ? <Link href={destino.href}>{destino.texto}</Link> : <Link href="/ingresar">Iniciar sesión</Link>;

  return <>
    <nav className="header-nav" aria-label="Navegación principal">
      {ENLACES.map(e => <Link key={e.href} href={e.href} aria-current={actual(e.href)}>{e.titulo}</Link>)}
      {acceso}
      {!sesion && <Link href="/registro" className="btn btn-gold btn-sm">{boton} <ArrowRight aria-hidden="true" /></Link>}
    </nav>

    <button className={`menu-toggle ${open ? 'is-open' : ''}`} type="button" aria-expanded={open} aria-controls="menu-movil" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setOpen(v => !v)}>
      <span className="menu-icono" aria-hidden="true"><i /><i /><i /></span>
      <span className="menu-texto">{open ? 'Cerrar' : 'Menú'}</span>
    </button>

    {open && <div className="menu-fondo" onClick={close} aria-hidden="true" />}
    <nav id="menu-movil" className={`mobile-nav ${open ? 'is-open' : ''}`} aria-label="Menú" hidden={!open}>
      <p className="mobile-nav-titulo">El idioma del mercado</p>
      <ul className="mobile-nav-lista">
        {ENLACES.map(({ href, titulo, detalle, Icono }, i) => <li key={href} style={{ '--i': i } as React.CSSProperties}>
          <Link href={href} onClick={close} aria-current={actual(href)}>
            <span className="mobile-nav-icono"><Icono size={20} aria-hidden="true" /></span>
            <span className="mobile-nav-texto"><strong>{titulo}</strong><small>{detalle}</small></span>
            <ChevronRight className="mobile-nav-flecha" size={20} aria-hidden="true" />
          </Link>
        </li>)}
      </ul>
      <div className="mobile-nav-pie" style={{ '--i': ENLACES.length } as React.CSSProperties}>
        {sesion
          ? <Link href={destino.href} className="mobile-nav-cta" onClick={close}>
              {sesion === 'admin' ? <LayoutDashboard size={20} aria-hidden="true" /> : <Home size={20} aria-hidden="true" />} {destino.texto} <ArrowRight size={18} aria-hidden="true" />
            </Link>
          : <>
              <Link href="/registro" className="mobile-nav-cta" onClick={close}>{boton} <ArrowRight size={18} aria-hidden="true" /></Link>
              <Link href="/ingresar" className="mobile-nav-sec" onClick={close}><LogIn size={18} aria-hidden="true" /> Ya tengo cuenta: iniciar sesión</Link>
            </>}
      </div>
    </nav>
  </>;
}
