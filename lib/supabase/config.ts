/*
 * Conexión con Supabase. Si las variables no están configuradas, la web funciona igual
 * con el contenido original y sin cuentas reales (modo de demostración).
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const supabaseActivo = Boolean(SUPABASE_URL && SUPABASE_KEY);
export const BUCKET = 'medios';
