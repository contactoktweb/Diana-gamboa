'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { supabaseServidor, ETIQUETA_CONTENIDO } from '@/lib/supabase/servidor';
import { seccionPorId } from '@/lib/contenido/esquema';
import { PREDETERMINADO, type NombreSeccion } from '@/lib/contenido/predeterminado';
import { getSesion } from '@/lib/sesion';

type Resultado = { ok: true } | { ok: false; error: string };

async function clienteAdmin() {
  const supabase = await supabaseServidor();
  if (!supabase) return { error: 'Supabase no está configurado.' } as const;
  const sesion = await getSesion();
  if (sesion?.perfil?.rol !== 'admin') return { error: 'Tu sesión expiró o no tienes permiso. Vuelve a iniciar sesión.' } as const;
  return { supabase } as const;
}

/** Hace visibles los cambios en la web de inmediato. */
function publicar() {
  updateTag(ETIQUETA_CONTENIDO);
  revalidatePath('/', 'layout');
}

/** Guarda una sección completa del contenido. */
export async function guardarSeccion(seccion: string, datos: Record<string, unknown>): Promise<Resultado> {
  if (!seccionPorId(seccion)) return { ok: false, error: 'Sección desconocida.' };
  const c = await clienteAdmin();
  if ('error' in c) return { ok: false, error: c.error! };
  // Solo se guardan los campos que existen en el contenido original.
  const base = PREDETERMINADO[seccion as NombreSeccion] as Record<string, unknown>;
  const limpio = Object.fromEntries(Object.entries(datos).filter(([k]) => k in base));
  const { error } = await c.supabase.from('contenido').upsert({ seccion, datos: limpio }, { onConflict: 'seccion' });
  if (error) return { ok: false, error: 'No se pudo guardar: ' + error.message };
  publicar();
  return { ok: true };
}

/** Vuelve a una versión anterior guardada en el historial. */
export async function restaurarVersion(seccion: string, idHistorial: number): Promise<Resultado> {
  const c = await clienteAdmin();
  if ('error' in c) return { ok: false, error: c.error! };
  const { data, error } = await c.supabase.from('contenido_historial').select('datos').eq('id', idHistorial).eq('seccion', seccion).maybeSingle();
  if (error || !data) return { ok: false, error: 'No se encontró esa versión.' };
  const r = await c.supabase.from('contenido').upsert({ seccion, datos: data.datos }, { onConflict: 'seccion' });
  if (r.error) return { ok: false, error: r.error.message };
  publicar();
  return { ok: true };
}

/** Elimina lo guardado en una sección: la web vuelve a mostrar el contenido original. */
export async function restablecerOriginal(seccion: string): Promise<Resultado> {
  const c = await clienteAdmin();
  if ('error' in c) return { ok: false, error: c.error! };
  const { error } = await c.supabase.from('contenido').delete().eq('seccion', seccion);
  if (error) return { ok: false, error: error.message };
  publicar();
  return { ok: true };
}

export async function cambiarRol(usuario: string, rol: 'alumno' | 'admin'): Promise<Resultado> {
  const c = await clienteAdmin();
  if ('error' in c) return { ok: false, error: c.error! };
  const { error } = await c.supabase.rpc('admin_cambiar_rol', { p_usuario: usuario, p_rol: rol });
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/alumnos');
  return { ok: true };
}

export async function eliminarUsuario(usuario: string): Promise<Resultado> {
  const c = await clienteAdmin();
  if ('error' in c) return { ok: false, error: c.error! };
  const { error } = await c.supabase.rpc('admin_eliminar_usuario', { p_usuario: usuario });
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/alumnos');
  return { ok: true };
}
