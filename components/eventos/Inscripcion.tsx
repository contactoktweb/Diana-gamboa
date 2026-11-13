'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { ArrowRight, CheckCircle2, Clock3, Lock, X } from 'lucide-react';
import { iniciarInscripcion, unirseListaEspera } from '@/app/portal/eventos/acciones';

export type EstadoUsuario = 'ninguno' | 'pagada' | 'preinscrita' | 'espera';

/**
 * Inscripción a un evento. El valor solo aparece al pulsar «Reserva tu lugar».
 * Nunca se muestra cuántos cupos quedan: solo si hay o no.
 */
export default function Inscripcion({ eventoId, precio, hayCupo, abierta, pagosActivos, estado, boton = 'Reserva tu lugar' }: {
  eventoId: string; precio: string; hayCupo: boolean; abierta: boolean; pagosActivos: boolean; estado: EstadoUsuario; boton?: string;
}) {
  const [abiertoPanel, setAbiertoPanel] = useState(false);
  const [acepta, setAcepta] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendiente, iniciar] = useTransition();

  if (estado === 'pagada') return <p className="evento-estado es-ok"><CheckCircle2 size={20} aria-hidden="true" /> Ya tienes tu cupo en este evento.</p>;
  if (!abierta) return <p className="evento-estado es-cerrado"><Lock size={20} aria-hidden="true" /> Las inscripciones están cerradas.</p>;

  function ejecutar(accion: () => ReturnType<typeof iniciarInscripcion>) {
    setMensaje(null);
    iniciar(async () => {
      const r = await accion();
      if (r.ok && 'url' in r) { window.location.href = r.url; return; }
      if (r.ok) { setMensaje({ ok: true, texto: r.aviso }); setAbiertoPanel(false); return; }
      setMensaje({ ok: false, texto: r.error });
    });
  }

  if (!hayCupo || estado === 'espera') return <div className="evento-inscripcion">
    <p className="evento-estado es-agotado"><X size={20} aria-hidden="true" /> Cupos agotados</p>
    {estado === 'espera' || mensaje?.ok
      ? <p className="evento-nota">Estás en la lista de espera. Si se libera un cupo, te escribiremos.</p>
      : <button type="button" className="btn btn-outline" disabled={pendiente} onClick={() => ejecutar(() => unirseListaEspera(eventoId))}>{pendiente ? 'Un momento…' : 'Avisarme si se libera un cupo'}</button>}
    {mensaje && !mensaje.ok && <p className="auth-error" role="alert">{mensaje.texto}</p>}
  </div>;

  const preinscrito = estado === 'preinscrita' || (mensaje?.ok && !pagosActivos);
  return <div className="evento-inscripcion">
    <p className="evento-estado es-disponible"><CheckCircle2 size={20} aria-hidden="true" /> Cupos disponibles</p>
    {preinscrito && !pagosActivos
      ? <p className="evento-nota">Ya estás preinscrito. Te enviaremos a tu correo el enlace de pago en cuanto se habilite.</p>
      : !abiertoPanel
        ? <button type="button" className="btn btn-green btn-lg" onClick={() => setAbiertoPanel(true)}>{preinscrito ? 'Completar mi pago' : boton} <ArrowRight aria-hidden="true" /></button>
        : <div className="evento-pago" role="region" aria-label="Inscripción">
          <p className="evento-pago-etiqueta">Valor del evento</p>
          <p className="evento-pago-precio">{precio} <small>USD · pago único</small></p>
          {pagosActivos
            ? <p className="evento-nota"><Lock size={16} aria-hidden="true" /> Pago seguro con tarjeta de crédito o débito, Apple Pay o Google Pay, a través de Stripe. Tu cupo queda apartado mientras pagas.</p>
            : <p className="evento-nota"><Clock3 size={16} aria-hidden="true" /> Los pagos se habilitarán muy pronto. Preinscríbete y te enviaremos el enlace de pago a tu correo.</p>}
          <label className="check"><input type="checkbox" checked={acepta} onChange={e => setAcepta(e.target.checked)} /> <span>Acepto la <Link href="/reembolsos" target="_blank">política de reembolsos</Link> y entiendo que es un evento educativo, no asesoría financiera.</span></label>
          <div className="evento-pago-botones">
            <button type="button" className="btn btn-green btn-lg" disabled={!acepta || pendiente} onClick={() => ejecutar(() => iniciarInscripcion(eventoId))}>
              {pendiente ? 'Un momento…' : pagosActivos ? `Pagar ${precio}` : 'Preinscribirme'} <ArrowRight aria-hidden="true" />
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setAbiertoPanel(false)} disabled={pendiente}>Cancelar</button>
          </div>
        </div>}
    {mensaje && !(mensaje.ok && preinscrito) && <p className={mensaje.ok ? 'auth-ok' : 'auth-error'} role={mensaje.ok ? 'status' : 'alert'}>{mensaje.texto}</p>}
  </div>;
}
