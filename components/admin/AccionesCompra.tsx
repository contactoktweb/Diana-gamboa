'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Check, X } from 'lucide-react';
import { aprobarCompra, rechazarCompra } from '@/app/admin/eventos/acciones';

/** Aprobar o rechazar una compra hecha con el enlace de pago. */
export default function AccionesCompra({ id, nombre }: { id: string; nombre: string }) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const ejecutar = (accion: typeof aprobarCompra, pregunta: string) => {
    if (!confirm(pregunta)) return;
    iniciar(async () => {
      const r = await accion(id);
      if (!r.ok) alert(r.error);
      router.refresh();
    });
  };
  return <div className="verif-acciones">
    <button type="button" className="btn btn-green btn-sm" disabled={pendiente}
      onClick={() => ejecutar(aprobarCompra, `¿Confirmas que el pago de ${nombre} aparece en Stripe? Quedará inscrito y recibirá su correo de confirmación.`)}>
      <Check size={16} aria-hidden="true" /> Aprobar</button>
    <button type="button" className="btn btn-outline btn-sm es-peligro" disabled={pendiente}
      onClick={() => ejecutar(rechazarCompra, `¿Rechazar la compra de ${nombre}? Su cupo se liberará.`)}>
      <X size={16} aria-hidden="true" /> Rechazar</button>
  </div>;
}
