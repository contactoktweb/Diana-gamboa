'use client';

import { useState } from 'react';
import { Eye, Loader2, Megaphone, Send, Unlock } from 'lucide-react';
import { abrirATodos, enviarAvisoAhora } from '@/app/admin/eventos/acciones';
import { useAccion } from './useAccion';

type Estado = { enviados: number; pendientes: number };

/** Lanzamiento por etapas: 1) correo a la lista de espera (prioridad), 2) abrir a todos y avisar. */
export default function LanzamientoAdmin({ eventoId, enlace, prioridad, listaNombre, espera, general, abierto, limite }: {
  eventoId: string; enlace: string; prioridad: boolean; listaNombre: string; espera: Estado; general: Estado; abierto: boolean; limite: number;
}) {
  const [novedades, setNovedades] = useState(true);
  const { ejecutar, enCurso, aviso, ocupado: pendiente } = useAccion();
  const icono = (clave: string, normal: React.ReactNode) => enCurso(clave) ? <Loader2 size={14} className="girando" aria-hidden="true" /> : normal;

  return <section className="admin-panel">
    <h2><Megaphone size={20} aria-hidden="true" /> Lanzamiento del grupo</h2>
    <p className="admin-nota">Enlace directo para la lista de espera: <strong>{enlace}</strong></p>

    <h3 className="lanzamiento-paso">1. Lista de espera {prioridad ? '(con prioridad)' : ''}</h3>
    {prioridad
      ? <p className="admin-nota">Ahora mismo <strong>solo pueden comprar</strong> las personas de la lista de espera de «{listaNombre}». El grupo no aparece en la lista de Eventos: se entra con el enlace directo.</p>
      : <p className="admin-nota">{abierto ? 'La etapa de prioridad terminó.' : 'Este evento no tiene prioridad para una lista de espera.'}</p>}
    <p>Correo «Abrí un nuevo grupo…»: <strong>{espera.enviados}</strong> enviados · <strong>{espera.pendientes}</strong> pendientes.</p>
    <div className="admin-botones">
      <button type="button" className="btn btn-outline btn-sm" disabled={pendiente} onClick={() => ejecutar('espera-prueba', () => enviarAvisoAhora(eventoId, 'lista_espera', true))}>{icono('espera-prueba', <Eye size={14} aria-hidden="true" />)} Probar (te llega a ti)</button>
      <button type="button" className="btn btn-green btn-sm" disabled={pendiente || !espera.pendientes} onClick={() => {
        if (confirm(`¿Enviar el correo a ${Math.min(espera.pendientes, limite)} ${espera.pendientes === 1 ? 'persona' : 'personas'} de la lista de espera? Antes, prueba que la reserva y el pago funcionan.`)) ejecutar('espera', () => enviarAvisoAhora(eventoId, 'lista_espera', false));
      }}>{icono('espera', <Send size={14} aria-hidden="true" />)} {enCurso('espera') ? 'Enviando…' : 'Enviar a la lista de espera'}</button>
    </div>
    {aviso('espera-prueba')}{aviso('espera')}

    <h3 className="lanzamiento-paso">2. Abrir a todos</h3>
    {abierto
      ? <p className="admin-nota">El grupo está abierto para todos y aparece en Eventos. Aviso «Nuevo grupo disponible»: <strong>{general.enviados}</strong> enviados · <strong>{general.pendientes}</strong> pendientes{general.pendientes ? ' (pulsa «Enviar ya a los pendientes»)' : ''}.</p>
      : <p className="admin-nota">Cuando Diana confirme el anuncio público: quita la prioridad, muestra el grupo en Eventos y envía a los demás alumnos «Nuevo grupo disponible, por si no alcanzaste el anterior». No lo reciben la lista de espera ni quienes ya tienen cupo. Personas por avisar: <strong>{general.pendientes}</strong>.</p>}
    {!abierto && <label className="check"><input type="checkbox" checked={novedades} onChange={e => setNovedades(e.target.checked)} /> <span>Solo a quienes aceptaron recibir novedades al registrarse (recomendado)</span></label>}
    <div className="admin-botones">
      <button type="button" className="btn btn-outline btn-sm" disabled={pendiente} onClick={() => ejecutar('general-prueba', () => enviarAvisoAhora(eventoId, 'nuevo_grupo', true))}>{icono('general-prueba', <Eye size={14} aria-hidden="true" />)} Probar aviso</button>
      {abierto
        ? <button type="button" className="btn btn-green btn-sm" disabled={pendiente || !general.pendientes} onClick={() => ejecutar('general', () => enviarAvisoAhora(eventoId, 'nuevo_grupo', false))}>{icono('general', <Send size={14} aria-hidden="true" />)} {enCurso('general') ? 'Enviando…' : 'Enviar ya a los pendientes'}</button>
        : <button type="button" className="btn btn-gold btn-sm" disabled={pendiente} onClick={() => {
          if (confirm('¿Abrir el grupo a todos y enviar el aviso? Ya no habrá prioridad para la lista de espera.')) ejecutar('abrir', () => abrirATodos(eventoId, novedades));
        }}>{icono('abrir', <Unlock size={14} aria-hidden="true" />)} {enCurso('abrir') ? 'Abriendo y enviando…' : 'Abrir a todos y avisar'}</button>}
    </div>
    {aviso('general-prueba')}{aviso('general')}{aviso('abrir')}
    <small className="editor-ayuda">Cada persona recibe cada correo una sola vez, aunque pulses el botón de nuevo.</small>
  </section>;
}
