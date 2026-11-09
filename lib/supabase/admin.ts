import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, supabaseActivo } from './config';

/*
 * Cliente con permisos de servidor (clave secreta). Solo se usa en el servidor para crear
 * cuentas y generar los enlaces de los correos que envía Resend. Nunca llega al navegador.
 */
const SECRETA = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export const adminActivo = supabaseActivo && Boolean(SECRETA);

export function supabaseAdmin() {
  if (!adminActivo) return null;
  return createClient(SUPABASE_URL, SECRETA, { auth: { persistSession: false, autoRefreshToken: false } });
}
