'use client';

import { useState, useTransition } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cambiarRol, eliminarUsuario } from '@/app/admin/acciones';

/** Acciones sobre una cuenta: dar o quitar acceso de administración, o eliminarla. */
export default function AccionesAlumno({ id, nombre, rol, esYo }: { id: string; nombre: string; rol: 'alumno' | 'admin'; esYo: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const [pendiente, iniciar] = useTransition();
  if (esYo) return <span className="admin-tenue">Tu cuenta</span>;
  const ejecutar = (fn: () => Promise<{ ok: boolean; error?: string }>) => iniciar(async () => {
    const r = await fn();
    if (!r.ok) alert(r.error);
    setAbierto(false);
  });
  return <div className="admin-acciones">
    <button type="button" className="btn btn-outline btn-sm" onClick={() => setAbierto(v => !v)} aria-expanded={abierto} aria-label={`Acciones para ${nombre}`} disabled={pendiente}><MoreHorizontal size={18} /></button>
    {abierto && <div className="admin-acciones-menu">
      {rol === 'admin'
        ? <button type="button" onClick={() => confirm(`¿Quitar el acceso de administración a ${nombre}?`) && ejecutar(() => cambiarRol(id, 'alumno'))}>Quitar acceso de administración</button>
        : <button type="button" onClick={() => confirm(`¿Dar acceso de administración a ${nombre}? Podrá editar la web y ver los datos de todos los alumnos.`) && ejecutar(() => cambiarRol(id, 'admin'))}>Dar acceso de administración</button>}
      <button type="button" className="es-peligro" onClick={() => confirm(`¿Eliminar la cuenta de ${nombre} y todos sus datos? Esta acción no se puede deshacer.`) && ejecutar(() => eliminarUsuario(id))}>Eliminar cuenta y datos</button>
    </div>}
  </div>;
}
