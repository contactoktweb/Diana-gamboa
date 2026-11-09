import { NextResponse } from 'next/server';
import { CORREO_ADMINISTRADORA, NOMBRE_ADMINISTRADORA } from '@/lib/administradora';
import { correoInvitacionAdmin } from '@/lib/correo/plantillas';
import { enviarCorreo, envioPropio } from '@/lib/correo/enviar';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { urlDelSitio } from '@/lib/sitio';

export const dynamic = 'force-dynamic';

const pagina = (titulo: string, texto: string, estado = 200) => new NextResponse(
  `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${titulo}</title></head>
<body style="margin:0;font-family:'Century Gothic',Arial,sans-serif;background:#F6F4EE;color:#0E1F19;display:grid;place-items:center;min-height:100vh;padding:16px">
<main style="max-width:520px;background:#fff;border:1px solid #DDE3DF;border-radius:20px;padding:32px"><h1 style="color:#0F4131;font-size:24px;margin:0 0 12px">${titulo}</h1><p style="line-height:1.6;color:#4A5952;margin:0">${texto}</p></main></body></html>`,
  { status: estado, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });

/**
 * Envía a Diana la invitación para crear su contraseña de administración.
 * Solo escribe a la dirección fija de la administradora, deja su cuenta como la única
 * administradora y no reenvía más de una vez cada 10 minutos.
 */
export async function GET() {
  const admin = supabaseAdmin();
  if (!envioPropio || !admin) return pagina('Falta configurar el correo', 'Añade RESEND_API_KEY y SUPABASE_SECRET_KEY en Vercel, vuelve a desplegar e inténtalo de nuevo.', 503);

  const sitio = await urlDelSitio();
  const { data: perfil } = await admin.from('perfiles').select('id').eq('correo', CORREO_ADMINISTRADORA).maybeSingle();
  let enlace: string;

  if (perfil) {
    const { data: u } = await admin.auth.admin.getUserById(perfil.id);
    const usuario = u.user;
    if (usuario?.last_sign_in_at) {
      await asegurarRol(perfil.id);
      return pagina('La cuenta ya está activa', `La cuenta de ${CORREO_ADMINISTRADORA} ya tiene contraseña. Para entrar usa «Iniciar sesión»; si la olvidó, «¿Olvidaste tu contraseña?».`);
    }
    const ultimo = Math.max(Date.parse(usuario?.invited_at ?? '') || 0, Date.parse(usuario?.recovery_sent_at ?? '') || 0);
    if (Date.now() - ultimo < 10 * 60 * 1000) return pagina('Invitación ya enviada', `Hace poco se envió la invitación a ${CORREO_ADMINISTRADORA}. Revisa la bandeja de entrada y la carpeta de spam. Podrás reenviarla en unos minutos.`);
    const { data, error } = await admin.auth.admin.generateLink({ type: 'recovery', email: CORREO_ADMINISTRADORA });
    if (error || !data.properties) return pagina('No se pudo generar la invitación', error?.message ?? 'Error desconocido.', 500);
    enlace = `${sitio}/auth/confirmar?token_hash=${data.properties.hashed_token}&type=recovery&next=/nueva-clave`;
    await asegurarRol(perfil.id);
  } else {
    const { data, error } = await admin.auth.admin.generateLink({ type: 'invite', email: CORREO_ADMINISTRADORA, options: { data: { nombre: 'Diana Gamboa', acepta_terminos: 'true' } } });
    if (error || !data.properties || !data.user) return pagina('No se pudo generar la invitación', error?.message ?? 'Error desconocido.', 500);
    enlace = `${sitio}/auth/confirmar?token_hash=${data.properties.hashed_token}&type=invite&next=/nueva-clave`;
    await asegurarRol(data.user.id);
  }

  try {
    await enviarCorreo({ para: CORREO_ADMINISTRADORA, ...correoInvitacionAdmin({ sitio, nombre: NOMBRE_ADMINISTRADORA, enlace }) });
  } catch (e) {
    return pagina('No se pudo enviar el correo', (e as Error).message + ' Revisa que el remitente esté verificado en Resend.', 502);
  }
  return pagina('Invitación enviada', `Se envió el correo a ${CORREO_ADMINISTRADORA} para crear su contraseña. Al abrirlo entrará directamente a la administración.`);

  /** Diana es administradora y nadie más lo es. */
  async function asegurarRol(id: string) {
    await admin!.from('perfiles').update({ rol: 'admin' }).eq('id', id);
    await admin!.from('perfiles').update({ rol: 'alumno' }).eq('rol', 'admin').neq('id', id);
  }
}
