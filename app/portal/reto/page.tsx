import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import RetoJuego from '@/components/reto/RetoJuego';

export const metadata: Metadata = { title: 'El Reto de la Gráfica | Portal del Alumno' };

export default function RetoPortalPage() {
  return <div className="reto-pagina">
    <div className="wrap">
      <nav className="breadcrumb" aria-label="Estás aquí">
        <Link href="/portal" className="back-link"><ArrowLeft size={18} aria-hidden="true" /> Inicio del portal</Link>
        <ChevronRight size={16} aria-hidden="true" />
        <span aria-current="page">El Reto de la Gráfica</span>
      </nav>
      <RetoJuego modo="alumno" />
    </div>
  </div>;
}
