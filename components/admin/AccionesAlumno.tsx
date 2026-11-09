'use client';

import { useState, useTransition } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { eliminarUsuario } from '@/app/admin/acciones';

/** Acciones sobre la cuenta de un alumno. */
export default function AccionesAlumno({ id, nombre, esAdmin }: { id: string; nombre: string; esAdmin: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const [pendiente, iniciar] = useTransition();
  if (esAdmin) return <span className="admin-tenue">Administración</span>;
  return <div className="admin-acciones">
    <button type="button" className="btn btn-outline btn-sm" onClick={() => setAbierto(v => !v)} aria-expanded={abierto} aria-label={`Acciones para ${nombre}`} disabled={pendiente}><MoreHorizontal size={18} /></button>
    {abierto && <div className="admin-acciones-menu">
      <button type="button" className="es-peligro" onClick={() => confirm(`¿Eliminar la cuenta de ${nombre} y todos sus datos? Esta acción no se puede deshacer.`) && iniciar(async () => {
        const r = await eliminarUsuario(id);
        if (!r.ok) alert(r.error);
        setAbierto(false);
      })}>Eliminar cuenta y datos</button>
    </div>}
  </div>;
}
