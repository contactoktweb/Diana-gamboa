'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Eye, Megaphone, Send, Unlock } from 'lucide-react';
import { abrirATodos, enviarAvisoAhora } from '@/app/admin/eventos/acciones';

type Estado = { enviados: number; pendientes: number };

/** Lanzamiento por etapas: 1) correo a la lista de espera (prioridad), 2) abrir a todos y avisar. */
export default function LanzamientoAdmin({ eventoId, enlace, prioridad, listaNombre, espera, general, abierto, limite }: {
  eventoId: string; enlace: string; prioridad: boolean; listaNombre: string; espera: Estado; general: Estado; abierto: boolean; limite: number;
}) {
  const router = useRouter();
  const [novedades, setNovedades] = useState(true);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendiente, iniciar] = useTransition();

  function ejecutar(accion: () => Promise<{ ok: true; aviso?: string } | { ok: false; error: string }>) {
    setMensaje(null);
    iniciar(async () => {
      const r = await accion();
      setMensaje(r.ok ? { ok: true, texto: r.aviso ?? 'Listo.' } : { ok: false, texto: r.error });
      router.refresh();
    });
  }

  return <section className="admin-panel">
    <h2><Megaphone size={20} aria-hidden="true" /> Lanzamiento del grupo</h2>
    <p className="admin-nota">Enlace directo para la lista de espera: <strong>{enlace}</strong></p>

    <h3 className="lanzamiento-paso">1. Lista de espera {prioridad ? '(con prioridad)' : ''}</h3>
    {prioridad
      ? <p className="admin-nota">Ahora mismo <strong>solo pueden comprar</strong> las personas de la lista de espera de «{listaNombre}». El grupo no aparece en la lista de Eventos: se entra con el enlace directo.</p>
      : <p className="admin-nota">{abierto ? 'La etapa de prioridad terminó.' : 'Este evento no tiene prioridad para una lista de espera.'}</p>}
    <p>Correo «Abrí un nuevo grupo…»: <strong>{espera.enviados}</strong> enviados · <strong>{espera.pendientes}</strong> pendientes.</p>
    <div className="admin-botones">
      <button type="button" className="btn btn-outline btn-sm" disabled={pendiente} onClick={() => ejecutar(() => enviarAvisoAhora(eventoId, 'lista_espera', true))}><Eye size={14} aria-hidden="true" /> Probar (te llega a ti)</button>
      <button type="button" className="btn btn-green btn-sm" disabled={pendiente || !espera.pendientes} onClick={() => {
        if (confirm(`¿Enviar el correo a ${Math.min(espera.pendientes, limite)} ${espera.pendientes === 1 ? 'persona' : 'personas'} de la lista de espera? Antes, prueba que la reserva y el pago funcionan.`)) ejecutar(() => enviarAvisoAhora(eventoId, 'lista_espera', false));
      }}><Send size={14} aria-hidden="true" /> Enviar a la lista de espera</button>
    </div>

    <h3 className="lanzamiento-paso">2. Abrir a todos</h3>
    {abierto
      ? <p className="admin-nota">El grupo está abierto para todos y aparece en Eventos. Aviso «Nuevo grupo disponible»: <strong>{general.enviados}</strong> enviados · <strong>{general.pendientes}</strong> pendientes{general.pendientes ? ' (salen solos cada mañana por el límite diario de Resend)' : ''}.</p>
      : <p className="admin-nota">Cuando Diana confirme el anuncio público: quita la prioridad, muestra el grupo en Eventos y envía a los demás alumnos «Nuevo grupo disponible, por si no alcanzaste el anterior». No lo reciben la lista de espera ni quienes ya tienen cupo. Personas por avisar: <strong>{general.pendientes}</strong>.</p>}
    {!abierto && <label className="check"><input type="checkbox" checked={novedades} onChange={e => setNovedades(e.target.checked)} /> <span>Solo a quienes aceptaron recibir novedades al registrarse (recomendado)</span></label>}
    <div className="admin-botones">
      <button type="button" className="btn btn-outline btn-sm" disabled={pendiente} onClick={() => ejecutar(() => enviarAvisoAhora(eventoId, 'nuevo_grupo', true))}><Eye size={14} aria-hidden="true" /> Probar aviso</button>
      {abierto
        ? <button type="button" className="btn btn-green btn-sm" disabled={pendiente || !general.pendientes} onClick={() => ejecutar(() => enviarAvisoAhora(eventoId, 'nuevo_grupo', false))}><Send size={14} aria-hidden="true" /> Enviar ya a los pendientes</button>
        : <button type="button" className="btn btn-gold btn-sm" disabled={pendiente} onClick={() => {
          if (confirm('¿Abrir el grupo a todos y enviar el aviso? Ya no habrá prioridad para la lista de espera.')) ejecutar(() => abrirATodos(eventoId, novedades));
        }}><Unlock size={14} aria-hidden="true" /> Abrir a todos y avisar</button>}
    </div>
    <small className="editor-ayuda">Cada persona recibe cada correo una sola vez. Se envían hasta {limite} por vez por el límite diario de Resend (plan gratuito: 100 al día, contando los recordatorios).</small>
    {mensaje && <p className={mensaje.ok ? 'auth-ok' : 'auth-error'} role={mensaje.ok ? 'status' : 'alert'}>{mensaje.texto}</p>}
  </section>;
}
