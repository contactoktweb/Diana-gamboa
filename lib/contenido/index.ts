import 'server-only';
import { cache } from 'react';
import { supabaseActivo } from '@/lib/supabase/config';
import { supabasePublico } from '@/lib/supabase/servidor';
import { PREDETERMINADO, type Contenido, type NombreSeccion } from './predeterminado';

/**
 * Contenido de la web: lo guardado desde la administración sobre el contenido original.
 * Se guarda en caché y se renueva al instante cada vez que la administración guarda un cambio.
 */
export const getContenido = cache(async (): Promise<Contenido> => {
  if (!supabaseActivo) return PREDETERMINADO;
  try {
    const { data, error } = await supabasePublico()!.from('contenido').select('seccion, datos');
    if (error || !data) return PREDETERMINADO;
    const resultado = { ...PREDETERMINADO } as Record<string, unknown>;
    for (const fila of data as { seccion: string; datos: Record<string, unknown> }[]) {
      const base = PREDETERMINADO[fila.seccion as NombreSeccion];
      if (base && fila.datos && typeof fila.datos === 'object') resultado[fila.seccion] = { ...base, ...limpiar(fila.datos, base) };
    }
    return resultado as Contenido;
  } catch {
    return PREDETERMINADO;
  }
});

/** Ignora campos desconocidos o con un tipo distinto al original. */
function limpiar(datos: Record<string, unknown>, base: Record<string, unknown>) {
  const salida: Record<string, unknown> = {};
  for (const [clave, valor] of Object.entries(datos)) {
    if (!(clave in base)) continue;
    const original = base[clave];
    if (Array.isArray(original) ? Array.isArray(valor) : typeof original === typeof valor) salida[clave] = valor;
  }
  return salida;
}

export { PREDETERMINADO };
export type { Contenido };
