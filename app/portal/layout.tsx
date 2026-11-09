import type { Metadata } from 'next';
import Link from 'next/link';
import PortalHeader from '@/components/PortalHeader';
import { getContenido } from '@/lib/contenido';
import { exigirSesion } from '@/lib/sesion';
import { supabaseActivo } from '@/lib/supabase/config';

export const metadata: Metadata = { title: 'Portal del Alumno | Diana Gamboa', robots: { index: false } };

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const sesion = await exigirSesion('/portal');
  const { global: g, portal } = await getContenido();
  return <div className="portal">
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <PortalHeader logo={g.logo} nombre={g.nombreSitio} admin={sesion?.perfil?.rol === 'admin'} />
    <main id="contenido">{children}</main>
    <footer className="portal-footer"><div className="wrap">
      <p className="portal-motto">{portal.lema}</p>
      <p>{g.avisoEducativo}</p>
      {supabaseActivo && <p className="portal-cuenta"><Link href="/portal/cuenta">Mi cuenta</Link></p>}
    </div></footer>
  </div>;
}
