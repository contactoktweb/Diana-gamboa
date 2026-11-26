'use client';

import { useState, useTransition } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cambiarModerador, eliminarUsuario } from '@/app/admin/acciones';

/** Acciones sobre la cuenta de un alumno. */
export default function AccionesAlumno({ id, nombre, esAdmin, esModerador = false }: { id: string; nombre: string; esAdmin: boolean; esModerador?: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const [pendiente, iniciar] = useTransition();
  if (esAdmin) return <span className="admin-tenue">Administración</span>;
  return <div className="admin-acciones">
    <button type="button" className="btn btn-outline btn-sm" onClick={() => setAbierto(v => !v)} aria-expanded={abierto} aria-label={`Acciones para ${nombre}`} disabled={pendiente}><MoreHorizontal size={18} /></button>
    {abierto && <div className="admin-acciones-menu">
      <button type="button" onClick={() => confirm(esModerador ? `¿Quitar a ${nombre} el rol de moderador?` : `¿Hacer a ${nombre} moderador de las clases? Podrá entrar a todas las clases sin pagar, como coanfitrión en Zoom.`) && iniciar(async () => {
        const r = await cambiarModerador(id, !esModerador);
        if (!r.ok) alert(r.error);
        setAbierto(false);
      })}>{esModerador ? 'Quitar rol de moderador' : 'Hacer moderador de las clases'}</button>
      <button type="button" className="es-peligro" onClick={() => confirm(`¿Eliminar la cuenta de ${nombre} y todos sus datos? Esta acción no se puede deshacer.`) && iniciar(async () => {
        const r = await eliminarUsuario(id);
        if (!r.ok) alert(r.error);
        setAbierto(false);
      })}>Eliminar cuenta y datos</button>
    </div>}
  </div>;
}
