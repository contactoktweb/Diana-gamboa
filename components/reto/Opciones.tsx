'use client';

export interface Opcion { valor: string; etiqueta: string; color?: string }

/** Grupo de botones grandes de respuesta única, cómodos para el dedo. */
export default function Opciones({ opciones, valor, onCambio, bloqueado, correcta, etiqueta }: {
  opciones: Opcion[]; valor: string | null; onCambio: (v: string) => void; bloqueado?: boolean; correcta?: string; etiqueta: string;
}) {
  return <div className="reto-opciones" role="radiogroup" aria-label={etiqueta}>
    {opciones.map(o => <button key={o.valor} type="button" role="radio" aria-checked={valor === o.valor} disabled={bloqueado}
      className={`reto-opcion ${valor === o.valor ? 'is-elegida' : ''} ${correcta === o.valor ? 'is-correcta' : ''}`} onClick={() => onCambio(o.valor)}>
      {o.color && <span className="reto-muestra" style={{ background: o.color }} aria-hidden="true" />}
      {o.etiqueta}
    </button>)}
  </div>;
}
