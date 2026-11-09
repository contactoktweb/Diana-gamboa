'use client';

import { useEffect } from 'react';
import { supabaseNavegador } from '@/lib/supabase/cliente';

/** Registra un evento de uso para las estadísticas de la administración. */
export function registrarEvento(tipo: 'visita' | 'descarga', referencia: string) {
  void supabaseNavegador()?.rpc('registrar_evento', { p_tipo: tipo, p_referencia: referencia });
}

/** Registra la visita a una sección del portal. */
export function Visita({ referencia }: { referencia: string }) {
  useEffect(() => { registrarEvento('visita', referencia); }, [referencia]);
  return null;
}

/** Enlace de descarga que cuenta las descargas de cada recurso. */
export function EnlaceDescarga({ href, recurso, className, children }: { href: string; recurso: string; className?: string; children: React.ReactNode }) {
  return <a href={href} download target="_blank" rel="noopener noreferrer" className={className} onClick={() => registrarEvento('descarga', recurso)}>{children}</a>;
}
