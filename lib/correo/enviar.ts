import 'server-only';
import { adminActivo } from '@/lib/supabase/admin';

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? '';
/** Remitente verificado en Resend, por ejemplo «Academia Diana Gamboa <hola@dianagamboa.com>». */
export const REMITENTE = process.env.CORREO_REMITENTE || 'Academia Diana Gamboa <onboarding@resend.dev>';

/** La web envía sus propios correos cuando Resend y la clave secreta de Supabase están configurados. */
export const envioPropio = Boolean(RESEND_API_KEY) && adminActivo;

export async function enviarCorreo({ para, asunto, html, texto }: { para: string; asunto: string; html: string; texto: string }) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: REMITENTE, to: [para], subject: asunto, html, text: texto }),
  });
  if (!r.ok) {
    const detalle = await r.text().catch(() => '');
    console.error('Resend rechazó el correo', r.status, detalle);
    throw new Error('No se pudo enviar el correo. Inténtalo de nuevo en unos minutos.');
  }
}
