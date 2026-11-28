import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { enviarCorreosLote, envioPropio } from '@/lib/correo/enviar';
import { correoBienvenidaTaller, correoRecordatorio } from '@/lib/correo/plantillas';
import { CORREO_ADMINISTRADORA } from '@/lib/administradora';
import { primerNombre } from './pago';
import { diaEnZona, diaLargo, diasEvento, fechaEvento, horarioCorreo, inicioDelDia, type Evento } from './formato';
import { crearEnlaceClase } from './enlaceClase';

const ZONA = 'America/New_York';

export interface Recordatorio {
  clave: string;
  tipo: 'bienvenida' | 'vispera' | 'hoy';
  titulo: string;
  /** Día de clase al que se refiere (YYYY-MM-DD). */
  dia: string;
  numeroDia: number;
  /** Día (hora de Nueva York) en que sale solo; null = solo manual. */
  envio: string | null;
  /** Después de este instante ya no se envía solo (la clase ya empezó). */
  limite: string | null;
}

const restarDia = (f: string) => new Date(Date.parse(f + 'T00:00:00Z') - 86400000).toISOString().slice(0, 10);

/**
 * Correos programados de un evento con fecha exacta:
 * bienvenida (manual), víspera (un día antes del primer día) y «hoy» (cada día de clase, en la mañana).
 */
export function planRecordatorios(e: Evento): Recordatorio[] {
  const dias = diasEvento(e);
  if (!dias.length) return [];
  const varios = dias.length > 1;
  return [
    { clave: 'bienvenida', tipo: 'bienvenida', titulo: 'Bienvenida y gracias por tu confianza (manual)', dia: dias[0], numeroDia: 1, envio: null, limite: null },
    { clave: 'vispera', tipo: 'vispera', titulo: 'Recordatorio un día antes', dia: dias[0], numeroDia: 1, envio: restarDia(dias[0]), limite: inicioDelDia(e, dias[0]) },
    ...dias.map((d, i) => ({ clave: `hoy-${d}`, tipo: 'hoy' as const, titulo: varios ? `Recordatorio del día de clase ${i + 1}` : 'Recordatorio el día de la clase', dia: d, numeroDia: i + 1, envio: d, limite: inicioDelDia(e, d) })),
  ];
}

/** Personas con su cupo pagado (un correo por persona). */
async function inscritos(admin: SupabaseClient, eventoId: string) {
  const { data } = await admin.from('inscripciones').select('correo, nombre').eq('evento_id', eventoId).eq('estado', 'pagada');
  const vistos = new Map<string, string>();
  for (const f of data ?? []) {
    const correo = String(f.correo ?? '').trim().toLowerCase();
    if (correo && !vistos.has(correo)) vistos.set(correo, String(f.nombre ?? ''));
  }
  return [...vistos].map(([correo, nombre]) => ({ correo, nombre }));
}

/** Enlace «Entrar a la clase»: personal (entra sin iniciar sesión) y válido hasta el día siguiente a la última clase. */
function enlaceSala(e: Evento, sitio: string, correo?: string) {
  const ultimo = diasEvento(e).at(-1);
  const token = correo && ultimo ? crearEnlaceClase(e.id, correo, Date.parse(ultimo + 'T23:59:59Z') + 86400000) : '';
  return token ? `${sitio}/clase/${token}` : `${sitio}/portal/eventos/${e.slug}/sala`;
}

function armar(e: Evento, r: Recordatorio, sitio: string, nombre: string, correo?: string) {
  const { hora, horas } = horarioCorreo(e.hora_inicio && r.tipo === 'hoy' ? { ...e, hora_inicio: inicioDelDia(e, r.dia) } : e);
  if (r.tipo === 'bienvenida') {
    return correoBienvenidaTaller({ sitio, nombre, evento: e.titulo, fechas: fechaEvento(e), hora, horas, enlacePortal: `${sitio}/portal/eventos/${e.slug}` });
  }
  return correoRecordatorio({
    sitio, nombre, evento: e.titulo, tipo: r.tipo, dia: diaLargo(r.dia), numeroDia: r.numeroDia, totalDias: diasEvento(e).length,
    hora, horas, enlaceSala: enlaceSala(e, sitio, correo),
  });
}

/**
 * Envía un correo programado. Con «prueba», solo a la administradora (no queda registrado).
 * Devuelve cuántos salieron y a quiénes no se pudo enviar.
 */
export async function enviarRecordatorio(e: Evento, r: Recordatorio, sitio: string, opciones: { prueba?: boolean; manual?: boolean } = {}) {
  const admin = supabaseAdmin();
  if (!admin || !envioPropio) return { enviados: 0, fallidos: [] as string[], total: 0, detalle: '', error: 'Falta configurar Resend o la clave secreta de Supabase.' };
  const lista = opciones.prueba ? [{ correo: CORREO_ADMINISTRADORA, nombre: 'Diana' }] : await inscritos(admin, e.id);
  if (!lista.length) return { enviados: 0, fallidos: [], total: 0, detalle: '', error: 'Todavía no hay inscritos con el pago aprobado.' };
  const correos = lista.map(p => {
    const c = armar(e, r, sitio, primerNombre(p.nombre), opciones.prueba ? undefined : p.correo);
    return { para: p.correo, ...c, asunto: opciones.prueba ? `[Prueba] ${c.asunto}` : c.asunto };
  });
  const res = await enviarCorreosLote(correos);
  // Un envío manual que no salió no se registra: así el automático de ese día sigue programado.
  if (!opciones.prueba && (res.enviados || !opciones.manual)) {
    await admin.from('recordatorios_enviados').upsert({
      evento_id: e.id, clave: r.clave, enviados: res.enviados, fallidos: res.fallidos.length,
      manual: Boolean(opciones.manual), creado_en: new Date().toISOString(),
    });
  }
  return { ...res, total: lista.length, error: '' };
}

/**
 * Lo ejecuta la tarea programada (Vercel Cron) cada mañana: envía los recordatorios
 * que tocan hoy (hora de Nueva York), una sola vez cada uno y nunca después de que empezó la clase.
 */
export async function ejecutarRecordatorios(sitio: string, ahora = new Date()) {
  const admin = supabaseAdmin();
  if (!admin || !envioPropio) return { ok: false, motivo: 'Falta configurar Resend o la clave secreta de Supabase.', enviados: [] };
  const hoy = diaEnZona(ahora, ZONA);
  const { data: eventos } = await admin.from('eventos_privados').select('*')
    .eq('visible', true).eq('recordatorios', true).eq('fecha_tipo', 'exacta').gte('fecha', new Date(ahora.getTime() - 40 * 86400000).toISOString().slice(0, 10)).returns<Evento[]>();
  const resultado: { evento: string; clave: string; enviados: number; fallidos: number }[] = [];
  for (const e of eventos ?? []) {
    for (const r of planRecordatorios(e)) {
      if (r.envio !== hoy) continue;
      if (r.limite && ahora.getTime() >= Date.parse(r.limite)) continue;
      // Se aparta primero: si la tarea corre dos veces, el segundo intento no vuelve a enviar.
      const { error } = await admin.from('recordatorios_enviados').insert({ evento_id: e.id, clave: r.clave });
      if (error) continue;
      const res = await enviarRecordatorio(e, r, sitio);
      resultado.push({ evento: e.slug, clave: r.clave, enviados: res.enviados, fallidos: res.fallidos.length });
    }
  }
  return { ok: true, hoy, enviados: resultado };
}
