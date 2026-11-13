import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe';
import { enviarCorreo } from '@/lib/correo/enviar';
import { correoGraciasEvento, correoNuevoCupo } from '@/lib/correo/plantillas';
import { CORREO_ADMINISTRADORA } from '@/lib/administradora';
import { urlDelSitio } from '@/lib/sitio';
import { fechaEvento, precioTexto, type Evento } from './formato';

/**
 * Revisa una sesión de pago de Stripe y, si está pagada, inscribe a la persona.
 * La usan el webhook de Stripe y la página de regreso del pago (lo que llegue primero).
 * Los correos se envían una sola vez.
 */
export async function procesarSesionPagada(sessionId: string) {
  const s = stripe();
  const admin = supabaseAdmin();
  if (!s || !admin) return { pagada: false };
  const sesion = await s.checkout.sessions.retrieve(sessionId);
  const inscripcion = sesion.metadata?.inscripcion;
  if (!inscripcion || sesion.payment_status !== 'paid') return { pagada: false };

  const pago = typeof sesion.payment_intent === 'string' ? sesion.payment_intent : sesion.payment_intent?.id ?? null;
  const { data: nueva, error } = await admin.rpc('confirmar_pago', { p_inscripcion: inscripcion, p_session: sesion.id, p_pago: pago, p_monto: sesion.amount_total });
  if (error) throw new Error('No se pudo registrar el pago: ' + error.message);
  if (nueva) await avisarInscripcion(inscripcion, { admin: true, alumno: true });
  return { pagada: true };
}

/**
 * Correos de una inscripción:
 * - admin: aviso de nuevo cupo (o «por verificar» si la compra espera revisión).
 * - alumno: agradecimiento por su participación (cuando el pago está aprobado).
 * Un correo que falle (por ejemplo, por la cuota diaria) no deshace la inscripción.
 */
export async function avisarInscripcion(inscripcionId: string, enviar: { admin?: boolean; alumno?: boolean; porVerificar?: boolean }) {
  const admin = supabaseAdmin();
  if (!admin) return;
  const { data: i } = await admin.from('inscripciones').select('nombre, correo, monto_centavos, evento_id').eq('id', inscripcionId).maybeSingle();
  if (!i) return;
  const { data: e } = await admin.from('eventos_privados').select('*').eq('id', i.evento_id).maybeSingle<Evento>();
  if (!e) return;
  const { count } = await admin.from('inscripciones').select('id', { count: 'exact', head: true }).eq('evento_id', e.id).in('estado', ['pagada', 'verificacion']);
  const sitio = await urlDelSitio();
  const envios: Promise<unknown>[] = [];
  if (enviar.admin) envios.push(enviarCorreo({
    para: CORREO_ADMINISTRADORA,
    ...correoNuevoCupo({ sitio, evento: e.titulo, nombre: i.nombre, correo: i.correo, monto: precioTexto(i.monto_centavos ?? e.precio_centavos), ocupados: count ?? 0, cupos: e.cupos, enlace: `${sitio}/admin/eventos/${e.id}`, porVerificar: enviar.porVerificar }),
  }));
  if (enviar.alumno) envios.push(enviarCorreo({
    para: i.correo,
    ...correoGraciasEvento({ sitio, nombre: (i.nombre || '').split(' ')[0], evento: e.titulo, fecha: fechaEvento(e), horario: e.horario, enlace: `${sitio}/portal/eventos/${e.slug}` }),
  }));
  for (const r of await Promise.allSettled(envios)) if (r.status === 'rejected') console.error('Correo de evento no enviado:', r.reason);
}
