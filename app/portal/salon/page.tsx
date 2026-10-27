import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Clock3 } from 'lucide-react';
import { SALON_URL } from '@/data/academia';

export const metadata: Metadata = { title: 'Salón Diana Gamboa | Portal del Alumno' };

export default function SalonPage() {
  return <>
    <section className="lesson-head">
      <div className="wrap">
        <nav className="breadcrumb" aria-label="Estás aquí">
          <Link href="/portal" className="back-link"><ArrowLeft size={18} aria-hidden="true" /> Inicio del portal</Link>
          <ChevronRight size={16} aria-hidden="true" />
          <span aria-current="page">Salón Diana Gamboa</span>
        </nav>
        <div className="lesson-title">
          <div><p className="eyebrow">Membresía mensual · Formación adicional de pago</p><h1>Salón Diana Gamboa</h1></div>
        </div>
        <p className="lead-sm">Un espacio para llevar lo aprendido a la práctica.</p>
      </div>
    </section>

    <div className="wrap lesson-body">
      <section className="premium-card premium-salon salon-detail" aria-label="Qué es el Salón">
        <div className="premium-content">
          <p>Participa en dos clases privadas en vivo al mes, donde analizaremos gráficas, conectaremos las piezas del mercado y practicaremos juntos el proceso de análisis.</p>
          <p>Un espacio para preguntar, aprender y desarrollar tu propio criterio.</p>
          <ul className="salon-points">
            <li><Check size={18} aria-hidden="true" /> Dos clases privadas en vivo al mes</li>
            <li><Check size={18} aria-hidden="true" /> Análisis de gráficas</li>
            <li><Check size={18} aria-hidden="true" /> Práctica del proceso de análisis</li>
          </ul>
          {SALON_URL
            ? <a className="btn btn-gold" href={SALON_URL} target="_blank" rel="noopener noreferrer">Unirme al Salón <ArrowRight size={18} aria-hidden="true" /></a>
            : <span className="btn btn-ghost" aria-disabled="true"><Clock3 size={18} aria-hidden="true" /> Próximamente</span>}
        </div>
        <div className="premium-visual" aria-hidden="true">
          <Image src="/diana-gesto.webp" alt="" fill sizes="(max-width: 800px) 50vw, 30vw" />
        </div>
      </section>
      <p className="salon-disclaimer">El Salón es un espacio educativo para practicar y profundizar en el análisis. No incluye señales de compra o venta, operaciones para copiar ni asesoría financiera personalizada.</p>
    </div>
  </>;
}
