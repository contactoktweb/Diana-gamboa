import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import MiCuenta from '@/components/MiCuenta';
import { getSesion } from '@/lib/sesion';
import { supabaseActivo } from '@/lib/supabase/config';

export const metadata: Metadata = { title: 'Mi cuenta | Portal del Alumno' };

export default async function CuentaPage() {
  if (!supabaseActivo) redirect('/portal');
  const sesion = await getSesion();
  if (!sesion?.perfil) redirect('/ingresar?next=/portal/cuenta');
  return <>
    <section className="lesson-head">
      <div className="wrap">
        <nav className="breadcrumb" aria-label="Estás aquí">
          <Link href="/portal" className="back-link"><ArrowLeft size={18} aria-hidden="true" /> Inicio del portal</Link>
          <ChevronRight size={16} aria-hidden="true" />
          <span aria-current="page">Mi cuenta</span>
        </nav>
        <div className="lesson-title"><div><h1>Mi cuenta</h1></div></div>
        <p className="lead-sm">Tus datos, tus preferencias de correo y algunas preguntas opcionales para conocerte mejor.</p>
      </div>
    </section>
    <div className="wrap lesson-body"><MiCuenta perfil={sesion.perfil} /></div>
  </>;
}
