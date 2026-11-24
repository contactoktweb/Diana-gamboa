'use client';

import { useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { aprobarPagosStripe } from '@/app/admin/eventos/acciones';
import { useAccion } from './useAccion';

/**
 * Inscripción manual (por si algo falla con un pago): se busca al alumno por nombre o correo,
 * queda con su cupo pagado en este evento y, si se marca, recibe su correo de confirmación.
 */
export default function InscribirAlumno({ eventoId, alumnos }: { eventoId: string; alumnos: { nombre: string; correo: string }[] }) {
  const { ejecutar, enCurso, aviso, ocupado } = useAccion();
  const [busqueda, setBusqueda] = useState('');
  const [enviar, setEnviar] = useState(true);

  // Se acepta un alumno de la lista («Nombre · correo») o un correo escrito a mano.
  const elegido = alumnos.find(a => `${a.nombre} · ${a.correo}` === busqueda || a.correo === busqueda.trim().toLowerCase());
  const correo = elegido?.correo ?? busqueda.trim().toLowerCase();
  const valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

  function inscribir(e: React.FormEvent) {
    e.preventDefault();
    if (!valido) return;
    const quien = elegido ? `${elegido.nombre} (${elegido.correo})` : correo;
    if (!confirm(`¿Inscribir a ${quien} en este evento con su cupo pagado?${enviar ? ' Le llegará el correo de confirmación.' : ''}`)) return;
    ejecutar('inscribir', async () => {
      const r = await aprobarPagosStripe(eventoId, elegido ? `${elegido.nombre}, ${elegido.correo}` : correo, enviar);
      if (!r.ok) return r;
      const f = r.filas[0];
      if (f?.resultado === 'ya_aprobado') return { ok: false, error: 'Esta persona ya estaba inscrita en el evento. No se envió nada.' };
      if (!f || f.resultado === 'error' || f.resultado === 'no_valido') return { ok: false, error: 'No se pudo inscribir. Revisa el correo e inténtalo de nuevo.' };
      setBusqueda('');
      return { ok: true, aviso: `Listo: ${quien} quedó inscrito${enviar ? (r.enviados ? ' y se le envió su correo.' : ', pero el correo no salió (revisa Resend).') : '.'}` };
    });
  }

  return <form className="inscribir-alumno" onSubmit={inscribir}>
    <label className="editor-campo"><span className="editor-etiqueta">Alumno</span>
      <input list="lista-alumnos" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Escribe su nombre o correo…" autoComplete="off" />
      <datalist id="lista-alumnos">{alumnos.map(a => <option key={a.correo} value={`${a.nombre} · ${a.correo}`} />)}</datalist>
      <small className="editor-ayuda">{elegido ? <>Se inscribirá a <strong>{elegido.nombre}</strong> ({elegido.correo}).</>
        : valido ? <>Ese correo no tiene cuenta todavía: el cupo se le asignará cuando se registre con <strong>{correo}</strong>.</>
          : 'Elige un alumno de la lista o escribe un correo.'}</small></label>
    <label className="check"><input type="checkbox" checked={enviar} onChange={e => setEnviar(e.target.checked)} /> <span>Enviarle el correo de confirmación de su cupo</span></label>
    <div className="admin-botones">
      <button type="submit" className="btn btn-green btn-sm" disabled={!valido || ocupado}>
        {enCurso('inscribir') ? <><Loader2 size={16} className="girando" aria-hidden="true" /> Inscribiendo…</> : <><UserPlus size={16} aria-hidden="true" /> Inscribir en este evento</>}
      </button>
    </div>
    {aviso('inscribir')}
  </form>;
}
