/* Utilidades de las gráficas educativas del Reto. Todos los datos son ilustrativos. */

export interface Vela { o: number; h: number; l: number; c: number }

/** Generador pseudoaleatorio con semilla: las mismas gráficas en cada visita. */
function semilla(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Crea velas a partir de los cierres: cada vela abre donde cerró la anterior. */
export function velasDesdeCierres(cierres: number[], seed = 7, mecha = 0.6): Vela[] {
  const r = semilla(seed);
  return cierres.map((c, i) => {
    const o = i === 0 ? c - (cierres[1] - c) * 0.5 : cierres[i - 1];
    const h = Math.max(o, c) + mecha * (0.3 + r() * 0.9);
    const l = Math.min(o, c) - mecha * (0.3 + r() * 0.9);
    return { o, h, l, c };
  });
}

/** Refleja una serie (alcista ↔ bajista) alrededor de un precio. */
export function reflejar(velas: Vela[], eje: number): Vela[] {
  return velas.map(v => ({ o: 2 * eje - v.o, c: 2 * eje - v.c, h: 2 * eje - v.l, l: 2 * eje - v.h }));
}

/** Zigzag en tendencia: `sube` velas a favor y `baja` velas en contra en cada ciclo. */
export function cierresTendencia(n: number, inicio: number, sube: number, baja: number, paso: number, retroceso: number) {
  const out: number[] = [];
  let p = inicio;
  for (let i = 0; i < n; i++) {
    const fase = i % (sube + baja);
    p += fase < sube ? paso : -retroceso;
    out.push(+p.toFixed(2));
  }
  return out;
}

/** Media móvil exponencial calculada sobre los cierres. */
export function ema(valores: number[], periodo: number) {
  const k = 2 / (periodo + 1);
  const out: number[] = [];
  valores.forEach((v, i) => out.push(i === 0 ? v : v * k + out[i - 1] * (1 - k)));
  return out;
}

/** Máximos y mínimos relevantes: puntos donde el cierre cambia de dirección. */
export function pivotes(velas: Vela[]) {
  const altos: number[] = [], bajos: number[] = [];
  for (let i = 1; i < velas.length - 1; i++) {
    const [a, b, c] = [velas[i - 1].c, velas[i].c, velas[i + 1].c];
    if (b > a && b >= c) altos.push(i);
    if (b < a && b <= c) bajos.push(i);
  }
  return { altos, bajos };
}
