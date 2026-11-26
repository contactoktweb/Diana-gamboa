import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe';
import { enviarCorreo } from '@/lib/correo/enviar';
import { correoGraciasEvento, correoNuevoCupo } from '@/lib/correo/plantillas';
import { CORREO_ADMINISTRADORA } from '@/lib/administradora';
import { urlDelSitio } from '@/lib/sitio';
import { fechaEvento, horarioCorreo, precioTexto, type Evento } from './formato';

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
  // Teléfono que la persona escribió en Stripe (la administración lo ve con enlace a WhatsApp).
  const telefono = sesion.customer_details?.phone;
  if (nueva && telefono) await admin.from('inscripciones').update({ telefono }).eq('id', inscripcion).is('telefono', null);
  if (nueva) await avisarInscripcion(inscripcion, { admin: true, alumno: true });
  return { pagada: true };
}

/**
 * Correos de una inscripción:
 * - admin: aviso de nuevo cupo (o «por verificar» si la compra espera revisión).
 * - alumno: «gracias por tu confianza» (cuando el pago está aprobado).
 * Un correo que falle (por ejemplo, por la cuota diaria) no deshace la inscripción.
 */
export async function avisarInscripcion(inscripcionId: string, enviar: { admin?: boolean; alumno?: boolean; porVerificar?: boolean }) {
  const admin = supabaseAdmin();
  if (!admin) return null;
  const { data: i } = await admin.from('inscripciones').select('nombre, correo, monto_centavos, evento_id, telefono, correo_pago').eq('id', inscripcionId).maybeSingle();
  if (!i) return null;
  const { data: e } = await admin.from('eventos_privados').select('*').eq('id', i.evento_id).maybeSingle<Evento>();
  if (!e) return null;
  const { count } = await admin.from('inscripciones').select('id', { count: 'exact', head: true }).eq('evento_id', e.id).in('estado', ['pagada', 'verificacion']);
  const sitio = await urlDelSitio();
  const envios: Promise<unknown>[] = [];
  let alumno: Promise<unknown> | null = null;
  if (enviar.admin) envios.push(enviarCorreo({
    para: CORREO_ADMINISTRADORA,
    ...correoNuevoCupo({ sitio, evento: e.titulo, nombre: i.nombre, correo: i.correo, monto: precioTexto(i.monto_centavos ?? e.precio_centavos), ocupados: count ?? 0, cupos: e.cupos, enlace: `${sitio}/admin/eventos/${e.id}`, porVerificar: enviar.porVerificar, telefono: i.telefono, correoPago: i.correo_pago }),
  }));
  if (enviar.alumno) envios.push(alumno = enviarCorreo({
    para: i.correo,
    ...correoGraciasEvento({ sitio, nombre: primerNombre(i.nombre || ''), evento: e.titulo, fecha: fechaEvento(e), ...horarioCorreo(e), enlace: `${sitio}/portal/eventos/${e.slug}` }),
  }));
  const resultados = await Promise.allSettled(envios);
  for (const r of resultados) if (r.status === 'rejected') console.error('Correo de evento no enviado:', r.reason);
  // ¿Le llegó el correo a la persona? (para mostrarlo en la administración)
  return alumno ? resultados[envios.indexOf(alumno)]?.status === 'fulfilled' : null;
}

/**
 * Cupos aprobados desde la administración para un correo que aún no tenía cuenta:
 * cuando la persona entra a la web con ese correo, se le asignan a su cuenta.
 */
export async function vincularPorCorreo(usuarioId: string, correo: string) {
  const admin = supabaseAdmin();
  if (!admin || !correo) return 0;
  const { data: sueltas } = await admin.from('inscripciones').select('id, evento_id')
    .eq('correo', correo.toLowerCase()).is('usuario_id', null).in('estado', ['pagada', 'verificacion']);
  for (const fila of sueltas ?? []) {
    // Si tenía una preinscripción o lista de espera en ese evento, la reemplaza el cupo aprobado.
    await admin.from('inscripciones').update({ estado: 'cancelada', actualizado_en: new Date().toISOString() })
      .eq('evento_id', fila.evento_id).eq('usuario_id', usuarioId).in('estado', ['pendiente', 'preinscrita', 'espera']);
    await admin.from('inscripciones').update({ usuario_id: usuarioId, actualizado_en: new Date().toISOString() }).eq('id', fila.id);
  }
  return sueltas?.length ?? 0;
}

/** «MARIA DEL ROSARIO NIEVES» → «Maria»; «(sin nombre)» → «». */
export function primerNombre(nombre: string) {
  const p = nombre.replace(/\(.*?\)/g, '').trim().split(/\s+/)[0] ?? '';
  return p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : '';
}
