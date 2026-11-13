/** Datos de un evento privado (tabla eventos_privados). */
export interface Evento {
  id: string; slug: string; titulo: string; subtitulo: string; detalles: string; resumen: string;
  contenido: string; acceso: string; aviso: string;
  fecha_tipo: 'exacta' | 'aproximada'; fecha: string | null;
  fecha_periodo: 'inicio' | 'mediados' | 'finales' | null; fecha_mes: number | null; fecha_anio: number | null;
  horario: string; precio_centavos: number; cupos: number; inscripcion_abierta: boolean; visible: boolean;
  /** Enlace de pago de Stripe (provisional, mientras no estén las claves). */
  enlace_pago: string;
  /** Último día (eventos de varios días) y hora de inicio exacta (ISO, se muestra en la hora local de cada alumno). */
  fecha_fin: string | null; hora_inicio: string | null;
}

export type EstadoInscripcion = 'pendiente' | 'verificacion' | 'pagada' | 'preinscrita' | 'espera' | 'cancelada' | 'reembolsada';

export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const PERIODO = { inicio: 'Inicios', mediados: 'Mediados', finales: 'Finales' } as const;

const dia = (f: string) => { const [a, m, d] = f.split('-').map(Number); return new Date(Date.UTC(a, m - 1, d)); };
const fmt = (f: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('es', { ...o, timeZone: 'UTC' }).format(dia(f)).replace(',', '');
const mayuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/**
 * «Sábado, 28 de noviembre de 2026», «Sábado 28 y domingo 29 de noviembre de 2026»
 * o, si no hay fecha exacta, «Finales de noviembre de 2026».
 */
export function fechaEvento(e: Pick<Evento, 'fecha_tipo' | 'fecha' | 'fecha_periodo' | 'fecha_mes' | 'fecha_anio'> & { fecha_fin?: string | null }) {
  if (e.fecha_tipo === 'exacta' && e.fecha) {
    const fin = e.fecha_fin && e.fecha_fin > e.fecha ? e.fecha_fin : null;
    if (!fin) return mayuscula(fmt(e.fecha, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    const mismoMes = fin.slice(0, 7) === e.fecha.slice(0, 7);
    const consecutivos = dia(fin).getTime() - dia(e.fecha).getTime() === 86400000;
    const inicio = fmt(e.fecha, mismoMes ? { weekday: 'long', day: 'numeric' } : { weekday: 'long', day: 'numeric', month: 'long' });
    return mayuscula(`${inicio} ${consecutivos ? 'y' : 'al'} ${fmt(fin, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`);
  }
  if (e.fecha_mes && e.fecha_anio) {
    const texto = `${e.fecha_periodo ? `${PERIODO[e.fecha_periodo]} de ` : ''}${MESES[e.fecha_mes - 1]} de ${e.fecha_anio}`;
    return mayuscula(texto);
  }
  return 'Fecha por confirmar';
}

/** Zonas horarias que puede elegir la administración al escribir la hora de inicio. */
export const ZONAS = [
  { zona: 'America/New_York', nombre: 'Nueva York (hora del Este)' },
  { zona: 'America/Los_Angeles', nombre: 'Oregón / Los Ángeles (hora del Pacífico)' },
  { zona: 'America/Bogota', nombre: 'Colombia, Perú y Ecuador' },
  { zona: 'America/Mexico_City', nombre: 'Ciudad de México' },
];

/** Diferencia (ms) entre la hora local de una zona y UTC en un instante dado. */
function desfase(ms: number, zona: string) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: zona, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    .formatToParts(new Date(ms)).map(x => [x.type, x.value]));
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ms;
}

/** «2026-11-28» + «14:00» en Nueva York → instante ISO (tiene en cuenta el horario de verano). */
export function aInstante(fecha: string, hora: string, zona: string) {
  const [a, m, d] = fecha.split('-').map(Number);
  const [h, mi] = hora.split(':').map(Number);
  const supuesto = Date.UTC(a, m - 1, d, h, mi);
  let t = supuesto - desfase(supuesto, zona);
  t = supuesto - desfase(t, zona);
  return new Date(t).toISOString();
}

/** Hora «HH:MM» de un instante en una zona (para mostrarla en el formulario). */
export function horaEnZona(iso: string, zona: string) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: zona, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso));
}

/** 9899 → «US$98.99». */
export const precioTexto = (centavos: number) => `US$${(centavos / 100).toFixed(2)}`;
