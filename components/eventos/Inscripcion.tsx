'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { ArrowRight, CheckCircle2, Clock3, Lock, X } from 'lucide-react';
import { iniciarInscripcion, unirseListaEspera } from '@/app/portal/eventos/acciones';

export type EstadoUsuario = 'ninguno' | 'pagada' | 'verificacion' | 'preinscrita' | 'espera';
type Modo = 'stripe' | 'preinscripcion';

/**
 * Inscripción a un evento. El valor solo aparece al pulsar «Reserva tu lugar».
 * Nunca se muestra cuántos cupos quedan: solo si hay o no.
 * Pago con Stripe dentro de la web (con las claves). Sin claves, preinscripción.
 */
export default function Inscripcion({ eventoId, precio, hayCupo, abierta, modo, estado, boton = 'Reserva tu lugar' }: {
  eventoId: string; precio: string; hayCupo: boolean; abierta: boolean; modo: Modo;
  estado: EstadoUsuario; boton?: string;
}) {
  const [abiertoPanel, setAbiertoPanel] = useState(false);
  const [acepta, setAcepta] = useState(false);
  const [listo, setListo] = useState<EstadoUsuario | null>(null);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendiente, iniciar] = useTransition();
  const actual = listo ?? estado;

  if (actual === 'pagada') return <p className="evento-estado es-ok"><CheckCircle2 size={20} aria-hidden="true" /> Ya tienes tu cupo en este evento.</p>;
  if (actual === 'verificacion') return <div className="evento-inscripcion">
    <p className="evento-estado es-verificacion"><Clock3 size={20} aria-hidden="true" /> Pago en verificación</p>
    <p className="evento-nota">Tu cupo queda apartado. Te escribiremos al correo en cuanto confirmemos la compra.</p>
  </div>;
  if (!abierta) return <p className="evento-estado es-cerrado"><Lock size={20} aria-hidden="true" /> Las inscripciones están cerradas.</p>;

  function ejecutar(accion: () => ReturnType<typeof iniciarInscripcion>, siOk?: EstadoUsuario) {
    setMensaje(null);
    iniciar(async () => {
      const r = await accion();
      if (r.ok && 'url' in r) { window.location.href = r.url; return; }
      if (r.ok) { setAbiertoPanel(false); if (siOk) setListo(siOk); else setMensaje({ ok: true, texto: r.aviso }); return; }
      setMensaje({ ok: false, texto: r.error });
    });
  }

  if (!hayCupo || actual === 'espera') return <div className="evento-inscripcion">
    <p className="evento-estado es-agotado"><X size={20} aria-hidden="true" /> Cupos agotados</p>
    {actual === 'espera'
      ? <p className="evento-nota">Estás en la lista de espera. Si se libera un cupo, te escribiremos.</p>
      : <button type="button" className="btn btn-outline" disabled={pendiente} onClick={() => ejecutar(() => unirseListaEspera(eventoId), 'espera')}>{pendiente ? 'Un momento…' : 'Avisarme si se libera un cupo'}</button>}
    {mensaje && !mensaje.ok && <p className="auth-error" role="alert">{mensaje.texto}</p>}
  </div>;

  const politica = <label className="check"><input type="checkbox" checked={acepta} onChange={e => setAcepta(e.target.checked)} /> <span>Acepto la <Link href="/reembolsos" target="_blank">política de reembolsos</Link> y entiendo que es un evento educativo, no asesoría financiera.</span></label>;

  return <div className="evento-inscripcion">
    <p className="evento-estado es-disponible"><CheckCircle2 size={20} aria-hidden="true" /> Cupos disponibles</p>
    {actual === 'preinscrita' && modo === 'preinscripcion'
      ? <p className="evento-nota">Ya estás preinscrito. Te avisaremos por correo en cuanto se habilite el pago.</p>
      : !abiertoPanel
        ? <button type="button" className="btn btn-green btn-lg" onClick={() => setAbiertoPanel(true)}>{actual === 'preinscrita' ? 'Completar mi pago' : boton} <ArrowRight aria-hidden="true" /></button>
        : <div className="evento-pago" role="region" aria-label="Inscripción">
          <p className="evento-pago-etiqueta">Valor del evento</p>
          <p className="evento-pago-precio">{precio} <small>USD · pago único</small></p>

          {modo === 'stripe' && <>
            <p className="evento-nota"><Lock size={16} aria-hidden="true" /> Pago seguro con tarjeta de crédito o débito, Apple Pay o Google Pay, a través de Stripe. Tu cupo queda apartado mientras pagas.</p>
            {politica}
            <div className="evento-pago-botones">
              <button type="button" className="btn btn-green btn-lg" disabled={!acepta || pendiente} onClick={() => ejecutar(() => iniciarInscripcion(eventoId))}>{pendiente ? 'Un momento…' : `Pagar ${precio}`} <ArrowRight aria-hidden="true" /></button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setAbiertoPanel(false)} disabled={pendiente}>Cancelar</button>
            </div>
          </>}

          {modo === 'preinscripcion' && <>
            <p className="evento-nota"><Clock3 size={16} aria-hidden="true" /> Los pagos se habilitarán muy pronto. Preinscríbete y te avisaremos por correo para que completes tu pago aquí mismo.</p>
            {politica}
            <div className="evento-pago-botones">
              <button type="button" className="btn btn-green btn-lg" disabled={!acepta || pendiente} onClick={() => ejecutar(() => iniciarInscripcion(eventoId), 'preinscrita')}>{pendiente ? 'Un momento…' : 'Preinscribirme'} <ArrowRight aria-hidden="true" /></button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setAbiertoPanel(false)} disabled={pendiente}>Cancelar</button>
            </div>
          </>}
        </div>}
    {mensaje && <p className={mensaje.ok ? 'auth-ok' : 'auth-error'} role={mensaje.ok ? 'status' : 'alert'}>{mensaje.texto}</p>}
  </div>;
}
