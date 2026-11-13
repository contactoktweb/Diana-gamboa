'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { ArrowRight, CheckCircle2, Clock3, ExternalLink, Lock, Upload, X } from 'lucide-react';
import { avisarPagoRealizado, iniciarInscripcion, unirseListaEspera } from '@/app/portal/eventos/acciones';

export type EstadoUsuario = 'ninguno' | 'pagada' | 'verificacion' | 'preinscrita' | 'espera';
type Modo = 'stripe' | 'enlace' | 'preinscripcion';

/** Reduce las fotos grandes del celular antes de enviarlas (máximo 2000 px, JPEG). */
async function prepararComprobante(archivo: File): Promise<File> {
  if (!archivo.type.startsWith('image/') || archivo.size < 1.5 * 1024 * 1024) return archivo;
  try {
    const img = await createImageBitmap(archivo);
    const escala = Math.min(1, 2000 / Math.max(img.width, img.height));
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round(img.width * escala); lienzo.height = Math.round(img.height * escala);
    lienzo.getContext('2d')!.drawImage(img, 0, 0, lienzo.width, lienzo.height);
    const blob = await new Promise<Blob | null>(r => lienzo.toBlob(r, 'image/jpeg', 0.85));
    return blob ? new File([blob], 'comprobante.jpg', { type: 'image/jpeg' }) : archivo;
  } catch { return archivo; }
}

/**
 * Inscripción a un evento. El valor solo aparece al pulsar «Reserva tu lugar».
 * Nunca se muestra cuántos cupos quedan: solo si hay o no.
 * Modos de pago: Stripe automático (con claves), enlace de Stripe con verificación, o preinscripción.
 */
export default function Inscripcion({ eventoId, precio, hayCupo, abierta, modo, enlacePago, correo, estado, boton = 'Reserva tu lugar' }: {
  eventoId: string; precio: string; hayCupo: boolean; abierta: boolean; modo: Modo; enlacePago?: string; correo?: string;
  estado: EstadoUsuario; boton?: string;
}) {
  const [abiertoPanel, setAbiertoPanel] = useState(false);
  const [acepta, setAcepta] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [abrioPago, setAbrioPago] = useState(false);
  const [listo, setListo] = useState<EstadoUsuario | null>(null);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendiente, iniciar] = useTransition();
  const actual = listo ?? estado;

  if (actual === 'pagada') return <p className="evento-estado es-ok"><CheckCircle2 size={20} aria-hidden="true" /> Ya tienes tu cupo en este evento.</p>;
  if (actual === 'verificacion') return <div className="evento-inscripcion">
    <p className="evento-estado es-verificacion"><Clock3 size={20} aria-hidden="true" /> Pago en verificación</p>
    <p className="evento-nota">Recibimos tu aviso de pago y tu cupo queda apartado. Te escribiremos al correo en cuanto confirmemos la compra.</p>
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

  async function avisarPago() {
    const datos = new FormData();
    datos.set('evento', eventoId);
    if (archivo) {
      const listoArchivo = await prepararComprobante(archivo);
      if (listoArchivo.size > 4 * 1024 * 1024) { setMensaje({ ok: false, texto: 'El comprobante pesa más de 4 MB. Sube una captura de pantalla o continúa sin él.' }); return; }
      datos.set('comprobante', listoArchivo);
    }
    ejecutar(() => avisarPagoRealizado(datos), 'verificacion');
  }

  if (!hayCupo || actual === 'espera') return <div className="evento-inscripcion">
    <p className="evento-estado es-agotado"><X size={20} aria-hidden="true" /> Cupos agotados</p>
    {actual === 'espera'
      ? <p className="evento-nota">Estás en la lista de espera. Si se libera un cupo, te escribiremos.</p>
      : <button type="button" className="btn btn-outline" disabled={pendiente} onClick={() => ejecutar(() => unirseListaEspera(eventoId), 'espera')}>{pendiente ? 'Un momento…' : 'Avisarme si se libera un cupo'}</button>}
    {mensaje && !mensaje.ok && <p className="auth-error" role="alert">{mensaje.texto}</p>}
  </div>;

  const politica = <label className="check"><input type="checkbox" checked={acepta} onChange={e => setAcepta(e.target.checked)} /> <span>Acepto la <Link href="/reembolsos" target="_blank">política de reembolsos</Link> y entiendo que es un evento educativo, no asesoría financiera.</span></label>;
  const enlace = enlacePago && `${enlacePago}${enlacePago.includes('?') ? '&' : '?'}${correo ? `prefilled_email=${encodeURIComponent(correo)}` : ''}`;

  return <div className="evento-inscripcion">
    <p className="evento-estado es-disponible"><CheckCircle2 size={20} aria-hidden="true" /> Cupos disponibles</p>
    {actual === 'preinscrita' && modo === 'preinscripcion'
      ? <p className="evento-nota">Ya estás preinscrito. Te enviaremos a tu correo el enlace de pago en cuanto se habilite.</p>
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

          {modo === 'enlace' && enlace && <>
            {politica}
            <ol className="evento-pasos">
              <li>
                <strong>Paga con Stripe.</strong> Se abre una página segura de pago en otra pestaña (tarjeta, Apple Pay o Google Pay).
                <a className={`btn btn-green ${acepta ? '' : 'is-disabled'}`} href={acepta ? enlace : undefined} aria-disabled={!acepta} target="_blank" rel="noopener noreferrer"
                  onClick={e => { if (!acepta) { e.preventDefault(); setMensaje({ ok: false, texto: 'Primero acepta la política de reembolsos.' }); } else { setAbrioPago(true); setMensaje(null); } }}>
                  Pagar {precio} con Stripe <ExternalLink size={18} aria-hidden="true" />
                </a>
              </li>
              <li>
                <strong>Avísanos que ya pagaste.</strong> Si quieres, sube el comprobante (captura o PDF del recibo de Stripe). Tu cupo queda apartado mientras verificamos la compra.
                <label className="evento-archivo">
                  <Upload size={18} aria-hidden="true" />
                  <span>{archivo ? archivo.name : 'Subir comprobante (opcional)'}</span>
                  <input type="file" accept="image/*,application/pdf" onChange={e => setArchivo(e.target.files?.[0] ?? null)} />
                </label>
                <button type="button" className="btn btn-gold" disabled={!acepta || pendiente} onClick={avisarPago}>
                  {pendiente ? 'Enviando…' : 'Ya pagué, confirmar mi cupo'} <CheckCircle2 size={18} aria-hidden="true" />
                </button>
                {!abrioPago && <small className="evento-nota">Usa este botón solo después de completar el pago.</small>}
              </li>
            </ol>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setAbiertoPanel(false)} disabled={pendiente}>Cancelar</button>
          </>}

          {modo === 'preinscripcion' && <>
            <p className="evento-nota"><Clock3 size={16} aria-hidden="true" /> Los pagos se habilitarán muy pronto. Preinscríbete y te enviaremos el enlace de pago a tu correo.</p>
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
