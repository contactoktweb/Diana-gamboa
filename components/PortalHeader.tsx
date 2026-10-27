'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderDown, Home, LogOut } from 'lucide-react';
import Brand from './Brand';

export default function PortalHeader() {
  const path = usePathname();
  return <header className="portal-header">
    <div className="wrap header-inner">
      <Brand href="/portal" tagline />
      <nav className="portal-nav" aria-label="Navegación del portal">
        <Link href="/portal" className="portal-nav-home" aria-current={path === '/portal' ? 'page' : undefined}><Home size={20} aria-hidden="true" /> <span>Inicio del portal</span></Link>
        <Link href="/portal/biblioteca" aria-current={path === '/portal/biblioteca' ? 'page' : undefined}><FolderDown size={20} aria-hidden="true" /> <span>Recursos</span></Link>
        <Link href="/" className="portal-nav-out"><LogOut size={20} aria-hidden="true" /> <span>Salir</span></Link>
      </nav>
    </div>
  </header>;
}
