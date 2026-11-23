import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Evento } from './formato';

export const MENSAJE_PRIORIDAD = 'Por ahora este grupo está abierto solo para las personas que quedaron en la lista de espera del grupo anterior. Muy pronto se abrirá para todos: te avisaremos por correo.';

/** ¿Esta persona quedó en la lista de espera del evento indicado? (por su cuenta o por su correo). */
export async function enListaDeEspera(eventoListaId: string, usuarioId: string, correo: string) {
  const admin = supabaseAdmin();
  if (!admin) return false;
  const [porCuenta, porCorreo] = await Promise.all([
    admin.from('inscripciones').select('id').eq('evento_id', eventoListaId).eq('estado', 'espera').eq('usuario_id', usuarioId).limit(1),
    admin.from('inscripciones').select('id').eq('evento_id', eventoListaId).eq('estado', 'espera').eq('correo', correo.toLowerCase()).limit(1),
  ]);
  return Boolean(porCuenta.data?.length || porCorreo.data?.length);
}

/**
 * true si el evento está en su etapa de prioridad (solo lista de espera) y esta persona no puede comprar todavía.
 * La administradora siempre puede (para probar el pago).
 */
export async function sinPrioridad(e: Pick<Evento, 'solo_lista_espera' | 'lista_de'>, usuarioId: string, correo: string, esAdmin = false) {
  if (!e.solo_lista_espera || !e.lista_de || esAdmin) return false;
  return !(await enListaDeEspera(e.lista_de, usuarioId, correo));
}
