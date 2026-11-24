import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/** Página no encontrada, con el diseño de la academia. */
export default function NoEncontrada() {
  return <main className="no-encontrada" id="contenido">
    <p className="eyebrow">Error 404</p>
    <h1>No encontramos esta página</h1>
    <p>Puede que el enlace esté incompleto o que la página ya no esté disponible.</p>
    <div className="admin-botones">
      <Link href="/portal" className="btn btn-green btn-sm"><ArrowLeft size={16} aria-hidden="true" /> Ir a mi portal</Link>
      <Link href="/" className="btn btn-outline btn-sm">Ir al inicio</Link>
    </div>
  </main>;
}
