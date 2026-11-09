'use client';

import { useState, useTransition } from 'react';
import { UserPlus } from 'lucide-react';
import { crearAlumnoProvisional } from '@/app/admin/acciones';

/** Crea una cuenta con contraseña provisional y la envía por correo al alumno. */
export default function CrearAlumno({ disponible }: { disponible: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendiente, iniciar] = useTransition();
  if (!abierto) return <button type="button" className="btn btn-outline btn-sm" onClick={() => setAbierto(true)}><UserPlus size={16} aria-hidden="true" /> Crear alumno</button>;
  return <form className="admin-panel crear-alumno" onSubmit={ev => {
    ev.preventDefault();
    const d = new FormData(ev.currentTarget);
    const form = ev.currentTarget;
    iniciar(async () => {
      const r = await crearAlumnoProvisional(String(d.get('nombre') ?? ''), String(d.get('correo') ?? ''));
      setMensaje(r.ok ? { ok: true, texto: 'Cuenta creada. Le enviamos un correo con su contraseña provisional.' } : { ok: false, texto: r.error });
      if (r.ok) form.reset();
    });
  }}>
    <h2>Crear alumno con contraseña provisional</h2>
    <p className="admin-nota">El alumno recibe un correo con una contraseña provisional y, al entrar por primera vez, crea la suya.</p>
    {!disponible && <p className="auth-error">Para crear alumnos hay que configurar Resend y la clave secreta de Supabase en Vercel.</p>}
    <div className="crear-alumno-campos">
      <label className="editor-campo"><span className="editor-etiqueta">Nombre</span><input name="nombre" required disabled={!disponible} /></label>
      <label className="editor-campo"><span className="editor-etiqueta">Correo</span><input name="correo" type="email" required disabled={!disponible} /></label>
    </div>
    {mensaje && <p className={mensaje.ok ? 'auth-ok' : 'auth-error'} role="status">{mensaje.texto}</p>}
    <div className="admin-botones">
      <button className="btn btn-green btn-sm" disabled={!disponible || pendiente}>{pendiente ? 'Creando…' : 'Crear y enviar correo'}</button>
      <button type="button" className="btn btn-outline btn-sm" onClick={() => { setAbierto(false); setMensaje(null); }}>Cerrar</button>
    </div>
  </form>;
}
