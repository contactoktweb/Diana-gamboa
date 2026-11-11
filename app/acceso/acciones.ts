'use server';

import { correoConfirmacion, correoRecuperacion } from '@/lib/correo/plantillas';
import { SUPABASE_KEY, SUPABASE_URL } from '@/lib/supabase/config';
import { enviarCorreo, envioPropio } from '@/lib/correo/enviar';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { traducirError } from '@/lib/supabase/errores';
import { urlDelSitio } from '@/lib/sitio';

type Resultado = { ok: true; entrar?: boolean } | { ok: false; error: string };

/** ¿Está desactivada la confirmación de correo en Supabase («Confirm email»)? Se consulta cada 5 minutos. */
async function sinConfirmacion() {
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_KEY }, next: { revalidate: 300 } });
    return Boolean((await r.json()).mailer_autoconfirm);
  } catch { return false; }
}
const correoValido = (c: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c) && c.length <= 200;
const destinoSeguro = (d: string) => (d.startsWith('/') && !d.startsWith('//') ? d : '/portal');

/** Registro con correo: crea la cuenta y envía la confirmación con Resend. */
export async function registrar(datos: { nombre: string; correo: string; clave: string; novedades: boolean; next: string }): Promise<Resultado> {
  const admin = supabaseAdmin();
  if (!envioPropio || !admin) return { ok: false, error: 'El registro no está disponible en este momento.' };
  const nombre = datos.nombre.trim().slice(0, 80);
  const correo = datos.correo.trim().toLowerCase();
  if (!nombre || !correoValido(correo)) return { ok: false, error: 'Revisa tu nombre y tu correo.' };
  if (datos.clave.length < 8) return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' };

  const metadatos = { nombre, acepta_terminos: 'true', acepta_novedades: datos.novedades ? 'true' : 'false' };
  const sitio = await urlDelSitio();

  // Sin confirmación de correo: la cuenta queda lista y entra de inmediato (sin enviar correos, para no gastar cuota).
  if (await sinConfirmacion()) {
    const { error } = await admin.auth.admin.createUser({ email: correo, password: datos.clave, email_confirm: true, user_metadata: metadatos });
    if (error) return { ok: false, error: traducirError(/already|registered|exists/i.test(error.message) ? 'already registered' : error.message) };
    return { ok: true, entrar: true };
  }

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'signup', email: correo, password: datos.clave,
    options: { data: metadatos },
  });
  if (error || !data.properties) return { ok: false, error: traducirError(error?.message) };

  const enlace = `${sitio}/auth/confirmar?token_hash=${data.properties.hashed_token}&type=signup&next=${encodeURIComponent(destinoSeguro(datos.next))}`;
  try {
    await enviarCorreo({ para: correo, ...correoConfirmacion({ sitio, nombre, enlace }) });
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  return { ok: true };
}

/** Recuperación de contraseña. Responde lo mismo exista o no la cuenta (por privacidad). */
export async function recuperar(correoIngresado: string): Promise<Resultado> {
  const admin = supabaseAdmin();
  if (!envioPropio || !admin) return { ok: false, error: 'La recuperación no está disponible en este momento.' };
  const correo = correoIngresado.trim().toLowerCase();
  if (!correoValido(correo)) return { ok: false, error: 'Revisa que el correo esté bien escrito.' };

  const { data, error } = await admin.auth.admin.generateLink({ type: 'recovery', email: correo });
  if (error || !data.properties) return { ok: true }; // La cuenta no existe: no se revela.

  const sitio = await urlDelSitio();
  const enlace = `${sitio}/auth/confirmar?token_hash=${data.properties.hashed_token}&type=recovery&next=/nueva-clave`;
  const nombre = String(data.user?.user_metadata?.nombre ?? '').split(' ')[0];
  try {
    await enviarCorreo({ para: correo, ...correoRecuperacion({ sitio, nombre, enlace }) });
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  return { ok: true };
}

/**
 * Cuentas creadas antes de desactivar la confirmación que nunca abrieron el enlace:
 * con la confirmación desactivada, se confirman al intentar entrar (la contraseña se sigue comprobando después).
 */
export async function confirmarPendiente(correoIngresado: string): Promise<Resultado> {
  const admin = supabaseAdmin();
  const correo = correoIngresado.trim().toLowerCase();
  if (!admin || !correoValido(correo) || !(await sinConfirmacion())) return { ok: false, error: '' };
  const { data } = await admin.from('perfiles').select('id').eq('correo', correo).maybeSingle();
  if (!data) return { ok: false, error: '' };
  const { error } = await admin.auth.admin.updateUserById(data.id as string, { email_confirm: true });
  return error ? { ok: false, error: '' } : { ok: true };
}
