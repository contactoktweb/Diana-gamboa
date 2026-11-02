'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Insignia from './Insignia';
import { TOTAL_PUNTOS } from '@/data/reto';
import { ultimoResultado, type Intento } from '@/lib/reto/registro';

/** Tarjeta del portal: invita a hacer el reto o muestra el nivel obtenido. */
export default function DescubreNivel() {
  const [res, setRes] = useState<Intento | undefined>();
  useEffect(() => setRes(ultimoResultado()), []);
  return <aside className="descubre" data-reveal>
    <Insignia nivel={res?.nivel ?? 'Explorador'} tam={92} />
    <div>
      <p className="eyebrow eyebrow-gold">El Reto de la Gráfica</p>
      {res
        ? <><h2>Tu nivel actual: {res.nivel}</h2><p>{res.puntaje} de {TOTAL_PUNTOS} puntos. Repite el reto cuando quieras para ver tu progreso.</p></>
        : <><h2>Descubre tu nivel</h2><p>Cinco retos visuales para descubrir cuánto sabes leer el mercado y saber por dónde comenzar.</p></>}
    </div>
    <Link href="/portal/reto" className="btn btn-gold">{res ? 'Ver mi resultado' : 'Descubre tu nivel'} <ArrowRight size={18} aria-hidden="true" /></Link>
  </aside>;
}
