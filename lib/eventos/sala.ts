import 'server-only';
import { getSesion } from '@/lib/sesion';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { zoomSdkActivo } from '@/lib/zoom';
import type { Evento } from './formato';

export type AccesoSala =
  | { ok: true; evento: Evento; anfitriona: boolean; reunion: string; clave: string; nombre: string; correo: string }
  | { ok: false; motivo: 'sesion' | 'evento' | 'sin_pago' | 'sin_sala' | 'sin_zoom'; evento?: Evento };

/**
 * ¿Puede esta persona entrar a la sala de clase del evento?
 * Solo quien tiene su cupo pagado (o la administradora, que entra como anfitriona).
 */
export async function accesoSala(slug: string): Promise<AccesoSala> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, motivo: 'sesion' };
  const admin = supabaseAdmin();
  if (!admin) return { ok: false, motivo: 'sin_zoom' };
  const { data: evento } = await admin.from('eventos_privados').select('*').eq('slug', slug).maybeSingle<Evento>();
  const anfitriona = sesion.perfil?.rol === 'admin';
  if (!evento || (!evento.visible && !anfitriona)) return { ok: false, motivo: 'evento' };
  if (!anfitriona) {
    const { data: pago } = await admin.from('inscripciones').select('id').eq('evento_id', evento.id).eq('usuario_id', sesion.id).eq('estado', 'pagada').limit(1).maybeSingle();
    if (!pago) return { ok: false, motivo: 'sin_pago', evento };
  }
  if (!zoomSdkActivo) return { ok: false, motivo: 'sin_zoom', evento };
  const { data: sala } = await admin.from('eventos_zoom').select('reunion, clave').eq('evento_id', evento.id).maybeSingle();
  if (!sala) return { ok: false, motivo: 'sin_sala', evento };
  const nombre = (sesion.perfil?.nombre || sesion.correo.split('@')[0]).slice(0, 60);
  return { ok: true, evento, anfitriona, reunion: sala.reunion as string, clave: sala.clave as string, nombre: anfitriona ? 'Diana Gamboa' : nombre, correo: sesion.correo };
}

/** ¿El evento ya tiene su sala de Zoom lista? (para mostrar el botón «Entrar a la clase»). */
export async function salaLista(eventoId: string) {
  const admin = supabaseAdmin();
  if (!admin || !zoomSdkActivo) return false;
  const { data } = await admin.from('eventos_zoom').select('evento_id').eq('evento_id', eventoId).maybeSingle();
  return Boolean(data);
}
