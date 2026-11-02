/*
 * Registro de intentos del Reto de la Gráfica.
 * Por ahora se guarda en este navegador. La forma de los datos es la misma que tendrá la
 * base de datos (una fila por intento y una por respuesta), para conectarla sin cambios.
 */
import { CATEGORIAS, TOTAL_PUNTOS, dominada, nivelDe, type Categoria } from '@/data/reto';

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

export function iniciarIntento(experiencia: string): Intento {
  const previos = leerIntentos();
  // Al repetir, se usa la otra versión de los ejercicios.
  const ultima = previos.at(-1)?.version;
  const version = ultima === undefined ? 0 : 1 - ultima;
  const intento: Intento = { id: crypto.randomUUID(), version, experiencia, inicio: new Date().toISOString(), completo: false, respuestas: [] };
  guardar([...previos, intento]);
  return intento;
}

export function registrarRespuesta(id: string, r: Respuesta) {
  guardar(leerIntentos().map(i => i.id === id ? { ...i, respuestas: [...i.respuestas.filter(x => x.item !== r.item), r] } : i));
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
  return final;
}

/** El primer intento completo representa el nivel con el que llegó el alumno. */
export function primerResultado() { return leerIntentos().find(i => i.completo); }
export function ultimoResultado() { return leerIntentos().filter(i => i.completo).at(-1); }
