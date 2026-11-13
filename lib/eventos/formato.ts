/** Datos de un evento privado (tabla eventos_privados). */
export interface Evento {
  id: string; slug: string; titulo: string; subtitulo: string; detalles: string; resumen: string;
  contenido: string; acceso: string; aviso: string;
  fecha_tipo: 'exacta' | 'aproximada'; fecha: string | null;
  fecha_periodo: 'inicio' | 'mediados' | 'finales' | null; fecha_mes: number | null; fecha_anio: number | null;
  horario: string; precio_centavos: number; cupos: number; inscripcion_abierta: boolean; visible: boolean;
  /** Enlace de pago de Stripe (provisional, mientras no estén las claves). */
  enlace_pago: string;
}

export type EstadoInscripcion = 'pendiente' | 'verificacion' | 'pagada' | 'preinscrita' | 'espera' | 'cancelada' | 'reembolsada';

export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const PERIODO = { inicio: 'Inicios', mediados: 'Mediados', finales: 'Finales' } as const;

/** «Sábado, 28 de noviembre de 2026» o, si no hay fecha exacta, «Finales de noviembre de 2026». */
export function fechaEvento(e: Pick<Evento, 'fecha_tipo' | 'fecha' | 'fecha_periodo' | 'fecha_mes' | 'fecha_anio'>) {
  if (e.fecha_tipo === 'exacta' && e.fecha) {
    const [a, m, d] = e.fecha.split('-').map(Number);
    const texto = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(a, m - 1, d)));
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
  if (e.fecha_mes && e.fecha_anio) {
    const texto = `${e.fecha_periodo ? `${PERIODO[e.fecha_periodo]} de ` : ''}${MESES[e.fecha_mes - 1]} de ${e.fecha_anio}`;
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
  return 'Fecha por confirmar';
}

/** 9899 → «US$98.99». */
export const precioTexto = (centavos: number) => `US$${(centavos / 100).toFixed(2)}`;
