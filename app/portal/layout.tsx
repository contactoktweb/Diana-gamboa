import type { Metadata } from 'next';
import PortalHeader from '@/components/PortalHeader';

export const metadata: Metadata = { title: 'Portal del Alumno | Diana Gamboa', robots: { index: false } };

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <div className="portal">
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <PortalHeader />
    <main id="contenido">{children}</main>
    <footer className="portal-footer"><div className="wrap">
      <p className="portal-motto">Aprende a leer. Aprende a analizar. Aprende a decidir.</p>
      <p>Contenido educativo. No constituye asesoría financiera.</p>
    </div></footer>
  </div>;
}
