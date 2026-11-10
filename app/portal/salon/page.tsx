import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Clock3 } from 'lucide-react';
import { getContenido } from '@/lib/contenido';
import { Parrafos } from '@/lib/contenido/texto';
import { Visita } from '@/components/Rastreo';

export const metadata: Metadata = { title: 'Salón Diana Gamboa | Portal del Alumno' };

export default async function SalonPage() {
  const { formacion: f } = await getContenido();
  // Mientras la formación de pago esté oculta, esta página lleva de vuelta al Portal.
  if (!f.mostrar) redirect('/portal');
  return <>
    <Visita referencia="salon" />
    <section className="lesson-head">
      <div className="wrap">
        <nav className="breadcrumb" aria-label="Estás aquí">
          <Link href="/portal" className="back-link"><ArrowLeft size={18} aria-hidden="true" /> Inicio del portal</Link>
          <ChevronRight size={16} aria-hidden="true" />
          <span aria-current="page">{f.salonTitulo}</span>
        </nav>
        <div className="lesson-title">
          <div><p className="eyebrow">{f.salonEtiqueta} · {f.etiqueta}</p><h1>{f.salonTitulo}</h1></div>
        </div>
        <p className="lead-sm">{f.salonLead}</p>
      </div>
    </section>

    <div className="wrap lesson-body">
      <section className="premium-card premium-salon salon-detail" aria-label="Qué es el Salón">
        <div className="premium-content">
          <Parrafos texto={f.salonTexto} />
          <ul className="salon-points">
            {f.salonPuntos.map((p, i) => <li key={i}><Check size={18} aria-hidden="true" /> {p.texto}</li>)}
          </ul>
          {f.salonUrl
            ? <a className="btn btn-gold" href={f.salonUrl} target="_blank" rel="noopener noreferrer">{f.salonBotonUnirse} <ArrowRight size={18} aria-hidden="true" /></a>
            : <span className="btn btn-ghost" aria-disabled="true"><Clock3 size={18} aria-hidden="true" /> Próximamente</span>}
        </div>
        <div className="premium-visual" aria-hidden="true">
          <Image src={f.salonFoto} alt="" fill sizes="(max-width: 800px) 50vw, 30vw" />
        </div>
      </section>
      <p className="salon-disclaimer">{f.salonAviso}</p>
    </div>
  </>;
}
