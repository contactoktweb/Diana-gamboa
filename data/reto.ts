/**
 * El Reto de la Gráfica: banco de ejercicios, niveles y recomendaciones.
 * Cada reto tiene dos versiones; al repetir el juego se usa la otra, para que el
 * alumno no mejore solo por memorizar dónde tocar.
 */
import { cierresTendencia, ema, pivotes, reflejar, velasDesdeCierres, type Vela } from '@/lib/reto/grafica';

export type Categoria = 'velas' | 'movimiento' | 'tendencia' | 'niveles' | 'medias';

export const CATEGORIAS: Record<Categoria, { nombre: string; total: number }> = {
  velas: { nombre: 'Velas japonesas', total: 8 },
  movimiento: { nombre: 'Movimiento del precio', total: 3 },
  tendencia: { nombre: 'Líneas de tendencia', total: 2 },
  niveles: { nombre: 'Niveles importantes', total: 2 },
  medias: { nombre: 'Medias móviles', total: 5 },
};
export const TOTAL_PUNTOS = 20;

export const RETOS: { cat: Categoria; titulo: string }[] = [
  { cat: 'velas', titulo: '¿Conoces las velas?' },
  { cat: 'movimiento', titulo: '¿Hacia dónde se mueve el precio?' },
  { cat: 'tendencia', titulo: '¿Dónde trazarías la línea de tendencia?' },
  { cat: 'niveles', titulo: '¿Dónde está el nivel importante?' },
  { cat: 'medias', titulo: '¿Dónde irían las medias móviles?' },
];

export const EXPERIENCIAS = [
  'Nunca.',
  'He visto algunos videos o clases.',
  'Ya he estudiado análisis de gráficas.',
  'Ya tengo experiencia operando.',
];

/* ---------- Niveles ---------- */
export const NIVELES = [
  { min: 0, max: 5, nombre: 'Explorador', mensaje: 'Estás comenzando a descubrir el idioma del mercado.', color: '#176244' },
  { min: 6, max: 10, nombre: 'Aprendiz', mensaje: 'Ya reconoces algunas piezas. Ahora vamos a conectarlas.', color: '#0F4131' },
  { min: 11, max: 16, nombre: 'Observador', mensaje: 'Identificas varios elementos y puedes seguir desarrollando tu lectura.', color: '#CBA52F' },
  { min: 17, max: 20, nombre: 'Lector en formación', mensaje: 'Reconoces muy bien los conceptos evaluados. Es momento de profundizar.', color: '#B8901E' },
];
export const nivelDe = (puntos: number) => NIVELES.find(n => puntos >= n.min && puntos <= n.max) ?? NIVELES[0];

/** Una categoría se considera reconocida con al menos el 60 % de aciertos al primer intento. */
export const dominada = (aciertos: number, total: number) => aciertos / total >= 0.6;

/* ---------- Recomendaciones ---------- */
export const RECOMENDACIONES = {
  base: { slug: 'leer-una-grafica', titulo: 'Cómo leer una gráfica desde cero', motivo: 'para afianzar la lectura de velas y del movimiento del precio' },
  metodo: { slug: 'metodo-diana-gamboa', titulo: 'Método Diana Gamboa', motivo: 'para fortalecer la lectura de tendencias, niveles y medias móviles' },
  proceso: { slug: 'proceso-de-analisis', titulo: 'El Proceso de Análisis', motivo: 'para conectar todas las herramientas en una lectura ordenada' },
};

export function recomendar(debiles: Categoria[]) {
  const recs = [];
  if (debiles.includes('velas') || debiles.includes('movimiento')) recs.push(RECOMENDACIONES.base);
  if (debiles.some(c => c === 'tendencia' || c === 'niveles' || c === 'medias')) recs.push(RECOMENDACIONES.metodo);
  if (recs.length === 0) recs.push(RECOMENDACIONES.proceso);
  return recs;
}

/* ---------- Reto 1: velas ---------- */
export type ParteVela = 'apertura' | 'cierre' | 'maximo' | 'minimo';
export const PARTES: { parte: ParteVela; pregunta: string }[] = [
  { parte: 'apertura', pregunta: '¿Dónde abrió esta vela?' },
  { parte: 'cierre', pregunta: '¿Dónde cerró?' },
  { parte: 'maximo', pregunta: '¿Cuál fue su precio máximo?' },
  { parte: 'minimo', pregunta: '¿Cuál fue su precio mínimo?' },
];
const VELAS: [Vela, Vela][] = [
  [{ o: 40, c: 72, h: 88, l: 22 }, { o: 74, c: 38, h: 90, l: 24 }],
  [{ o: 30, c: 66, h: 82, l: 16 }, { o: 70, c: 34, h: 86, l: 14 }],
];

/* ---------- Reto 2: movimiento ---------- */
export type Movimiento = 'alcista' | 'bajista' | 'lateral';
const MOV: Record<Movimiento, number[]>[] = [
  {
    alcista: [100, 103, 102, 105, 108, 106, 109, 112, 110, 113, 116, 114, 117, 120],
    bajista: [120, 117, 118, 115, 112, 114, 111, 108, 110, 107, 104, 106, 103, 100],
    lateral: [105, 108, 106, 103, 101, 104, 107, 108, 105, 102, 101, 104, 107, 105],
  },
  {
    alcista: [90, 92, 95, 93, 91, 94, 97, 99, 96, 95, 98, 101, 103, 102],
    bajista: [102, 99, 96, 98, 100, 97, 94, 92, 95, 96, 93, 90, 88, 89],
    lateral: [100, 102, 99, 97, 99, 102, 103, 100, 98, 97, 100, 103, 101, 99],
  },
];
const ORDEN_MOV: Movimiento[][] = [['alcista', 'lateral', 'bajista'], ['bajista', 'alcista', 'lateral']];

/* ---------- Reto 3: tendencia ---------- */
/**
 * Línea de tendencia como la trazaría un analista: une dos mínimos (alcista) o dos máximos
 * (bajista) separados en el tiempo, sin que ningún cuerpo de vela la atraviese, y con el
 * mayor número de toques posible.
 */
export function lineaDeTendencia(velas: Vela[], tipo: 'alcista' | 'bajista'): [number, number] {
  const ext = velas.map(v => (tipo === 'alcista' ? v.l : v.h));
  const lado = tipo === 'alcista' ? 1 : -1;
  let mejor: [number, number] = [0, velas.length - 1], puntos = -1;
  for (let a = 0; a < velas.length; a++) for (let b = a + Math.ceil(velas.length * 0.4); b < velas.length; b++) {
    const en = (i: number) => ext[a] + (ext[b] - ext[a]) * (i - a) / (b - a);
    if ((ext[b] - ext[a]) * lado <= 0) continue; // debe acompañar la dirección de la tendencia
    // Ningún cuerpo puede cruzar la línea; una mecha puede rozarla (hasta 0,3).
    const cuerpo = velas.map(v => (tipo === 'alcista' ? Math.min(v.o, v.c) : Math.max(v.o, v.c)));
    if (cuerpo.some((x, i) => (x - en(i)) * lado < 0) || ext.some((x, i) => (x - en(i)) * lado < -0.3)) continue;
    const toques = ext.filter((x, i) => Math.abs(x - en(i)) < 0.6).length;
    const valor = toques * 100 + (b - a);
    if (valor > puntos) { puntos = valor; mejor = [a, b]; }
  }
  return mejor;
}

/**
 * Comprueba la línea del alumno con el mismo criterio de un analista: sigue la dirección
 * de la tendencia, se apoya en al menos dos mínimos (o máximos) y ningún cuerpo la cruza.
 * Los márgenes son proporcionales al rango de la gráfica para tolerar el trazo con el dedo.
 */
export function lineaValida(velas: Vela[], tipo: 'alcista' | 'bajista', a: { i: number; precio: number }, b: { i: number; precio: number }) {
  if (Math.abs(b.i - a.i) < velas.length * 0.25) return false;
  const lado = tipo === 'alcista' ? 1 : -1;
  const m = (b.precio - a.precio) / (b.i - a.i);
  if (m * lado <= 0) return false;
  const en = (i: number) => a.precio + m * (i - a.i);
  const rango = Math.max(...velas.map(v => v.h)) - Math.min(...velas.map(v => v.l));
  const toque = rango * 0.05, cruce = rango * 0.04;
  const ext = velas.map(v => (tipo === 'alcista' ? v.l : v.h));
  const cuerpo = velas.map(v => (tipo === 'alcista' ? Math.min(v.o, v.c) : Math.max(v.o, v.c)));
  if (cuerpo.some((x, i) => (x - en(i)) * lado < -cruce)) return false;
  // Toques en giros distintos: puntos de apoyo separados por al menos tres velas.
  const apoyos = ext.map((x, i) => (Math.abs(x - en(i)) <= toque ? i : -1)).filter(i => i >= 0);
  return apoyos.length >= 2 && apoyos[apoyos.length - 1] - apoyos[0] >= 3;
}

function tendencia(version: number) {
  const [n, sube, baja, paso, retro] = version === 0 ? [24, 4, 2, 2.2, 1.6] : [25, 3, 2, 2.4, 1.5];
  const alcista = velasDesdeCierres(cierresTendencia(n, 100, sube, baja, paso, retro), 11 + version, 0.5);
  const bajista = reflejar(velasDesdeCierres(cierresTendencia(n, 100, sube, baja, paso, retro), 23 + version, 0.5), 110);
  return [
    { velas: alcista, tipo: 'alcista' as const, anclas: lineaDeTendencia(alcista, 'alcista') },
    { velas: bajista, tipo: 'bajista' as const, anclas: lineaDeTendencia(bajista, 'bajista') },
  ];
}

/* ---------- Reto 4: niveles ---------- */
export type TipoNivel = 'soporte' | 'resistencia';
export interface ZonaNivel { tipo: TipoNivel; desde: number; hasta: number }
const SOPORTES = [
  { cierres: [111, 109, 106, 103, 101, 103.5, 106, 108.5, 107, 104, 101.5, 101, 103, 106, 109, 107.5, 105, 102, 101, 102.5, 105, 107.5, 106, 104], eje: 106 },
  { cierres: [96, 94, 92, 90.5, 92, 94.5, 96, 95, 93, 91, 90.6, 92, 95, 97, 96, 94, 91.5, 90.8, 93, 95, 96.5, 95, 93, 92], eje: 94 },
];

/** Zona alrededor de los puntos donde el precio giró varias veces (mínimos o máximos). */
function zonaDeGiros(velas: Vela[], tipo: TipoNivel): ZonaNivel {
  const p = pivotes(velas);
  const precios = tipo === 'soporte' ? p.bajos.map(i => velas[i].l) : p.altos.map(i => velas[i].h);
  const margen = (Math.max(...velas.map(v => v.h)) - Math.min(...velas.map(v => v.l))) * 0.05;
  return { tipo, desde: Math.min(...precios) - margen, hasta: Math.max(...precios) + margen };
}

/**
 * Cada gráfica tiene un nivel principal (el que se busca) y el nivel opuesto, que también
 * es real: si el alumno lo marca, la respuesta es correcta.
 */
function niveles(version: number) {
  const s = SOPORTES[version];
  const graficaSoporte = velasDesdeCierres(s.cierres, 31 + version, 0.5);
  const graficaResistencia = reflejar(velasDesdeCierres(s.cierres, 41 + version, 0.5), s.eje);
  return [graficaSoporte, graficaResistencia].map((velas, k) => {
    const principal: TipoNivel = k === 0 ? 'soporte' : 'resistencia';
    return { velas, tipo: principal, zonas: [zonaDeGiros(velas, principal), zonaDeGiros(velas, principal === 'soporte' ? 'resistencia' : 'soporte')] };
  });
}

/* ---------- Reto 5: medias móviles ---------- */
const SERIES_MEDIAS = [
  [100, 101, 103, 102, 104, 106, 105, 107, 109, 111, 110, 112, 114, 113, 112, 110, 108, 109, 106, 104, 103, 105, 102, 100, 99, 101, 98, 96, 97, 95],
  [120, 118, 119, 116, 114, 115, 112, 110, 111, 108, 106, 107, 109, 111, 110, 113, 115, 114, 117, 119, 118, 121, 123, 122, 124, 126, 125, 127, 129, 128],
  [100, 102, 101, 99, 97, 98, 95, 93, 94, 96, 99, 101, 100, 103, 105, 104, 107, 106, 104, 102, 103, 100, 98, 99, 96, 95, 97, 94, 92, 93],
  [100, 99, 97, 98, 96, 95, 96, 94, 93, 95, 97, 99, 101, 100, 103, 105, 107, 106, 109, 111, 110, 113, 115, 114, 117, 119, 118, 121, 123, 125],
];
export interface GraficaMedias { velas: Vela[]; ema8: number[]; ema21: number[] }
function grafica(cierres: number[], seed: number): GraficaMedias {
  return { velas: velasDesdeCierres(cierres, seed, 0.7), ema8: ema(cierres, 8), ema21: ema(cierres, 21) };
}
export type Relacion = 'encima' | 'debajo' | 'cruce';
/** Qué muestran las medias en la última vela, calculado a partir de los datos. */
export function relacionFinal(g: GraficaMedias): Relacion {
  const n = g.ema8.length - 1;
  const d = g.ema8[n] - g.ema21[n], antes = g.ema8[n - 2] - g.ema21[n - 2];
  if (Math.sign(d) !== Math.sign(antes) || Math.abs(d) < 0.4) return 'cruce';
  return d > 0 ? 'encima' : 'debajo';
}
function medias(version: number) {
  const [a, b, d, c] = version === 0 ? [0, 1, 2, 3] : [2, 0, 1, 3];
  const final = version === 0 ? SERIES_MEDIAS[c] : SERIES_MEDIAS[c].map(x => 220 - x);
  return {
    rapida: { g: grafica(SERIES_MEDIAS[a], 51 + version), ema8Color: 'blanca' } as const,
    identificar: { g: grafica(SERIES_MEDIAS[b], 61 + version), ema8Color: 'blanca' } as const,
    identificar2: { g: grafica(SERIES_MEDIAS[d], 71 + version), ema8Color: 'blanca' } as const,
    lectura: grafica(final, 81 + version),
  };
}

/* ---------- Banco completo ---------- */
export function crearBanco(version: number) {
  return {
    version,
    velas: VELAS[version],
    movimiento: ORDEN_MOV[version].map((tipo, i) => ({ tipo, velas: velasDesdeCierres(MOV[version][tipo], 91 + i + version * 3, 0.7) })),
    tendencia: tendencia(version),
    niveles: niveles(version),
    medias: medias(version),
  };
}
export type Banco = ReturnType<typeof crearBanco>;
