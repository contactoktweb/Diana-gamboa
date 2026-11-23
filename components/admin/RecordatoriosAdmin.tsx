'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { BellRing, CheckCircle2, Clock3, Eye, Send } from 'lucide-react';
import { enviarRecordatorioAhora } from '@/app/admin/eventos/acciones';

export interface FilaRecordatorio {
  clave: string; titulo: string; cuando: string; automatico: boolean;
  enviado: { fecha: string; enviados: number; fallidos: number; manual: boolean } | null;
  vencido: boolean;
}

/** Correos programados del evento: bienvenida (manual), víspera y día de clase (automáticos). */
export default function RecordatoriosAdmin({ eventoId, filas, activos, cron, inscritos }: {
  eventoId: string; filas: FilaRecordatorio[]; activos: boolean; cron: boolean; inscritos: number;
}) {
  const router = useRouter();
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendiente, iniciar] = useTransition();

  function enviar(f: FilaRecordatorio, prueba: boolean) {
    if (!prueba && !confirm(`${f.enviado ? 'Este correo ya se envió. ' : ''}¿Enviar «${f.titulo}» ahora a ${inscritos} ${inscritos === 1 ? 'inscrito' : 'inscritos'}?`)) return;
    setMensaje(null);
    iniciar(async () => {
      const r = await enviarRecordatorioAhora(eventoId, f.clave, prueba);
      setMensaje(r.ok ? { ok: true, texto: r.aviso ?? 'Listo.' } : { ok: false, texto: r.error });
      router.refresh();
    });
  }

  return <section className="admin-panel">
    <h2><BellRing size={20} aria-hidden="true" /> Correos a los inscritos</h2>
    <p className="admin-nota">Los recordatorios salen solos a las 8:00 a. m. (hora de Nueva York) del día indicado, con la hora de la clase en cada país y el botón «Entrar a la clase». Cada uno se envía una sola vez. Con «Probar» te llega a ti primero.</p>
    {!activos && <p className="auth-error">Los recordatorios automáticos de este evento están apagados (actívalos en «Cupos y pago», abajo).</p>}
    {activos && !cron && <p className="auth-error">Falta la variable <code>CRON_SECRET</code> en Vercel: sin ella la tarea diaria no se ejecuta y los recordatorios no salen solos.</p>}
    {!filas.length
      ? <p className="admin-vacio">Pon una fecha exacta al evento para programar los recordatorios.</p>
      : <div className="admin-tabla-contenedor"><table className="admin-tabla">
        <thead><tr><th>Correo</th><th>Cuándo</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr></thead>
        <tbody>{filas.map(f => <tr key={f.clave}>
          <td data-titulo="Correo"><strong>{f.titulo}</strong></td>
          <td data-titulo="Cuándo">{f.cuando}</td>
          <td data-titulo="Estado">{f.enviado
            ? <span className="resultado-aprobado"><CheckCircle2 size={16} aria-hidden="true" /> Enviado {f.enviado.fecha} · {f.enviado.enviados} {f.enviado.enviados === 1 ? 'correo' : 'correos'}{f.enviado.fallidos ? ` · ${f.enviado.fallidos} sin enviar` : ''}</span>
            : f.automatico && !f.vencido && activos ? <span className="admin-tenue"><Clock3 size={16} aria-hidden="true" /> Programado</span>
              : <span className="admin-tenue">{f.automatico ? 'No enviado' : 'Cuando tú lo envíes'}</span>}</td>
          <td><div className="admin-botones">
            <button type="button" className="btn btn-outline btn-sm" disabled={pendiente} onClick={() => enviar(f, true)}><Eye size={14} aria-hidden="true" /> Probar</button>
            <button type="button" className="btn btn-green btn-sm" disabled={pendiente || !inscritos} onClick={() => enviar(f, false)}><Send size={14} aria-hidden="true" /> Enviar ahora</button>
          </div></td>
        </tr>)}</tbody>
      </table></div>}
    <small className="editor-ayuda">Ojo con el límite de Resend: el plan gratuito permite 100 correos al día. Con {inscritos} inscritos, no envíes la bienvenida el mismo día que un recordatorio.</small>
    {mensaje && <p className={mensaje.ok ? 'auth-ok' : 'auth-error'} role={mensaje.ok ? 'status' : 'alert'}>{mensaje.texto}</p>}
  </section>;
}
