import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';

/*
 * Enlace personal «Entrar a la clase» de los correos de recordatorio: lleva a la clase sin iniciar sesión.
 * Va firmado (no se puede inventar ni cambiar), es de una persona y un evento, y vence al terminar el evento.
 */
const SECRETO = process.env.ENLACE_CLASE_SECRETO || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const firmar = (datos: string) => createHmac('sha256', SECRETO).update(`clase:${datos}`).digest('base64url');

export function crearEnlaceClase(eventoId: string, correo: string, venceMs: number) {
  if (!SECRETO) return '';
  const datos = Buffer.from(JSON.stringify({ e: eventoId, c: correo.toLowerCase(), v: Math.floor(venceMs / 1000) })).toString('base64url');
  return `${datos}.${firmar(datos)}`;
}

export function leerEnlaceClase(token: string): { eventoId: string; correo: string } | null {
  if (!SECRETO || !token) return null;
  const [datos, firma] = token.split('.');
  if (!datos || !firma) return null;
  const esperada = Buffer.from(firmar(datos));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null;
  try {
    const d = JSON.parse(Buffer.from(datos, 'base64url').toString()) as { e: string; c: string; v: number };
    if (!d.e || !d.c || !d.v || d.v * 1000 < Date.now()) return null;
    return { eventoId: d.e, correo: d.c };
  } catch {
    return null;
  }
}
