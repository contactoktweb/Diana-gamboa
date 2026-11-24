'use client';

import { BellRing, CheckCircle2, Clock3, Eye, Loader2, Send } from 'lucide-react';
import { enviarRecordatorioAhora } from '@/app/admin/eventos/acciones';
import { useAccion } from './useAccion';

export interface FilaRecordatorio {
  clave: string; titulo: string; cuando: string; automatico: boolean;
  enviado: { fecha: string; enviados: number; fallidos: number; manual: boolean } | null;
  vencido: boolean;
}

/** Correos programados del evento: bienvenida (manual), víspera y día de clase (automáticos). */
export default function RecordatoriosAdmin({ eventoId, filas, activos, cron, inscritos }: {
  eventoId: string; filas: FilaRecordatorio[]; activos: boolean; cron: boolean; inscritos: number;
}) {
  const { ejecutar, enCurso, aviso, ocupado } = useAccion();

  function enviar(f: FilaRecordatorio, prueba: boolean) {
    if (!prueba && !confirm(`${f.enviado ? 'Este correo ya se envió. ' : ''}¿Enviar «${f.titulo}» ahora a ${inscritos} ${inscritos === 1 ? 'inscrito' : 'inscritos'}?`)) return;
    ejecutar(prueba ? f.clave + ':prueba' : f.clave, () => enviarRecordatorioAhora(eventoId, f.clave, prueba));
  }

  // Todo funciona solo: la sección queda plegada en una línea. Si algo falla, se muestra abierta.
  const automatico = activos && cron;
  const proximo = filas.find(f => f.automatico && !f.enviado && !f.vencido);
  const contenido = <>
    <p className="admin-nota">Los recordatorios salen solos a las 8:00 a. m. (hora de Nueva York) del día indicado, con la hora de la clase en cada país y el botón «Entrar a la clase». Cada uno se envía una sola vez. Con «Probar» te llega a ti primero.</p>
    {!activos && <p className="auth-error">Los recordatorios automáticos de este evento están apagados (actívalos en «Cupos y pago», abajo).</p>}
    {activos && !cron && <p className="auth-error">Falta la variable <code>CRON_SECRET</code> en Vercel: sin ella la tarea diaria no se ejecuta y los recordatorios no salen solos. Mientras tanto puedes enviarlos con «Enviar ahora».</p>}
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
            <button type="button" className="btn btn-outline btn-sm" disabled={ocupado} onClick={() => enviar(f, true)}>
              {enCurso(f.clave + ':prueba') ? <Loader2 size={14} className="girando" aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />} Probar</button>
            <button type="button" className="btn btn-green btn-sm" disabled={ocupado || !inscritos} onClick={() => enviar(f, false)}>
              {enCurso(f.clave) ? <><Loader2 size={14} className="girando" aria-hidden="true" /> Enviando…</> : <><Send size={14} aria-hidden="true" /> Enviar ahora</>}</button>
          </div>
          {aviso(f.clave)}{aviso(f.clave + ':prueba')}</td>
        </tr>)}</tbody>
      </table></div>}
  </>;

  if (automatico) return <section className="admin-panel">
    <details className="correos-plegable">
      <summary>
        <span className="correos-plegable-titulo"><BellRing size={20} aria-hidden="true" /> Correos a los inscritos</span>
        <span className="admin-tenue">Automáticos{proximo ? ` · próximo: ${proximo.cuando}` : ''}</span>
      </summary>
      {contenido}
    </details>
  </section>;
  return <section className="admin-panel">
    <h2><BellRing size={20} aria-hidden="true" /> Correos a los inscritos</h2>
    {contenido}
  </section>;
}
