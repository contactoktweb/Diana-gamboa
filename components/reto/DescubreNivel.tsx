'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Insignia from './Insignia';
import { TOTAL_PUNTOS } from '@/data/reto';
import { idsLocales, ultimoResultado } from '@/lib/reto/registro';
import { supabaseNavegador } from '@/lib/supabase/cliente';

/** Tarjeta del portal: invita a hacer el reto o muestra el nivel obtenido. */
export default function DescubreNivel() {
  const [res, setRes] = useState<{ nivel: string; puntaje: number } | undefined>();
  useEffect(() => {
    const local = ultimoResultado();
    if (local?.nivel) setRes({ nivel: local.nivel, puntaje: local.puntaje ?? 0 });
    const sb = supabaseNavegador();
    if (!sb) return;
    (async () => {
      // Pasa a la cuenta los retos hechos en este navegador y muestra el último guardado (de cualquier dispositivo).
      const ids = idsLocales();
      if (ids.length) await sb.rpc('reto_vincular', { ids });
      const { data } = await sb.from('reto_intentos').select('nivel, puntaje').eq('completo', true).order('inicio', { ascending: false }).limit(1).maybeSingle();
      if (data?.nivel) setRes({ nivel: data.nivel, puntaje: data.puntaje ?? 0 });
    })();
  }, []);
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
