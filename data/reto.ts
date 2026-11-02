/**
 * El Reto de la Gráfica: banco de ejercicios, niveles y recomendaciones.
 * Cada reto tiene dos versiones; al repetir el juego se usa la otra, para que el
 * alumno no mejore solo por memorizar dónde tocar.
 */
import { cierresTendencia, ema, reflejar, velasDesdeCierres, type Vela } from '@/lib/reto/grafica';

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
function tendencia(version: number) {
  const [n, sube, baja, paso, retro] = version === 0 ? [24, 4, 2, 2.2, 1.6] : [25, 3, 2, 2.4, 1.5];
  const ciclo = sube + baja;
  const alcista = velasDesdeCierres(cierresTendencia(n, 100, sube, baja, paso, retro), 11 + version, 0.5);
  // Mínimos de giro: última vela de cada retroceso.
  const giros = Array.from({ length: Math.floor(n / ciclo) }, (_, k) => k * ciclo + ciclo - 1).filter(i => i < n - 1);
  const anclas: [number, number] = [giros[0], giros[giros.length - 1]];
  const bajista = reflejar(velasDesdeCierres(cierresTendencia(n, 100, sube, baja, paso, retro), 23 + version, 0.5), 110);
  return [
    { velas: alcista, tipo: 'alcista' as const, anclas },
    { velas: bajista, tipo: 'bajista' as const, anclas },
  ];
}

/* ---------- Reto 4: niveles ---------- */
const SOPORTES = [
  { cierres: [111, 109, 106, 103, 101, 103.5, 106, 108.5, 107, 104, 101.5, 101, 103, 106, 109, 107.5, 105, 102, 101, 102.5, 105, 107.5, 106, 104], zona: [99.4, 102] as [number, number], eje: 106 },
  { cierres: [96, 94, 92, 90.5, 92, 94.5, 96, 95, 93, 91, 90.6, 92, 95, 97, 96, 94, 91.5, 90.8, 93, 95, 96.5, 95, 93, 92], zona: [89.3, 91.6] as [number, number], eje: 94 },
];
function niveles(version: number) {
  const s = SOPORTES[version];
  const soporte = velasDesdeCierres(s.cierres, 31 + version, 0.5);
  // La resistencia es la misma estructura reflejada: los mínimos pasan a ser máximos.
  const resistencia = reflejar(velasDesdeCierres(s.cierres, 41 + version, 0.5), s.eje);
  return [
    { velas: soporte, tipo: 'soporte' as const, zona: s.zona },
    { velas: resistencia, tipo: 'resistencia' as const, zona: [2 * s.eje - s.zona[1], 2 * s.eje - s.zona[0]] as [number, number] },
  ];
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
    rapida: { g: grafica(SERIES_MEDIAS[a], 51 + version), ema8Color: version === 0 ? 'oro' : 'violeta' } as const,
    identificar: { g: grafica(SERIES_MEDIAS[b], 61 + version), ema8Color: version === 0 ? 'violeta' : 'oro' } as const,
    identificar2: { g: grafica(SERIES_MEDIAS[d], 71 + version), ema8Color: version === 0 ? 'oro' : 'violeta' } as const,
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
