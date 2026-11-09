/**
 * Plantillas de los correos automáticos de Supabase (confirmación, recuperación…),
 * en español y con la marca de la academia. Se copian en Supabase → Authentication →
 * Email Templates. {{ .SiteURL }}, {{ .TokenHash }}, etc. los completa Supabase.
 */

function plantilla(titulo: string, texto: string, boton: string, enlace: string, nota: string) {
  return `<!doctype html>
<html lang="es">
<body style="margin:0;padding:0;background:#F6F4EE;font-family:'Century Gothic',Arial,Helvetica,sans-serif;color:#0E1F19">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F4EE;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #DDE3DF">
        <tr><td style="background:#0F4131;padding:28px 32px;text-align:center">
          <img src="{{ .SiteURL }}/brand/logo-dg-light.png" alt="Diana Gamboa" width="120" style="display:inline-block;width:120px;height:auto">
        </td></tr>
        <tr><td style="padding:36px 32px 12px">
          <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#0F4131">${titulo}</h1>
          <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:#4A5952">${texto}</p>
          <p style="margin:0 0 28px;text-align:center">
            <a href="${enlace}" style="display:inline-block;background:#0F4131;color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;padding:15px 30px;border-radius:999px;border:1px solid #CBA52F">${boton}</a>
          </p>
          <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#6B746F">${nota}</p>
        </td></tr>
        <tr><td style="padding:20px 32px 28px;border-top:1px solid #EEF1EF;font-size:12px;line-height:1.6;color:#6B746F">
          Academia Diana Gamboa · El idioma del mercado<br>
          Contenido educativo. No constituye asesoría financiera.<br>
          Diana Gamboa nunca te pedirá dinero, contraseñas ni acceso a tus cuentas de inversión.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export const CORREOS = [
  {
    id: 'confirm-signup',
    nombre: 'Confirmar registro',
    cuando: 'Cuando alguien crea su cuenta con correo y contraseña.',
    plantillaSupabase: 'Confirm signup',
    asunto: 'Confirma tu cuenta en la Academia Diana Gamboa',
    html: plantilla('¡Bienvenido a tu academia!', 'Gracias por registrarte. Confirma tu correo para entrar a tu Portal del Alumno y descubrir tu ruta de aprendizaje.',
      'Confirmar mi correo', '{{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=email&next=/portal',
      'Si no creaste esta cuenta, puedes ignorar este correo.'),
  },
  {
    id: 'reset-password',
    nombre: 'Recuperar contraseña',
    cuando: 'Cuando un alumno pulsa «¿Olvidaste tu contraseña?».',
    plantillaSupabase: 'Reset Password',
    asunto: 'Crea una nueva contraseña · Academia Diana Gamboa',
    html: plantilla('Recupera tu contraseña', 'Recibimos una solicitud para cambiar la contraseña de tu cuenta. Pulsa el botón para crear una nueva.',
      'Crear nueva contraseña', '{{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=recovery&next=/nueva-clave',
      'Si no lo pediste tú, ignora este correo: tu contraseña no cambiará.'),
  },
  {
    id: 'change-email',
    nombre: 'Cambio de correo',
    cuando: 'Cuando un alumno cambia el correo de su cuenta.',
    plantillaSupabase: 'Change Email Address',
    asunto: 'Confirma tu nuevo correo · Academia Diana Gamboa',
    html: plantilla('Confirma tu nuevo correo', 'Pediste cambiar el correo de tu cuenta de {{ .Email }} a {{ .NewEmail }}. Confírmalo para terminar el cambio.',
      'Confirmar nuevo correo', '{{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=email_change&next=/portal/cuenta',
      'Si no lo pediste tú, ignora este correo.'),
  },
  {
    id: 'magic-link',
    nombre: 'Enlace para entrar',
    cuando: 'Cuando se envía un enlace de acceso sin contraseña (por ejemplo, desde el panel de Supabase).',
    plantillaSupabase: 'Magic Link',
    asunto: 'Tu enlace para entrar a la Academia Diana Gamboa',
    html: plantilla('Tu enlace para entrar', 'Pulsa el botón para entrar a tu Portal del Alumno. El enlace caduca en una hora.',
      'Entrar a mi portal', '{{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=magiclink&next=/portal',
      'Si no lo pediste tú, ignora este correo.'),
  },
];
