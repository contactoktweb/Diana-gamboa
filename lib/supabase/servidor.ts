import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_KEY, SUPABASE_URL, supabaseActivo } from './config';

/** Cliente con la sesión del usuario (lee y renueva las cookies). */
export async function supabaseServidor() {
  if (!supabaseActivo) return null;
  const almacen = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll: lista => {
        // En componentes de servidor no se pueden escribir cookies: el proxy las renueva.
        try { lista.forEach(({ name, value, options }) => almacen.set(name, value, options)); } catch {}
      },
    },
  });
}

export const ETIQUETA_CONTENIDO = 'contenido';

/** Cliente público sin sesión para leer el contenido de la web (en caché hasta que se edita). */
export function supabasePublico() {
  if (!supabaseActivo) return null;
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, init) => fetch(url, { ...init, cache: 'force-cache', next: { tags: [ETIQUETA_CONTENIDO] } }) },
  });
}
