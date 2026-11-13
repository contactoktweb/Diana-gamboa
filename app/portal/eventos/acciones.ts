'use server';

import { revalidatePath } from 'next/cache';
import { getSesion } from '@/lib/sesion';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe';
import { urlDelSitio } from '@/lib/sitio';
import { fechaEvento, type Evento } from '@/lib/eventos/formato';
import { avisarInscripcion } from '@/lib/eventos/pago';

type Resultado =
  | { ok: true; url: string }
  | { ok: true; aviso: string }
  | { ok: false; error: string; agotado?: boolean };

/** Minutos que el cupo queda apartado mientras la persona paga (Stripe exige al menos 30). */
const MINUTOS_PAGO = 30;

async function datos(eventoId: string) {
  const sesion = await getSesion();
  const admin = supabaseAdmin();
  if (!sesion || !admin) return null;
  const { data: evento } = await admin.from('eventos_privados').select('*').eq('id', eventoId).eq('visible', true).maybeSingle<Evento>();
  if (!evento) return null;
  const nombre = sesion.perfil?.nombre || sesion.correo.split('@')[0];
  return { sesion, admin, evento, nombre };
}

/**
 * «Reserva tu lugar». Con Stripe activo, aparta el cupo y devuelve la página de pago.
 * Sin Stripe, guarda una preinscripción para enviar después el enlace de pago.
 */
export async function iniciarInscripcion(eventoId: string): Promise<Resultado> {
  const d = await datos(eventoId);
  if (!d) return { ok: false, error: 'Inicia sesión de nuevo para inscribirte.' };
  const { sesion, admin, evento, nombre } = d;
  const s = stripe();

  if (!s) {
    const { data: actual } = await admin.from('inscripciones').select('estado').eq('evento_id', evento.id).eq('usuario_id', sesion.id).in('estado', ['pagada', 'preinscrita']).maybeSingle();
    if (actual?.estado === 'pagada') return { ok: false, error: 'Ya estás inscrito en este evento.' };
    if (!actual) {
      await admin.from('inscripciones').update({ estado: 'cancelada' }).eq('evento_id', evento.id).eq('usuario_id', sesion.id).eq('estado', 'espera');
      const { error } = await admin.from('inscripciones').insert({ evento_id: evento.id, usuario_id: sesion.id, nombre, correo: sesion.correo, estado: 'preinscrita' });
      if (error) return { ok: false, error: 'No se pudo guardar tu preinscripción. Inténtalo de nuevo.' };
    }
    revalidatePath(`/portal/eventos/${evento.slug}`);
    return { ok: true, aviso: 'Listo, quedaste preinscrito. Te enviaremos a tu correo el enlace de pago en cuanto se habilite.' };
  }

  const { data, error } = await admin.rpc('reservar_cupo', { p_evento: evento.id, p_usuario: sesion.id, p_nombre: nombre, p_correo: sesion.correo, p_minutos: MINUTOS_PAGO + 5 });
  const r = (data as { resultado: string; inscripcion: string | null }[] | null)?.[0];
  if (error || !r) return { ok: false, error: 'No se pudo apartar tu cupo. Inténtalo de nuevo.' };
  if (r.resultado === 'ya_inscrito') return { ok: false, error: 'Ya estás inscrito en este evento.' };
  if (r.resultado === 'agotado') return { ok: false, agotado: true, error: 'Los cupos se agotaron.' };
  if (r.resultado !== 'ok' || !r.inscripcion) return { ok: false, error: 'Las inscripciones de este evento están cerradas.' };

  const sitio = await urlDelSitio();
  const volver = `${sitio}/portal/eventos/${evento.slug}`;
  try {
    const pago = await s.checkout.sessions.create({
      mode: 'payment',
      locale: 'es',
      customer_email: sesion.correo,
      client_reference_id: r.inscripcion,
      line_items: [{
        quantity: 1,
        price_data: { currency: 'usd', unit_amount: evento.precio_centavos, product_data: { name: evento.titulo, description: fechaEvento(evento) } },
      }],
      metadata: { inscripcion: r.inscripcion, evento: evento.id },
      payment_intent_data: { metadata: { inscripcion: r.inscripcion, evento: evento.id }, description: evento.titulo },
      expires_at: Math.floor(Date.now() / 1000) + MINUTOS_PAGO * 60 + 60,
      success_url: `${volver}?pago=ok&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${volver}?pago=cancelado`,
    });
    await admin.from('inscripciones').update({ stripe_session_id: pago.id }).eq('id', r.inscripcion);
    return { ok: true, url: pago.url! };
  } catch (e) {
    // Si Stripe falla, el cupo apartado se libera de inmediato.
    await admin.from('inscripciones').update({ estado: 'cancelada' }).eq('id', r.inscripcion);
    console.error('Stripe no creó la página de pago', e);
    return { ok: false, error: 'No se pudo abrir la página de pago. Inténtalo de nuevo en unos minutos.' };
  }
}

const TIPOS_COMPROBANTE: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/heic': 'heic', 'application/pdf': 'pdf' };

/**
 * Pago por enlace de Stripe (provisional): la persona avisa que ya pagó y puede subir su comprobante.
 * La compra queda «en verificación» (aparta el cupo) hasta que la administración la aprueba.
 */
export async function avisarPagoRealizado(datosFormulario: FormData): Promise<Resultado> {
  const d = await datos(String(datosFormulario.get('evento') ?? ''));
  if (!d) return { ok: false, error: 'Inicia sesión de nuevo.' };
  const { sesion, admin, evento, nombre } = d;
  if (!evento.enlace_pago) return { ok: false, error: 'Este evento no tiene enlace de pago.' };

  let ruta = '';
  const archivo = datosFormulario.get('comprobante');
  if (archivo instanceof File && archivo.size > 0) {
    const ext = TIPOS_COMPROBANTE[archivo.type];
    if (!ext) return { ok: false, error: 'El comprobante debe ser una imagen (JPG, PNG) o un PDF.' };
    if (archivo.size > 10 * 1024 * 1024) return { ok: false, error: 'El comprobante pesa más de 10 MB.' };
    ruta = `${evento.id}/${sesion.id}-${Date.now()}.${ext}`;
    const { error } = await admin.storage.from('comprobantes').upload(ruta, archivo, { contentType: archivo.type });
    if (error) return { ok: false, error: 'No se pudo subir el comprobante. Inténtalo de nuevo o continúa sin él.' };
  }

  const { data, error } = await admin.rpc('registrar_verificacion', { p_evento: evento.id, p_usuario: sesion.id, p_nombre: nombre, p_correo: sesion.correo, p_comprobante: ruta });
  const r = (data as { resultado: string; inscripcion: string | null }[] | null)?.[0];
  if (error || !r) return { ok: false, error: 'No se pudo registrar tu pago. Inténtalo de nuevo.' };
  if (r.resultado === 'ya_inscrito') return { ok: false, error: 'Ya tienes tu cupo o tu pago ya está en verificación.' };
  if (r.resultado === 'agotado') return { ok: false, agotado: true, error: 'Los cupos se agotaron. Si ya pagaste, escríbenos a hola@dianagamboa.com y te devolvemos el dinero completo.' };
  if (r.resultado !== 'ok' || !r.inscripcion) return { ok: false, error: 'Las inscripciones de este evento están cerradas.' };

  await avisarInscripcion(r.inscripcion, { admin: true, porVerificar: true });
  revalidatePath(`/portal/eventos/${evento.slug}`);
  return { ok: true, aviso: 'Recibimos tu aviso de pago. Tu cupo queda apartado mientras verificamos la compra; te escribiremos al confirmarla.' };
}

/** Con los cupos agotados: guarda a la persona en la lista de espera. */
export async function unirseListaEspera(eventoId: string): Promise<Resultado> {
  const d = await datos(eventoId);
  if (!d) return { ok: false, error: 'Inicia sesión de nuevo.' };
  const { sesion, admin, evento, nombre } = d;
  const { data: actual } = await admin.from('inscripciones').select('estado').eq('evento_id', evento.id).eq('usuario_id', sesion.id).in('estado', ['pagada', 'verificacion', 'pendiente', 'preinscrita', 'espera']).maybeSingle();
  if (actual?.estado === 'pagada') return { ok: false, error: 'Ya estás inscrito en este evento.' };
  if (!actual) {
    const { error } = await admin.from('inscripciones').insert({ evento_id: evento.id, usuario_id: sesion.id, nombre, correo: sesion.correo, estado: 'espera' });
    if (error) return { ok: false, error: 'No se pudo guardar tu lugar en la lista de espera.' };
  }
  revalidatePath(`/portal/eventos/${evento.slug}`);
  return { ok: true, aviso: 'Estás en la lista de espera. Si se libera un cupo, te escribiremos.' };
}
