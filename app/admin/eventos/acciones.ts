'use server';

import { revalidatePath } from 'next/cache';
import { getSesion } from '@/lib/sesion';
import { supabaseServidor } from '@/lib/supabase/servidor';
import { aInstante, ZONAS, type Evento } from '@/lib/eventos/formato';
import { avisarInscripcion } from '@/lib/eventos/pago';
import { supabaseAdmin } from '@/lib/supabase/admin';

export type DatosEvento = Omit<Evento, 'id' | 'precio_centavos'> & { id?: string; precio: string; hora_local?: string; zona?: string };
type Resultado = { ok: true; id: string } | { ok: false; error: string };

async function clienteAdmin() {
  const supabase = await supabaseServidor();
  if (!supabase) return null;
  const sesion = await getSesion();
  return sesion?.perfil?.rol === 'admin' ? supabase : null;
}

const recortar = (s: unknown, max: number) => String(s ?? '').trim().slice(0, max);

export async function guardarEvento(d: DatosEvento): Promise<Resultado> {
  const supabase = await clienteAdmin();
  if (!supabase) return { ok: false, error: 'Tu sesión expiró o no tienes permiso. Vuelve a iniciar sesión.' };

  const titulo = recortar(d.titulo, 160);
  const slug = recortar(d.slug, 60).toLowerCase();
  const precio = Math.round(Number(String(d.precio).replace(',', '.')) * 100);
  const cupos = Math.round(Number(d.cupos));
  if (!titulo) return { ok: false, error: 'Escribe el título del evento.' };
  const enlacePago = recortar(d.enlace_pago, 300);
  if (enlacePago && !/^https:\/\/\S+$/.test(enlacePago)) return { ok: false, error: 'El enlace de pago debe empezar por https://.' };
  if (!/^[a-z0-9-]{2,60}$/.test(slug)) return { ok: false, error: 'La dirección solo puede tener letras minúsculas, números y guiones.' };
  if (!Number.isFinite(precio) || precio < 50) return { ok: false, error: 'Escribe un valor válido en dólares (mínimo 0.50).' };
  if (!Number.isInteger(cupos) || cupos < 1 || cupos > 10000) return { ok: false, error: 'Los cupos deben ser un número entre 1 y 10.000.' };
  const exacta = d.fecha_tipo === 'exacta';
  if (exacta && !d.fecha) return { ok: false, error: 'Elige la fecha exacta o cambia a «Fecha aproximada».' };
  if (!exacta && (!d.fecha_mes || !d.fecha_anio)) return { ok: false, error: 'Elige el mes y el año del evento.' };
  const fechaFin = exacta && d.fecha_fin ? d.fecha_fin : null;
  if (fechaFin && d.fecha && fechaFin < d.fecha) return { ok: false, error: 'El último día no puede ser anterior al primero.' };
  const horaLocal = exacta ? String(d.hora_local ?? '').trim() : '';
  if (horaLocal && !/^\d{2}:\d{2}$/.test(horaLocal)) return { ok: false, error: 'Revisa la hora de inicio.' };
  const zona = ZONAS.some(z => z.zona === d.zona) ? d.zona! : 'America/New_York';
  const horaInicio = horaLocal && d.fecha ? aInstante(d.fecha, horaLocal, zona) : null;

  const fila = {
    slug, titulo,
    subtitulo: recortar(d.subtitulo, 300), detalles: recortar(d.detalles, 300), resumen: recortar(d.resumen, 600),
    contenido: recortar(d.contenido, 40000), acceso: recortar(d.acceso, 10000), aviso: recortar(d.aviso, 4000),
    fecha_tipo: exacta ? 'exacta' : 'aproximada',
    fecha: exacta ? d.fecha : null, fecha_fin: fechaFin, hora_inicio: horaInicio,
    fecha_periodo: exacta ? null : d.fecha_periodo || null,
    fecha_mes: exacta ? null : Number(d.fecha_mes), fecha_anio: exacta ? null : Number(d.fecha_anio),
    horario: recortar(d.horario, 300), precio_centavos: precio, cupos,
    inscripcion_abierta: Boolean(d.inscripcion_abierta), visible: Boolean(d.visible), enlace_pago: enlacePago,
    actualizado_en: new Date().toISOString(),
  };
  const r = d.id
    ? await supabase.from('eventos_privados').update(fila).eq('id', d.id).select('id').single()
    : await supabase.from('eventos_privados').insert(fila).select('id').single();
  if (r.error) return { ok: false, error: /duplicate|unique/i.test(r.error.message) ? 'Ya existe un evento con esa dirección. Cámbiala.' : 'No se pudo guardar: ' + r.error.message };
  revalidatePath('/admin/eventos');
  revalidatePath('/portal/eventos', 'layout');
  return { ok: true, id: r.data.id as string };
}

export async function eliminarEvento(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await clienteAdmin();
  if (!supabase) return { ok: false, error: 'Tu sesión expiró o no tienes permiso.' };
  const { count } = await supabase.from('inscripciones').select('id', { count: 'exact', head: true }).eq('evento_id', id).eq('estado', 'pagada');
  if (count) return { ok: false, error: `Este evento tiene ${count} ${count === 1 ? 'cupo pagado' : 'cupos pagados'}. Ocúltalo en lugar de eliminarlo.` };
  const { error } = await supabase.from('eventos_privados').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/eventos');
  revalidatePath('/portal/eventos', 'layout');
  return { ok: true };
}

/** Compra por enlace verificada en Stripe: la persona queda inscrita y recibe su correo de agradecimiento. */
export async function aprobarCompra(inscripcionId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  // Las inscripciones solo las modifica el servidor, después de comprobar que es la administradora.
  const servidor = (await clienteAdmin()) && supabaseAdmin();
  if (!servidor) return { ok: false, error: 'Tu sesión expiró o no tienes permiso.' };
  const { data, error } = await servidor.from('inscripciones').update({ estado: 'pagada', pagado_en: new Date().toISOString(), actualizado_en: new Date().toISOString() })
    .eq('id', inscripcionId).eq('estado', 'verificacion').select('id');
  if (error) return { ok: false, error: 'No se pudo aprobar: ' + error.message };
  if (!data?.length) return { ok: false, error: 'Esta compra ya no está en verificación.' };
  await avisarInscripcion(inscripcionId, { alumno: true });
  revalidatePath('/admin/eventos', 'layout');
  return { ok: true };
}

/** El pago no aparece en Stripe: se rechaza y el cupo se libera. */
export async function rechazarCompra(inscripcionId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const servidor = (await clienteAdmin()) && supabaseAdmin();
  if (!servidor) return { ok: false, error: 'Tu sesión expiró o no tienes permiso.' };
  const { error } = await servidor.from('inscripciones').update({ estado: 'cancelada', actualizado_en: new Date().toISOString() }).eq('id', inscripcionId).eq('estado', 'verificacion');
  if (error) return { ok: false, error: 'No se pudo rechazar: ' + error.message };
  revalidatePath('/admin/eventos', 'layout');
  return { ok: true };
}
