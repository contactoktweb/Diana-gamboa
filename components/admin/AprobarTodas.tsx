'use client';

import { CheckCheck, Loader2 } from 'lucide-react';
import { aprobarTodasCompras } from '@/app/admin/eventos/acciones';
import { useAccion } from './useAccion';

/** Aprueba de una vez todas las compras en verificación del evento. */
export default function AprobarTodas({ eventoId, cantidad }: { eventoId: string; cantidad: number }) {
  const { ejecutar, enCurso, aviso, ocupado } = useAccion();
  function aprobar() {
    if (!confirm(`¿Aprobar las ${cantidad} compras por verificar? Cada persona queda inscrita y recibe su correo «Gracias por tu confianza». Hazlo solo si ya comprobaste sus pagos en Stripe.`)) return;
    ejecutar('todas', () => aprobarTodasCompras(eventoId));
  }
  return <div className="aprobar-todas">
    <button type="button" className="btn btn-green btn-sm" disabled={ocupado} onClick={aprobar}>
      {enCurso('todas') ? <><Loader2 size={16} className="girando" aria-hidden="true" /> Aprobando…</> : <><CheckCheck size={16} aria-hidden="true" /> Aprobar todas ({cantidad})</>}
    </button>
    {aviso('todas')}
  </div>;
}
