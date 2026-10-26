import Link from 'next/link';
import { Home, LogOut } from 'lucide-react';
import Brand from './Brand';

export default function PortalHeader() {
  return <header className="portal-header">
    <div className="wrap header-inner">
      <Brand href="/portal" tagline />
      <nav className="portal-nav" aria-label="Navegación del portal">
        <Link href="/portal" className="portal-nav-home"><Home size={20} aria-hidden="true" /> <span>Inicio del portal</span></Link>
        <Link href="/portal/biblioteca" className="portal-nav-hide">Recursos</Link>
        <Link href="/" className="portal-nav-out" aria-label="Cerrar sesión"><LogOut size={20} aria-hidden="true" /> <span>Salir</span></Link>
      </nav>
    </div>
  </header>;
}
