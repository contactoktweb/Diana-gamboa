'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { CheckCircle2, ExternalLink, Save, Sparkles, Trash2, Video } from 'lucide-react';
import { crearSalaZoom, guardarSalaZoom, quitarSalaZoom } from '@/app/admin/eventos/acciones';

/** Sala de clase de Zoom del evento: crearla, guardarla y entrar como anfitriona. */
export default function SalaZoomAdmin({ eventoId, slug, sala, sdkActivo, apiActiva }: {
  eventoId: string; slug: string; sala: { reunion: string; clave: string } | null; sdkActivo: boolean; apiActiva: boolean;
}) {
  const router = useRouter();
  const [reunion, setReunion] = useState(sala?.reunion ?? '');
  const [clave, setClave] = useState(sala?.clave ?? '');
  const [duracion, setDuracion] = useState('120');
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendiente, iniciar] = useTransition();

  function ejecutar(accion: () => Promise<{ ok: true; aviso?: string } | { ok: false; error: string }>) {
    setMensaje(null);
    iniciar(async () => {
      const r = await accion();
      setMensaje(r.ok ? { ok: true, texto: r.aviso ?? 'Listo.' } : { ok: false, texto: r.error });
      if (r.ok) router.refresh();
    });
  }
  const formato = (n: string) => n.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1 $2 $3');

  return <section className="admin-panel sala-admin">
    <h2><Video size={20} aria-hidden="true" /> Sala de clase (Zoom dentro de la web)</h2>
    {!sdkActivo && <p className="auth-error">Falta conectar Zoom: sube a Vercel las variables <code>ZOOM_SDK_CLIENT_ID</code> y <code>ZOOM_SDK_CLIENT_SECRET</code> (app «General App» con Meeting SDK) y vuelve a desplegar. Puedes guardar la reunión desde ya.</p>}
    <p className="admin-nota">Los inscritos entran desde su portal con el botón «Entrar a la clase», sin salir de la web y sin ver el enlace de Zoom. La reunión debe ser de la cuenta de Zoom Pro de Diana y tener la <strong>sala de espera activada</strong>: así das paso solo a quienes reconoces.</p>

    {sala
      ? <p className="auth-ok"><CheckCircle2 size={18} aria-hidden="true" /> Sala lista: reunión <strong>{formato(sala.reunion)}</strong>{sala.clave ? <> · código <strong>{sala.clave}</strong></> : null}</p>
      : <p className="admin-vacio">Todavía no hay sala. Crea la reunión o pega sus datos.</p>}

    {apiActiva && <div className="form-evento-fila">
      <label className="editor-campo"><span className="editor-etiqueta">Duración de cada clase (minutos)</span>
        <input type="number" min={30} max={600} value={duracion} onChange={e => setDuracion(e.target.value)} /></label>
      <button type="button" className="btn btn-gold btn-sm" disabled={pendiente} onClick={() => {
        if (!sala || confirm('Ya hay una sala guardada. ¿Crear una reunión nueva y reemplazarla?')) ejecutar(() => crearSalaZoom(eventoId, Number(duracion)));
      }}><Sparkles size={16} aria-hidden="true" /> {sala ? 'Crear una reunión nueva en Zoom' : 'Crear la reunión en Zoom automáticamente'}</button>
    </div>}

    <details className="sala-manual" open={!apiActiva && !sala}>
      <summary>{apiActiva ? 'O escribe los datos de una reunión que ya creaste' : 'Datos de la reunión (créala en zoom.us → Reuniones → Programar)'}</summary>
      <div className="form-evento-fila">
        <label className="editor-campo"><span className="editor-etiqueta">ID de la reunión o enlace de invitación</span>
          <input value={reunion} onChange={e => setReunion(e.target.value)} placeholder="812 3456 7890 o https://us06web.zoom.us/j/…" /></label>
        <label className="editor-campo"><span className="editor-etiqueta">Código de acceso (passcode)</span>
          <input value={clave} onChange={e => setClave(e.target.value)} placeholder="Ej.: 482913" /></label>
      </div>
      <small className="editor-ayuda">Para una clase de varios días, crea en Zoom una reunión <strong>recurrente</strong> (diaria) para usar la misma sala todos los días.</small>
      <div className="admin-botones">
        <button type="button" className="btn btn-green btn-sm" disabled={pendiente || !reunion.trim()} onClick={() => ejecutar(() => guardarSalaZoom(eventoId, reunion, clave))}><Save size={16} aria-hidden="true" /> Guardar sala</button>
      </div>
    </details>

    {sala && <div className="admin-botones">
      <a className="btn btn-green btn-sm" href={`/portal/eventos/${slug}/sala`} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} aria-hidden="true" /> Entrar a la sala como anfitriona</a>
      <button type="button" className="btn btn-outline btn-sm es-peligro" disabled={pendiente} onClick={() => { if (confirm('¿Quitar la sala? Los inscritos dejarán de ver el botón «Entrar a la clase».')) ejecutar(() => quitarSalaZoom(eventoId)); }}><Trash2 size={16} aria-hidden="true" /> Quitar sala</button>
    </div>}
    {sala && !apiActiva && <small className="editor-ayuda">Para iniciar la clase como anfitriona desde la web falta la app Server-to-Server de Zoom. Sin ella, inicia la reunión en la aplicación de Zoom (con tu cuenta Pro): los alumnos igual entran desde la web.</small>}
    {mensaje && <p className={mensaje.ok ? 'auth-ok' : 'auth-error'} role={mensaje.ok ? 'status' : 'alert'}>{mensaje.texto}</p>}
  </section>;
}
