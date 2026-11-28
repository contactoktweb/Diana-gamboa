import 'server-only';
import { getSesion } from '@/lib/sesion';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { enlaceUnirse, partesClave, zoomSdkActivo } from '@/lib/zoom';
import { leerEnlaceClase } from './enlaceClase';
import type { Evento } from './formato';

export type AccesoSala =
  | { ok: true; evento: Evento; anfitriona: boolean; reunion: string; clave: string; nombre: string; correo: string;
      /** «web»: la clase se abre dentro de la web (SDK de Zoom); «enlace»: se abre la aplicación de Zoom. */
      modo: 'web' | 'enlace'; enlace: string }
  | { ok: false; motivo: 'sesion' | 'evento' | 'sin_pago' | 'sin_sala' | 'sin_zoom'; evento?: Evento };

/**
 * ¿Puede esta persona entrar a la sala de clase del evento?
 * Solo quien tiene su cupo pagado (o la administradora, que entra como anfitriona).
 */
export async function accesoSala(slug: string, token?: string): Promise<AccesoSala> {
  const admin = supabaseAdmin();
  const sesion = await getSesion();
  // Enlace personal del correo (solo si no hay sesión iniciada).
  const enlace = !sesion && token ? leerEnlaceClase(token) : null;
  if (!sesion && !enlace) return { ok: false, motivo: 'sesion' };
  if (!admin) return { ok: false, motivo: 'sin_zoom' };
  const { data: evento } = await admin.from('eventos_privados').select('*').eq('slug', slug).maybeSingle<Evento>();
  const anfitriona = sesion?.perfil?.rol === 'admin';
  if (!evento || (!evento.visible && !anfitriona)) return { ok: false, motivo: 'evento' };
  const moderador = sesion?.perfil?.rol === 'moderador';
  let nombre = '';
  let correo = '';
  if (sesion) {
    if (!anfitriona && !moderador) {
      const { data: pago } = await admin.from('inscripciones').select('id').eq('evento_id', evento.id).eq('usuario_id', sesion.id).eq('estado', 'pagada').limit(1).maybeSingle();
      if (!pago) return { ok: false, motivo: 'sin_pago', evento };
    }
    nombre = (sesion.perfil?.nombre || sesion.correo.split('@')[0]).slice(0, 60);
    correo = sesion.correo;
  } else if (enlace) {
    if (enlace.eventoId !== evento.id) return { ok: false, motivo: 'evento' };
    const { data: pago } = await admin.from('inscripciones').select('nombre').eq('evento_id', evento.id).eq('correo', enlace.correo).eq('estado', 'pagada').limit(1).maybeSingle();
    if (!pago) return { ok: false, motivo: 'sin_pago', evento };
    nombre = (String(pago.nombre || '') || enlace.correo.split('@')[0]).slice(0, 60);
    correo = enlace.correo;
  }
  const { data: sala } = await admin.from('eventos_zoom').select('reunion, clave').eq('evento_id', evento.id).maybeSingle();
  if (!sala) return { ok: false, motivo: 'sin_sala', evento };
  const reunion = sala.reunion as string;
  return {
    ok: true, evento, anfitriona, reunion, clave: partesClave(sala.clave as string).codigo,
    nombre: anfitriona ? 'Diana Gamboa' : nombre, correo,
    modo: zoomSdkActivo ? 'web' : 'enlace', enlace: enlaceUnirse(reunion, sala.clave as string),
  };
}

/** ¿El evento ya tiene su sala de Zoom lista? (para mostrar el botón «Entrar a la clase»). */
export async function salaLista(eventoId: string) {
  const admin = supabaseAdmin();
  if (!admin) return false;
  const { data } = await admin.from('eventos_zoom').select('evento_id').eq('evento_id', eventoId).maybeSingle();
  return Boolean(data);
}
