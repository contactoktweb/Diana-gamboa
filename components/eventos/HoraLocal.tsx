'use client';

import { useEffect, useState } from 'react';
import { Globe2 } from 'lucide-react';

/**
 * Hora de inicio en la zona horaria del dispositivo del alumno (por ejemplo «2:00 p. m., hora de Colombia»).
 * Se calcula en el navegador, así cada persona ve su propia hora sin hacer cuentas.
 */
export default function HoraLocal({ iso, zonaReferencia = 'America/New_York' }: { iso: string; zonaReferencia?: string }) {
  const [texto, setTexto] = useState('');
  useEffect(() => {
    try {
      const d = new Date(iso);
      const hora = new Intl.DateTimeFormat('es', { hour: 'numeric', minute: '2-digit', hour12: true }).format(d);
      const zona = new Intl.DateTimeFormat('es', { timeZoneName: 'long' }).formatToParts(d).find(p => p.type === 'timeZoneName')?.value;
      const diaLocal = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
      const diaRef = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long', timeZone: zonaReferencia }).format(d);
      setTexto(`En tu hora local: ${hora}${zona ? ` (${zona})` : ''}${diaLocal !== diaRef ? `, el ${diaLocal}` : ''}`);
    } catch { setTexto(''); }
  }, [iso, zonaReferencia]);
  if (!texto) return null;
  return <li className="evento-hora-local"><Globe2 size={18} aria-hidden="true" /> {texto}</li>;
}
