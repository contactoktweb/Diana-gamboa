import { Fragment } from 'react';

/** Convierte **texto** en negrita. */
export function Enriquecido({ texto }: { texto: string }) {
  const partes = (texto ?? '').split(/(\*\*[^*]+\*\*)/g);
  return <>{partes.map((p, i) => p.startsWith('**') && p.endsWith('**') && p.length > 4
    ? <strong key={i}>{p.slice(2, -2)}</strong>
    : <Fragment key={i}>{p}</Fragment>)}</>;
}

/** Divide un texto en párrafos (separados por una línea en blanco). */
export const parrafos = (texto: string) => (texto ?? '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

/** Muestra varios párrafos, cada uno con su propia etiqueta <p>. */
export function Parrafos({ texto, className }: { texto: string; className?: string }) {
  return <>{parrafos(texto).map((p, i) => <p key={i} className={className}><Enriquecido texto={p} /></p>)}</>;
}
