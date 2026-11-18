'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { aprobarPagosStripe, type FilaImportada } from '@/app/admin/eventos/acciones';

const TEXTO: Record<FilaImportada['resultado'], string> = {
  aprobado: 'Aprobado',
  aprobado_verificacion: 'Aprobado (estaba en verificación)',
  ya_aprobado: 'Ya estaba aprobado: no se envió nada',
  repetido: 'Repetido en la lista: se ignoró',
  no_valido: 'No se encontró un correo en esta línea',
  error: 'No se pudo aprobar: revísalo',
};

/** Aprobar en bloque los pagos confirmados en Stripe y avisar a cada persona. */
export default function AprobarPagos({ eventoId }: { eventoId: string }) {
  const router = useRouter();
  const [texto, setTexto] = useState('');
  const [enviar, setEnviar] = useState(true);
  const [res, setRes] = useState<{ filas: FilaImportada[]; enviados: number; fallidos: string[] } | null>(null);
  const [error, setError] = useState('');
  const [pendiente, iniciar] = useTransition();
  const lineas = texto.split(/\r?\n/).filter(l => l.trim()).length;

  function aprobar() {
    if (!confirm(`¿Aprobar ${lineas} ${lineas === 1 ? 'pago' : 'pagos'}${enviar ? ' y enviar el correo de «pago comprobado»' : ''}? Solo pega pagos que aparecen como «Efectuado» en Stripe.`)) return;
    setError(''); setRes(null);
    iniciar(async () => {
      const r = await aprobarPagosStripe(eventoId, texto, enviar);
      if (!r.ok) { setError(r.error); return; }
      setRes(r); setTexto('');
      router.refresh();
    });
  }

  const aprobados = res?.filas.filter(f => f.resultado === 'aprobado' || f.resultado === 'aprobado_verificacion').length ?? 0;
  return <section className="admin-panel aprobar-pagos">
    <h2>Aprobar pagos de Stripe</h2>
    <p className="admin-nota">Para quienes pagaron directamente con el enlace de Stripe. Pega una persona por línea, con su nombre y el correo con el que pagó (por ejemplo <code>María López, maria@gmail.com</code>), o solo el correo. Cada persona queda con su cupo pagado y, cuando entre a la web con ese correo, verá el evento como inscrita.</p>
    <textarea rows={8} value={texto} onChange={e => setTexto(e.target.value)} placeholder={'María López, maria@gmail.com\nJuan Pérez, juan@yahoo.com'} aria-label="Lista de pagos" />
    <label className="check"><input type="checkbox" checked={enviar} onChange={e => setEnviar(e.target.checked)} /> <span>Enviar a cada persona el correo «Pago comprobado: estás dentro»</span></label>
    <div className="admin-botones">
      <button type="button" className="btn btn-green btn-sm" disabled={!lineas || pendiente} onClick={aprobar}>
        {enviar ? <Send size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />} {pendiente ? 'Aprobando…' : `Aprobar ${lineas || ''} ${enviar ? 'y enviar' : ''}`.replace(/\s+/g, ' ')}
      </button>
    </div>
    {error && <p className="auth-error" role="alert">{error}</p>}
    {res && <div role="status">
      <p className="auth-ok"><CheckCircle2 size={18} aria-hidden="true" /> {aprobados} {aprobados === 1 ? 'pago aprobado' : 'pagos aprobados'}{enviar ? ` · ${res.enviados} ${res.enviados === 1 ? 'correo enviado' : 'correos enviados'}` : ''}.</p>
      {res.fallidos.length > 0 && <p className="auth-error">No se pudieron enviar {res.fallidos.length} correos (puede ser el límite diario de Resend). Esos pagos sí quedaron aprobados: {res.fallidos.join(', ')}</p>}
      <div className="admin-tabla-contenedor"><table className="admin-tabla">
        <thead><tr><th>Correo</th><th>Nombre</th><th>Resultado</th></tr></thead>
        <tbody>{res.filas.map((f, i) => <tr key={i}>
          <td data-titulo="Correo">{f.correo}</td>
          <td data-titulo="Nombre">{f.nombre || '—'}</td>
          <td data-titulo="Resultado" className={`resultado-${f.resultado}`}>{TEXTO[f.resultado]}</td>
        </tr>)}</tbody>
      </table></div>
    </div>}
  </section>;
}
