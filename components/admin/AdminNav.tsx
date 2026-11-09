'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { BookOpen, ExternalLink, FilePenLine, LayoutDashboard, LogOut, Mail, Menu, MonitorPlay, Trophy, Users, X } from 'lucide-react';
import { supabaseNavegador } from '@/lib/supabase/cliente';

const ENLACES = [
  { href: '/admin', texto: 'Resumen', icono: LayoutDashboard },
  { href: '/admin/contenido', texto: 'Contenido de la web', icono: FilePenLine },
  { href: '/admin/academia', texto: 'Clases y recursos', icono: MonitorPlay },
  { href: '/admin/alumnos', texto: 'Alumnos', icono: Users },
  { href: '/admin/reto', texto: 'Resultados del Reto', icono: Trophy },
  { href: '/admin/correos', texto: 'Correos', icono: Mail },
  { href: '/admin/manual', texto: 'Manual de uso', icono: BookOpen },
];

export default function AdminNav({ logo, nombre }: { logo: string; nombre: string }) {
  const path = usePathname();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const activo = (href: string) => href === '/admin' ? path === '/admin' : path.startsWith(href);
  async function salir() {
    await supabaseNavegador()?.auth.signOut();
    router.push('/');
    router.refresh();
  }
  return <aside className={`admin-nav ${abierto ? 'is-open' : ''}`}>
    <div className="admin-nav-top">
      <Link href="/admin" className="admin-logo"><Image src={logo} alt="Diana Gamboa" width={600} height={345} /><span>Administración</span></Link>
      <button type="button" className="admin-menu" onClick={() => setAbierto(v => !v)} aria-expanded={abierto} aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}>{abierto ? <X size={22} /> : <Menu size={22} />}<span>{abierto ? 'Cerrar' : 'Menú'}</span></button>
    </div>
    <nav aria-label="Administración" onClick={() => setAbierto(false)}>
      {ENLACES.map(({ href, texto, icono: I }) => <Link key={href} href={href} aria-current={activo(href) ? 'page' : undefined}><I size={20} aria-hidden="true" /> {texto}</Link>)}
      <hr />
      <a href="/" target="_blank" rel="noopener noreferrer"><ExternalLink size={20} aria-hidden="true" /> Ver la web</a>
      <Link href="/portal"><ExternalLink size={20} aria-hidden="true" /> Ver el Portal del Alumno</Link>
      <button type="button" onClick={salir}><LogOut size={20} aria-hidden="true" /> Cerrar sesión</button>
    </nav>
    {nombre && <p className="admin-usuario">Sesión: <strong>{nombre}</strong></p>}
  </aside>;
}
