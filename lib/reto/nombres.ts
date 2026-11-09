/** Nombre legible de cada pregunta del reto (por ejemplo «velas-bajista-cierre»). */
export function nombreItem(item: string) {
  const p = item.split('-');
  const parte: Record<string, string> = { apertura: 'apertura', cierre: 'cierre', maximo: 'máximo', minimo: 'mínimo' };
  if (p[0] === 'velas') return `Vela ${p[1]}: ${parte[p[2]] ?? p[2]}`;
  if (p[0] === 'movimiento') return `Movimiento ${p[2]} (ejercicio ${p[1]})`;
  if (p[0] === 'tendencia') return `Línea de tendencia ${p[1]}`;
  if (p[0] === 'niveles') return `Nivel de ${p[1]}`;
  const medias: Record<string, string> = { 'medias-mas-rapida': 'Media más rápida', 'medias-identifica-ema8': 'Identificar la EMA 8', 'medias-identifica-ema21': 'Identificar la EMA 21', 'medias-identifica-ema21-b': 'Identificar la EMA 21 (2.ª gráfica)', 'medias-lectura': 'Lectura de las medias' };
  return medias[item] ?? item;
}

/** Duración legible entre dos fechas, p. ej. «6 min 20 s». */
export function duracion(inicio: string, fin: string | null) {
  if (!fin) return '';
  const s = Math.max(0, Math.round((new Date(fin).getTime() - new Date(inicio).getTime()) / 1000));
  if (s > 3 * 3600) return 'más de 3 h';
  const m = Math.floor(s / 60);
  return m ? `${m} min ${s % 60} s` : `${s} s`;
}
