import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { enviarCorreosLote, envioPropio } from '@/lib/correo/enviar';
import { correoListaEspera, correoNuevoGrupo } from '@/lib/correo/plantillas';
import { CORREO_ADMINISTRADORA } from '@/lib/administradora';
import { primerNombre } from './pago';
import { fechaEvento, horarioCorreo, type Evento } from './formato';

export type TipoAviso = 'lista_espera' | 'nuevo_grupo';

/** Máximo de correos por envío (se puede cambiar con LIMITE_AVISOS_DIA). */
export const LIMITE_AVISOS = Math.max(1, Number(process.env.LIMITE_AVISOS_DIA) || 1000);

type Persona = { correo: string; nombre: string };
const limpio = (c: unknown) => String(c ?? '').trim().toLowerCase();

async function todas<T>(consulta: (desde: number, hasta: number) => PromiseLike<{ data: T[] | null }>) {
  const filas: T[] = [];
  for (let desde = 0; ; desde += 1000) {
    const { data } = await consulta(desde, desde + 999);
    filas.push(...(data ?? []));
    if (!data || data.length < 1000) return filas;
  }
}

/** Correos que ya tienen (o están pagando) un cupo en alguno de estos eventos. */
async function conCupo(admin: SupabaseClient, eventos: string[]) {
  const filas = await todas<{ correo: string }>((a, b) => admin.from('inscripciones').select('correo').in('evento_id', eventos).in('estado', ['pagada', 'verificacion']).range(a, b));
  return new Set(filas.map(f => limpio(f.correo)));
}

async function listaDeEspera(admin: SupabaseClient, eventoLista: string) {
  return todas<{ correo: string; nombre: string }>((a, b) => admin.from('inscripciones').select('correo, nombre').eq('evento_id', eventoLista).eq('estado', 'espera').range(a, b));
}

/** Destinatarios de cada aviso, sin repetidos y sin quienes ya tienen cupo. */
export async function destinatarios(e: Evento, tipo: TipoAviso): Promise<Persona[]> {
  const admin = supabaseAdmin();
  if (!admin || !e.lista_de && tipo === 'lista_espera') return [];
  const excluir = await conCupo(admin, [e.id, ...(e.lista_de ? [e.lista_de] : [])]);
  let filas: { correo: string; nombre: string }[];
  if (tipo === 'lista_espera') filas = await listaDeEspera(admin, e.lista_de!);
  else {
    // A todos los alumnos, menos la lista de espera (ya recibió su correo) y quienes ya tienen cupo.
    const espera = e.lista_de ? new Set((await listaDeEspera(admin, e.lista_de)).map(f => limpio(f.correo))) : new Set<string>();
    const perfiles = await todas<{ correo: string; nombre: string; acepta_novedades: boolean }>((a, b) => {
      let q = admin.from('perfiles').select('correo, nombre, acepta_novedades').neq('rol', 'admin');
      if (e.aviso_solo_novedades) q = q.eq('acepta_novedades', true);
      return q.range(a, b);
    });
    filas = perfiles.filter(p => !espera.has(limpio(p.correo)));
  }
  const vistos = new Map<string, string>();
  for (const f of filas) {
    const c = limpio(f.correo);
    if (c && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c) && !excluir.has(c) && !vistos.has(c)) vistos.set(c, String(f.nombre ?? ''));
  }
  return [...vistos].map(([correo, nombre]) => ({ correo, nombre }));
}

/** Cuántos ya recibieron el aviso y cuántos faltan. */
export async function estadoAviso(e: Evento, tipo: TipoAviso) {
  const admin = supabaseAdmin();
  if (!admin) return { enviados: 0, pendientes: 0 };
  const ya = await todas<{ correo: string }>((a, b) => admin.from('avisos_enviados').select('correo').eq('evento_id', e.id).eq('tipo', tipo).range(a, b));
  const hechos = new Set(ya.map(f => f.correo));
  const lista = await destinatarios(e, tipo);
  return { enviados: hechos.size, pendientes: lista.filter(p => !hechos.has(p.correo)).length };
}

function armar(e: Evento, tipo: TipoAviso, sitio: string, nombre: string) {
  const fechas = fechaEvento(e);
  const enlace = `${sitio}/portal/eventos/${e.slug}`;
  if (tipo === 'lista_espera') return correoListaEspera({ sitio, nombre, evento: e.titulo, fechas: fechas.charAt(0).toLowerCase() + fechas.slice(1), enlace });
  return correoNuevoGrupo({ sitio, nombre, evento: e.titulo, fechas, hora: horarioCorreo(e).hora, enlace });
}

/**
 * Envía el aviso a quienes aún no lo recibieron (hasta LIMITE_AVISOS por vez).
 * Cada persona lo recibe una sola vez: se puede pulsar de nuevo para seguir con los que faltan.
 * Con «prueba», solo a la administradora (no cuenta).
 */
export async function enviarAviso(e: Evento, tipo: TipoAviso, sitio: string, prueba = false) {
  const admin = supabaseAdmin();
  if (!admin || !envioPropio) return { enviados: 0, fallidos: [] as string[], pendientes: 0, detalle: '', error: 'Falta configurar Resend o la clave secreta de Supabase.' };
  if (prueba) {
    const c = armar(e, tipo, sitio, 'Diana');
    const r = await enviarCorreosLote([{ para: CORREO_ADMINISTRADORA, ...c, asunto: `[Prueba] ${c.asunto}` }]);
    return { ...r, pendientes: 0, error: '' };
  }
  const ya = await todas<{ correo: string }>((a, b) => admin.from('avisos_enviados').select('correo').eq('evento_id', e.id).eq('tipo', tipo).range(a, b));
  const hechos = new Set(ya.map(f => f.correo));
  const faltan = (await destinatarios(e, tipo)).filter(p => !hechos.has(p.correo));
  const lote = faltan.slice(0, LIMITE_AVISOS);
  if (!lote.length) return { enviados: 0, fallidos: [], pendientes: 0, detalle: '', error: '' };
  const r = await enviarCorreosLote(lote.map(p => ({ para: p.correo, ...armar(e, tipo, sitio, primerNombre(p.nombre)) })));
  const fallidos = new Set(r.fallidos);
  const ok = lote.filter(p => !fallidos.has(p.correo)).map(p => ({ evento_id: e.id, tipo, correo: p.correo }));
  if (ok.length) await admin.from('avisos_enviados').upsert(ok, { ignoreDuplicates: true });
  return { enviados: r.enviados, fallidos: r.fallidos, pendientes: faltan.length - ok.length, detalle: r.detalle, error: '' };
}

/** La tarea diaria sigue enviando el aviso del nuevo grupo a quienes falten (si quedó alguno pendiente). */
export async function continuarAvisos(sitio: string) {
  const admin = supabaseAdmin();
  if (!admin || !envioPropio) return [];
  const { data: eventos } = await admin.from('eventos_privados').select('*').eq('visible', true).not('aviso_publico_en', 'is', null).returns<Evento[]>();
  const hechos: { evento: string; enviados: number; pendientes: number }[] = [];
  for (const e of eventos ?? []) {
    const r = await enviarAviso(e, 'nuevo_grupo', sitio);
    if (r.enviados || r.fallidos.length) hechos.push({ evento: e.slug, enviados: r.enviados, pendientes: r.pendientes });
  }
  return hechos;
}
