import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Evento } from './formato';

/** Columnas que se pueden mostrar fuera del portal (sin el acceso de los inscritos). */
const COLUMNAS = 'id, slug, titulo, subtitulo, detalles, resumen, contenido, aviso, fecha_tipo, fecha, fecha_fin, fecha_periodo, fecha_mes, fecha_anio, hora_inicio, horario, cupos, inscripcion_abierta, visible, etiqueta, en_lista, solo_lista_espera, lista_de';
export type EventoPublico = Omit<Evento, 'acceso' | 'precio_centavos' | 'recordatorios' | 'enlace_pago' | 'aviso_publico_en' | 'aviso_solo_novedades'>;

/** Eventos visibles para la página pública (cualquier visitante, sin sesión). */
export async function eventosPublicos(slug?: string): Promise<EventoPublico[]> {
  const admin = supabaseAdmin();
  if (!admin) return [];
  let q = admin.from('eventos_privados').select(COLUMNAS).eq('visible', true);
  if (slug) q = q.eq('slug', slug);
  const { data } = await q.order('creado_en', { ascending: false });
  return (data as EventoPublico[] | null) ?? [];
}

/** ¿Quedan cupos? Solo sí o no (nunca cuántos). */
export async function hayCupoPublico(e: EventoPublico) {
  const admin = supabaseAdmin();
  if (!admin || !e.inscripcion_abierta) return false;
  const [{ count: firmes }, { count: pagando }] = await Promise.all([
    admin.from('inscripciones').select('id', { count: 'exact', head: true }).eq('evento_id', e.id).in('estado', ['pagada', 'verificacion']),
    admin.from('inscripciones').select('id', { count: 'exact', head: true }).eq('evento_id', e.id).eq('estado', 'pendiente').gt('expira_en', new Date().toISOString()),
  ]);
  return (firmes ?? 0) + (pagando ?? 0) < e.cupos;
}
