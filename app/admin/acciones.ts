'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { supabaseServidor, ETIQUETA_CONTENIDO } from '@/lib/supabase/servidor';
import { seccionPorId } from '@/lib/contenido/esquema';
import { PREDETERMINADO, type NombreSeccion } from '@/lib/contenido/predeterminado';
import { getSesion } from '@/lib/sesion';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { correoProvisional } from '@/lib/correo/plantillas';
import { enviarCorreo, envioPropio } from '@/lib/correo/enviar';
import { urlDelSitio } from '@/lib/sitio';

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

/** Contraseña provisional fácil de dictar: sin letras ni números que se confundan. */
function claveProvisional() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const azar = crypto.getRandomValues(new Uint32Array(10));
  return Array.from(azar, n => letras[n % letras.length]).join('');
}

/** Crea la cuenta de un alumno con una contraseña provisional y se la envía por correo. */
export async function crearAlumnoProvisional(nombreIngresado: string, correoIngresado: string): Promise<Resultado> {
  const c = await clienteAdmin();
  if ('error' in c) return { ok: false, error: c.error! };
  const admin = supabaseAdmin();
  if (!envioPropio || !admin) return { ok: false, error: 'Falta configurar Resend y la clave secreta de Supabase en Vercel.' };
  const nombre = nombreIngresado.trim().slice(0, 80);
  const correo = correoIngresado.trim().toLowerCase();
  if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) return { ok: false, error: 'Revisa el nombre y el correo.' };

  const clave = claveProvisional();
  const { error } = await admin.auth.admin.createUser({ email: correo, password: clave, email_confirm: true, user_metadata: { nombre, debe_cambiar_clave: true } });
  if (error) return { ok: false, error: /already|registered|exists/i.test(error.message) ? 'Ya existe una cuenta con ese correo.' : 'No se pudo crear la cuenta: ' + error.message };
  try {
    const sitio = await urlDelSitio();
    await enviarCorreo({ para: correo, ...correoProvisional({ sitio, nombre: nombre.split(' ')[0], correo, clave }) });
  } catch (e) {
    return { ok: false, error: `La cuenta se creó, pero el correo no se pudo enviar (${(e as Error).message}). Pide al alumno que use «¿Olvidaste tu contraseña?».` };
  }
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
