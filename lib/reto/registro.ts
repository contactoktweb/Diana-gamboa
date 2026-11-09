/*
 * Registro de intentos del Reto de la Gráfica.
 * Se guarda en este navegador y, si Supabase está configurado, también en la base de datos
 * (función `reto_guardar`): así la administración ve los resultados de visitantes y alumnos.
 */
import { CATEGORIAS, TOTAL_PUNTOS, dominada, nivelDe, type Categoria } from '@/data/reto';
import { supabaseNavegador } from '@/lib/supabase/cliente';

export interface Respuesta {
  categoria: Categoria;
  /** Identificador estable del ejercicio, p. ej. «velas-alcista-apertura». */
  item: string;
  aciertoPrimerIntento: boolean;
  intentos: number;
}

export interface Intento {
  id: string;
  version: number;
  experiencia: string;
  inicio: string;
  fin?: string;
  completo: boolean;
  respuestas: Respuesta[];
  puntaje?: number;
  nivel?: string;
  porCategoria?: Record<Categoria, { aciertos: number; total: number }>;
}

const KEY = 'dg-reto-v1';

export function leerIntentos(): Intento[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Intento[]; } catch { return []; }
}
function guardar(intentos: Intento[]) {
  try { localStorage.setItem(KEY, JSON.stringify(intentos)); } catch {}
}

/** Envía el intento a Supabase sin bloquear el juego (si falla, queda guardado en el navegador). */
function sincronizar(intento: Intento | undefined) {
  const sb = supabaseNavegador();
  if (!sb || !intento) return;
  void sb.rpc('reto_guardar', { p: intento }).then(({ error }) => { if (error) console.warn('No se pudo guardar el reto', error.message); });
}

/** Identificadores de los intentos hechos en este navegador (para pasarlos a la cuenta al registrarse). */
export const idsLocales = () => leerIntentos().map(i => i.id);

export function iniciarIntento(experiencia: string): Intento {
  const previos = leerIntentos();
  // Al repetir, se usa la otra versión de los ejercicios.
  const ultima = previos.at(-1)?.version;
  const version = ultima === undefined ? 0 : 1 - ultima;
  const intento: Intento = { id: crypto.randomUUID(), version, experiencia, inicio: new Date().toISOString(), completo: false, respuestas: [] };
  guardar([...previos, intento]);
  sincronizar(intento);
  return intento;
}

export function registrarRespuesta(id: string, r: Respuesta) {
  const intentos = leerIntentos().map(i => i.id === id ? { ...i, respuestas: [...i.respuestas.filter(x => x.item !== r.item), r] } : i);
  guardar(intentos);
  sincronizar(intentos.find(i => i.id === id));
}

export function resumir(respuestas: Respuesta[]) {
  const porCategoria = Object.fromEntries(
    (Object.keys(CATEGORIAS) as Categoria[]).map(c => [c, { aciertos: respuestas.filter(r => r.categoria === c && r.aciertoPrimerIntento).length, total: CATEGORIAS[c].total }]),
  ) as Record<Categoria, { aciertos: number; total: number }>;
  const puntaje = Math.min(TOTAL_PUNTOS, respuestas.filter(r => r.aciertoPrimerIntento).length);
  const fuertes = (Object.keys(porCategoria) as Categoria[]).filter(c => dominada(porCategoria[c].aciertos, porCategoria[c].total));
  const debiles = (Object.keys(porCategoria) as Categoria[]).filter(c => !fuertes.includes(c));
  return { puntaje, nivel: nivelDe(puntaje), porCategoria, fuertes, debiles };
}

export function finalizarIntento(id: string) {
  let final: Intento | undefined;
  guardar(leerIntentos().map(i => {
    if (i.id !== id) return i;
    const r = resumir(i.respuestas);
    final = { ...i, completo: true, fin: new Date().toISOString(), puntaje: r.puntaje, nivel: r.nivel.nombre, porCategoria: r.porCategoria };
    return final;
  }));
  sincronizar(final);
  return final;
}

/** El primer intento completo representa el nivel con el que llegó el alumno. */
export function primerResultado() { return leerIntentos().find(i => i.completo); }
export function ultimoResultado() { return leerIntentos().filter(i => i.completo).at(-1); }
