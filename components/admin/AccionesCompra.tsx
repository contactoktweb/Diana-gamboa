'use client';

import { Check, Loader2, X } from 'lucide-react';
import { aprobarCompra, rechazarCompra } from '@/app/admin/eventos/acciones';
import { useAccion } from './useAccion';

/** Aprobar o rechazar una compra hecha con el enlace de pago. El resultado se ve junto a los botones. */
export default function AccionesCompra({ id, nombre }: { id: string; nombre: string }) {
  const { ejecutar, enCurso, aviso, ocupado } = useAccion();
  const pedir = (clave: 'aprobar' | 'rechazar', pregunta: string) => {
    // Al aprobar, la fila pasa a «Inscritos»: si algo falla, el aviso sale en una ventana para no perderlo.
    if (confirm(pregunta)) ejecutar(clave, async () => {
      const r = await (clave === 'aprobar' ? aprobarCompra : rechazarCompra)(id);
      if (!r.ok) alert(r.error);
      return r;
    });
  };
  return <div className="verif-acciones">
    <button type="button" className="btn btn-green btn-sm" disabled={ocupado}
      onClick={() => pedir('aprobar', `¿Confirmas que el pago de ${nombre} aparece en Stripe? Quedará inscrito y recibirá su correo de confirmación.`)}>
      {enCurso('aprobar') ? <><Loader2 size={16} className="girando" aria-hidden="true" /> Aprobando…</> : <><Check size={16} aria-hidden="true" /> Aprobar</>}</button>
    <button type="button" className="btn btn-outline btn-sm es-peligro" disabled={ocupado}
      onClick={() => pedir('rechazar', `¿Rechazar la compra de ${nombre}? Su cupo se liberará.`)}>
      {enCurso('rechazar') ? <><Loader2 size={16} className="girando" aria-hidden="true" /> Rechazando…</> : <><X size={16} aria-hidden="true" /> Rechazar</>}</button>
    {aviso('aprobar')}{aviso('rechazar')}
  </div>;
}
