'use client';

import { useState } from 'react';
import { CheckCircle2, ExternalLink, Loader2, Save, Sparkles, Trash2, Video, Zap } from 'lucide-react';
import { crearSalaZoom, guardarSalaZoom, quitarSalaZoom } from '@/app/admin/eventos/acciones';
import { useAccion } from './useAccion';
import CopiarTexto from './CopiarTexto';

/** Sala de clase de Zoom del evento: crearla, guardarla y entrar como anfitriona. */
export default function SalaZoomAdmin({ eventoId, slug, sala, sdkActivo, apiActiva, enlace }: {
  eventoId: string; slug: string; sala: { reunion: string; clave: string } | null; sdkActivo: boolean; apiActiva: boolean; enlace: string;
}) {
  const [reunion, setReunion] = useState(sala?.reunion ?? '');
  const [clave, setClave] = useState(sala?.clave ?? '');
  const [duracion, setDuracion] = useState('120');
  const { ejecutar: correr, enCurso, aviso, ocupado: pendiente } = useAccion();
  const ejecutar = (accion: () => Promise<{ ok: true; aviso?: string } | { ok: false; error: string }>) => correr('sala', accion);
  const formato = (n: string) => n.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1 $2 $3');

  return <section className="admin-panel sala-admin">
    <h2><Video size={20} aria-hidden="true" /> Sala de clase (Zoom)</h2>
    {sdkActivo
      ? <p className="admin-nota">Los inscritos entran desde su portal con el botón «Entrar a la clase», sin salir de la web y sin ver el enlace de Zoom. La reunión debe ser de la cuenta de Zoom Pro de Diana y tener la <strong>sala de espera activada</strong>: así das paso solo a quienes reconoces.</p>
      : <p className="admin-nota">Pega el <strong>enlace de invitación</strong> de tu reunión de Zoom. Los inscritos con pago verán en su portal el botón «Entrar a la clase», que abre Zoom con ese enlace (los demás no lo ven). Activa la <strong>sala de espera</strong> en Zoom para dar paso solo a quienes reconoces.</p>}

    {sala
      ? <div className="sala-lista">
        <p className="auth-ok"><CheckCircle2 size={18} aria-hidden="true" /> Sala lista: reunión <strong>{formato(sala.reunion)}</strong>{sala.clave ? <> · código <strong>{sala.clave}</strong></> : null}</p>
        <p className="sala-enlace-admin"><span>Enlace para entrar:</span> <a href={enlace} target="_blank" rel="noopener noreferrer">{enlace}</a></p>
        <div className="admin-botones">
          <CopiarTexto texto={enlace} etiqueta="Copiar enlace de Zoom" />
          {sala.clave && <CopiarTexto texto={sala.clave} etiqueta="Copiar código" />}
        </div>
      </div>
      : <p className="admin-vacio">Todavía no hay sala. Crea la reunión o pega sus datos.</p>}

    {apiActiva && <div className="form-evento-fila">
      <label className="editor-campo"><span className="editor-etiqueta">Duración de cada clase (minutos)</span>
        <input type="number" min={30} max={600} value={duracion} onChange={e => setDuracion(e.target.value)} /></label>
      <button type="button" className="btn btn-gold btn-sm" disabled={pendiente} onClick={() => {
        if (!sala || confirm('Ya hay una sala guardada. ¿Crear una reunión nueva y reemplazarla?')) ejecutar(() => crearSalaZoom(eventoId, Number(duracion)));
      }}><Sparkles size={16} aria-hidden="true" /> {sala ? 'Crear una reunión nueva en Zoom' : 'Crear la reunión en Zoom automáticamente'}</button>
    </div>}

    {!apiActiva && <div className="sala-express">
      <h3><Zap size={18} aria-hidden="true" /> Reunión express (para probar o para empezar ya)</h3>
      <ol>
        <li>Pulsa <strong>«Crear reunión express»</strong>: se abre Zoom e inicia una reunión al instante con tu cuenta (sirve también una cuenta gratis, con límite de 40 minutos).</li>
        <li>En Zoom pulsa <strong>Participantes → Invitar → Copiar enlace de invitación</strong> (o el ícono de información <strong>ⓘ</strong> → Copiar enlace).</li>
        <li>Pégalo abajo en «Enlace de invitación de Zoom» y pulsa <strong>Guardar sala</strong>. Los inscritos ya pueden entrar.</li>
      </ol>
      <div className="admin-botones">
        <a className="btn btn-gold btn-sm" href="https://zoom.us/start/videomeeting" target="_blank" rel="noopener noreferrer"><Zap size={16} aria-hidden="true" /> Crear reunión express</a>
        <a className="btn btn-outline btn-sm" href="https://zoom.us/meeting/schedule" target="_blank" rel="noopener noreferrer"><ExternalLink size={16} aria-hidden="true" /> Programar una reunión con fecha</a>
      </div>
    </div>}

    <details className="sala-manual" open={!apiActiva}>
      <summary>{apiActiva ? 'O pega una reunión que ya creaste' : sala ? 'Cambiar la reunión' : 'Datos de la reunión (créala en zoom.us → Reuniones → Programar → Copiar invitación)'}</summary>
      <div className="form-evento-fila">
        <label className="editor-campo"><span className="editor-etiqueta">Enlace de invitación de Zoom (o el ID de la reunión)</span>
          <input value={reunion} onChange={e => setReunion(e.target.value)} placeholder="https://us06web.zoom.us/j/81234567890?pwd=…" /></label>
        <label className="editor-campo"><span className="editor-etiqueta">Código de acceso (passcode, opcional)</span>
          <input value={clave} onChange={e => setClave(e.target.value)} placeholder="Ej.: 482913" /></label>
      </div>
      <small className="editor-ayuda">Para una clase de varios días, crea en Zoom una reunión <strong>recurrente</strong> (diaria) para usar la misma sala todos los días.</small>
      <div className="admin-botones">
        <button type="button" className="btn btn-green btn-sm" disabled={pendiente || !reunion.trim()} onClick={() => ejecutar(() => guardarSalaZoom(eventoId, reunion, clave))}><Save size={16} aria-hidden="true" /> Guardar sala</button>
      </div>
    </details>

    {sala && <div className="admin-botones">
      <a className="btn btn-green btn-sm" href={`/portal/eventos/${slug}/sala`} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} aria-hidden="true" /> Ver la sala como la ven los alumnos</a>
      <button type="button" className="btn btn-outline btn-sm es-peligro" disabled={pendiente} onClick={() => { if (confirm('¿Quitar la sala? Los inscritos dejarán de ver el botón «Entrar a la clase».')) ejecutar(() => quitarSalaZoom(eventoId)); }}><Trash2 size={16} aria-hidden="true" /> Quitar sala</button>
    </div>}
    {sala && !apiActiva && <small className="editor-ayuda">Inicia la reunión en tu aplicación de Zoom con la cuenta Pro de Diana; los alumnos entran con el botón de su portal.</small>}
    {enCurso('sala') && <p className="admin-tenue"><Loader2 size={14} className="girando" aria-hidden="true" /> Guardando…</p>}
    {aviso('sala')}
  </section>;
}
