'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CalendarDays, FolderDown, Home, LayoutDashboard, LogOut } from 'lucide-react';
import Brand from './Brand';
import { borrarAlumno } from '@/lib/alumno';
import { supabaseNavegador } from '@/lib/supabase/cliente';

export default function PortalHeader({ logo, nombre, admin }: { logo: string; nombre: string; admin?: boolean }) {
  const path = usePathname();
  const router = useRouter();
  async function salir(ev: React.MouseEvent) {
    ev.preventDefault();
    borrarAlumno();
    await supabaseNavegador()?.auth.signOut();
    router.push('/');
    router.refresh();
  }
  return <header className="portal-header">
    <div className="wrap header-inner">
      <Brand href="/portal" logo={logo} nombre={nombre} />
      <nav className="portal-nav" aria-label="Navegación del portal">
        <Link href="/portal" className="portal-nav-home" aria-current={path === '/portal' ? 'page' : undefined}><Home size={20} aria-hidden="true" /> <span>Inicio<span className="solo-ancho"> del portal</span></span></Link>
        <Link href="/portal/eventos" aria-current={path.startsWith('/portal/eventos') ? 'page' : undefined}><CalendarDays size={20} aria-hidden="true" /> <span>Eventos</span></Link>
        <Link href="/portal/biblioteca" aria-current={path === '/portal/biblioteca' ? 'page' : undefined}><FolderDown size={20} aria-hidden="true" /> <span>Recursos</span></Link>
        {admin && <Link href="/admin"><LayoutDashboard size={20} aria-hidden="true" /> <span>Admin<span className="solo-ancho">istración</span></span></Link>}
        <a href="/" className="portal-nav-out" onClick={salir}><LogOut size={20} aria-hidden="true" /> <span>Salir</span></a>
      </nav>
    </div>
  </header>;
}
