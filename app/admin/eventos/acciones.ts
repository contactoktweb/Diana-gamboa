'use server';

import { revalidatePath } from 'next/cache';
import { getSesion } from '@/lib/sesion';
import { supabaseServidor } from '@/lib/supabase/servidor';
import { aInstante, diasEvento, fechaEvento, horarioCorreo, ZONAS, type Evento } from '@/lib/eventos/formato';
import { crearReunionZoom, numeroReunion, zoomApiActiva } from '@/lib/zoom';
import { enviarRecordatorio, planRecordatorios } from '@/lib/eventos/recordatorios';
import { enviarAviso, type TipoAviso } from '@/lib/eventos/avisos';
import { CORREO_ADMINISTRADORA } from '@/lib/administradora';
import { avisarInscripcion, primerNombre } from '@/lib/eventos/pago';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { enviarCorreosLote } from '@/lib/correo/enviar';
import { correoCupoAprobado, correoGraciasEvento } from '@/lib/correo/plantillas';
import { urlDelSitio } from '@/lib/sitio';

export type DatosEvento = Omit<Evento, 'id' | 'precio_centavos' | 'aviso_publico_en' | 'aviso_solo_novedades'> & { id?: string; precio: string; hora_local?: string; zona?: string };
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
  const listaDe = d.solo_lista_espera && d.lista_de && d.lista_de !== d.id ? d.lista_de : null;
  if (d.solo_lista_espera && !listaDe) return { ok: false, error: 'Elige de qué evento es la lista de espera con prioridad.' };
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
    inscripcion_abierta: Boolean(d.inscripcion_abierta), visible: Boolean(d.visible), recordatorios: d.recordatorios !== false,
    enlace_pago: enlacePago, etiqueta: recortar(d.etiqueta, 80), en_lista: d.en_lista !== false,
    solo_lista_espera: Boolean(listaDe), lista_de: listaDe,
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
export async function aprobarCompra(inscripcionId: string): Promise<{ ok: true; aviso?: string } | { ok: false; error: string }> {
  // Las inscripciones solo las modifica el servidor, después de comprobar que es la administradora.
  const servidor = (await clienteAdmin()) && supabaseAdmin();
  if (!servidor) return { ok: false, error: 'Tu sesión expiró o no tienes permiso.' };
  const { data, error } = await servidor.from('inscripciones').update({ estado: 'pagada', pagado_en: new Date().toISOString(), actualizado_en: new Date().toISOString() })
    .eq('id', inscripcionId).eq('estado', 'verificacion').select('id');
  if (error) return { ok: false, error: 'No se pudo aprobar: ' + error.message };
  if (!data?.length) return { ok: false, error: 'Esta compra ya no está en verificación.' };
  const llego = await avisarInscripcion(inscripcionId, { alumno: true }).catch(() => false);
  revalidatePath('/admin/eventos', 'layout');
  return llego
    ? { ok: true, aviso: 'Aprobado. Se envió su correo «Gracias por tu confianza».' }
    : { ok: false, error: 'La compra quedó aprobada, pero el correo de confirmación no salió. Revisa Resend → Emails; puedes enviarle la bienvenida desde «Correos a los inscritos».' };
}

/** Aprueba de una vez todas las compras en verificación de un evento y envía a cada persona «Gracias por tu confianza». */
export async function aprobarTodasCompras(eventoId: string): Promise<{ ok: true; aviso: string } | { ok: false; error: string }> {
  const servidor = (await clienteAdmin()) && supabaseAdmin();
  if (!servidor) return { ok: false, error: 'Tu sesión expiró o no tienes permiso.' };
  const { data: e } = await servidor.from('eventos_privados').select('*').eq('id', eventoId).maybeSingle<Evento>();
  if (!e) return { ok: false, error: 'No se encontró el evento.' };
  const ahora = new Date().toISOString();
  // Solo las que siguen «en verificación» (si otra pestaña ya aprobó alguna, no se repite).
  const { data, error } = await servidor.from('inscripciones').update({ estado: 'pagada', pagado_en: ahora, actualizado_en: ahora })
    .eq('evento_id', eventoId).eq('estado', 'verificacion').select('nombre, correo');
  if (error) return { ok: false, error: 'No se pudieron aprobar: ' + error.message };
  const filas = data ?? [];
  revalidatePath('/admin/eventos', 'layout');
  if (!filas.length) return { ok: false, error: 'No hay compras por verificar.' };
  const sitio = await urlDelSitio();
  const r = await enviarCorreosLote(filas.map(f => ({
    para: f.correo as string,
    ...correoGraciasEvento({ sitio, nombre: primerNombre((f.nombre as string) || ''), evento: e.titulo, fecha: fechaEvento(e), ...horarioCorreo(e), enlace: `${sitio}/portal/eventos/${e.slug}` }),
  })));
  const n = filas.length;
  const base = `${n} ${n === 1 ? 'compra aprobada' : 'compras aprobadas'}`;
  return r.fallidos.length
    ? { ok: false, error: `${base}, pero ${r.fallidos.length} correos no salieron: ${r.fallidos.join(', ')}. Puedes enviarles la bienvenida desde «Correos a los inscritos».` }
    : { ok: true, aviso: `${base}. Se envió a cada persona su correo «Gracias por tu confianza».` };
}

/** El pago no aparece en Stripe: se rechaza y el cupo se libera. */
export async function rechazarCompra(inscripcionId: string): Promise<{ ok: true; aviso?: string } | { ok: false; error: string }> {
  const servidor = (await clienteAdmin()) && supabaseAdmin();
  if (!servidor) return { ok: false, error: 'Tu sesión expiró o no tienes permiso.' };
  const { error } = await servidor.from('inscripciones').update({ estado: 'cancelada', actualizado_en: new Date().toISOString() }).eq('id', inscripcionId).eq('estado', 'verificacion');
  if (error) return { ok: false, error: 'No se pudo rechazar: ' + error.message };
  revalidatePath('/admin/eventos', 'layout');
  return { ok: true, aviso: 'Compra rechazada: el cupo quedó libre.' };
}

export type FilaImportada = { correo: string; nombre: string; resultado: 'aprobado' | 'aprobado_verificacion' | 'ya_aprobado' | 'repetido' | 'no_valido' | 'error' };

/**
 * «Aprobar pagos de Stripe»: recibe una lista (una persona por línea: «Nombre, correo» o solo el correo),
 * deja a cada persona con su cupo pagado y, si se pide, les envía el correo de «pago comprobado».
 * Cuando esa persona entre a la web con el mismo correo, verá el evento como inscrita.
 */
export async function aprobarPagosStripe(eventoId: string, texto: string, enviar: boolean):
  Promise<{ ok: true; filas: FilaImportada[]; enviados: number; fallidos: string[] } | { ok: false; error: string }> {
  const servidor = (await clienteAdmin()) && supabaseAdmin();
  if (!servidor) return { ok: false, error: 'Tu sesión expiró o no tienes permiso.' };
  const { data: evento } = await servidor.from('eventos_privados').select('id, titulo, precio_centavos').eq('id', eventoId).maybeSingle();
  if (!evento) return { ok: false, error: 'No se encontró el evento.' };

  const lineas = texto.split(/\r?\n/).map(l => l.trim()).filter(Boolean).slice(0, 300);
  if (!lineas.length) return { ok: false, error: 'Pega al menos un correo.' };

  const filas: FilaImportada[] = [];
  const vistos = new Set<string>();
  const nuevos: { correo: string; nombre: string }[] = [];
  const ahora = new Date().toISOString();

  for (const linea of lineas) {
    const original = linea.match(/[^\s,;<>"']+@[^\s,;<>"']+\.[^\s,;<>"']{2,}/)?.[0] ?? '';
    const correo = original.toLowerCase();
    const nombre = linea.replace(original, '').replace(/[,;\t<>"]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
    if (!correo) { filas.push({ correo: linea.slice(0, 80), nombre: '', resultado: 'no_valido' }); continue; }
    if (vistos.has(correo)) { filas.push({ correo, nombre, resultado: 'repetido' }); continue; }
    vistos.add(correo);

    const { data: actual } = await servidor.from('inscripciones').select('id, estado').eq('evento_id', evento.id).eq('correo', correo).in('estado', ['pagada', 'verificacion']).limit(1).maybeSingle();
    if (actual?.estado === 'pagada') { filas.push({ correo, nombre, resultado: 'ya_aprobado' }); continue; }
    if (actual?.estado === 'verificacion') {
      const { error } = await servidor.from('inscripciones').update({ estado: 'pagada', pagado_en: ahora, actualizado_en: ahora }).eq('id', actual.id);
      filas.push({ correo, nombre, resultado: error ? 'error' : 'aprobado_verificacion' });
      if (!error) nuevos.push({ correo, nombre });
      continue;
    }
    // Si ya tiene cuenta en la web, la inscripción queda unida a su cuenta desde ya.
    const { data: perfil } = await servidor.from('perfiles').select('id, nombre').eq('correo', correo).maybeSingle();
    if (perfil) await servidor.from('inscripciones').update({ estado: 'cancelada', actualizado_en: ahora })
      .eq('evento_id', evento.id).eq('usuario_id', perfil.id).in('estado', ['pendiente', 'preinscrita', 'espera']);
    const { error } = await servidor.from('inscripciones').insert({
      evento_id: evento.id, usuario_id: perfil?.id ?? null, nombre: nombre || (perfil?.nombre as string) || '', correo,
      estado: 'pagada', monto_centavos: evento.precio_centavos, pagado_en: ahora,
    });
    filas.push({ correo, nombre, resultado: error ? 'error' : 'aprobado' });
    if (!error) nuevos.push({ correo, nombre: nombre || (perfil?.nombre as string) || '' });
  }

  let enviados = 0;
  let fallidos: string[] = [];
  if (enviar && nuevos.length) {
    const sitio = await urlDelSitio();
    const r = await enviarCorreosLote(nuevos.map(n => ({ para: n.correo, ...correoCupoAprobado({ sitio, nombre: primerNombre(n.nombre), evento: evento.titulo as string }) })));
    enviados = r.enviados; fallidos = r.fallidos;
  }
  revalidatePath('/admin/eventos', 'layout');
  return { ok: true, filas, enviados, fallidos };
}

type Simple = { ok: true; aviso?: string } | { ok: false; error: string };

/** Si algo falla en el servidor, la administración ve el motivo en lugar de un botón que «no hace nada». */
async function protegida(fn: () => Promise<Simple>): Promise<Simple> {
  try { return await fn(); } catch (e) {
    console.error('Acción de eventos', e);
    return { ok: false, error: `Ocurrió un error y no se completó: ${(e as Error).message || 'error desconocido'}.` };
  }
}

async function servidorAdmin() {
  return (await clienteAdmin()) && supabaseAdmin();
}

/** Guarda la reunión de Zoom del evento (número o enlace de invitación + código). */
export async function guardarSalaZoom(eventoId: string, reunionTexto: string, clave: string): Promise<Simple> {
  const servidor = await servidorAdmin();
  if (!servidor) return { ok: false, error: 'Tu sesión expiró o no tienes permiso.' };
  const reunion = numeroReunion(reunionTexto);
  if (!reunion) return { ok: false, error: 'Escribe el ID de la reunión de Zoom (9 a 12 números) o pega el enlace de invitación.' };
  const codigo = recortar(clave, 40);
  const { error } = await servidor.from('eventos_zoom').upsert({ evento_id: eventoId, reunion, clave: codigo, actualizado_en: new Date().toISOString() });
  if (error) return { ok: false, error: /eventos_zoom/.test(error.message) ? 'Falta ejecutar supabase/sala-y-recordatorios.sql en Supabase.' : error.message };
  revalidatePath('/admin/eventos', 'layout');
  revalidatePath('/portal/eventos', 'layout');
  return { ok: true, aviso: 'Sala guardada. Los inscritos ya ven el botón «Entrar a la clase».' };
}

/** Crea la reunión en la cuenta de Zoom Pro de Diana (app Server-to-Server) y la guarda. */
export async function crearSalaZoom(eventoId: string, duracionMin: number): Promise<Simple> {
  const servidor = await servidorAdmin();
  if (!servidor) return { ok: false, error: 'Tu sesión expiró o no tienes permiso.' };
  if (!zoomApiActiva) return { ok: false, error: 'Falta la app Server-to-Server de Zoom en Vercel. Mientras tanto, crea la reunión en zoom.us y pega aquí su ID y código.' };
  const { data: e } = await servidor.from('eventos_privados').select('*').eq('id', eventoId).maybeSingle<Evento>();
  if (!e) return { ok: false, error: 'No se encontró el evento.' };
  if (!e.hora_inicio || !e.fecha) return { ok: false, error: 'Primero guarda la fecha exacta y la hora de inicio del evento.' };
  const minutos = Math.min(Math.max(Math.round(duracionMin) || 120, 30), 600);
  try {
    const { reunion, clave } = await crearReunionZoom({ titulo: e.titulo, inicio: e.hora_inicio, dias: diasEvento(e).length, duracionMin: minutos });
    const { error } = await servidor.from('eventos_zoom').upsert({ evento_id: eventoId, reunion, clave, actualizado_en: new Date().toISOString() });
    if (error) return { ok: false, error: error.message };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
  revalidatePath('/admin/eventos', 'layout');
  revalidatePath('/portal/eventos', 'layout');
  return { ok: true, aviso: 'Reunión creada en tu cuenta de Zoom (con sala de espera y grabación en la nube) y guardada.' };
}

export async function quitarSalaZoom(eventoId: string): Promise<Simple> {
  const servidor = await servidorAdmin();
  if (!servidor) return { ok: false, error: 'Tu sesión expiró o no tienes permiso.' };
  await servidor.from('eventos_zoom').delete().eq('evento_id', eventoId);
  revalidatePath('/admin/eventos', 'layout');
  revalidatePath('/portal/eventos', 'layout');
  return { ok: true };
}

/** Envía ahora un correo programado (bienvenida o recordatorio). Con «prueba», solo a la administradora. */
export async function enviarRecordatorioAhora(eventoId: string, clave: string, prueba: boolean): Promise<Simple> {
  return protegida(() => enviarRecordatorioAhoraSin(eventoId, clave, prueba));
}
async function enviarRecordatorioAhoraSin(eventoId: string, clave: string, prueba: boolean): Promise<Simple> {
  const servidor = await servidorAdmin();
  if (!servidor) return { ok: false, error: 'Tu sesión expiró o no tienes permiso.' };
  const { data: e } = await servidor.from('eventos_privados').select('*').eq('id', eventoId).maybeSingle<Evento>();
  if (!e) return { ok: false, error: 'No se encontró el evento.' };
  const r = planRecordatorios(e).find(x => x.clave === clave);
  if (!r) return { ok: false, error: 'Ese recordatorio ya no existe (¿cambiaste la fecha?).' };
  const res = await enviarRecordatorio(e, r, await urlDelSitio(), { prueba, manual: true });
  if (res.error) return { ok: false, error: res.error };
  revalidatePath('/admin/eventos', 'layout');
  if (prueba) return res.enviados ? { ok: true, aviso: `Prueba enviada a ${CORREO_ADMINISTRADORA}. Revisa la bandeja de entrada (y spam).` } : { ok: false, error: `No se pudo enviar la prueba. ${res.detalle || ''}`.trim() };
  return res.fallidos.length
    ? { ok: false, error: `Se enviaron ${res.enviados} de ${res.total}. No salieron ${res.fallidos.length}${res.detalle ? ` (${res.detalle})` : ''}: ${res.fallidos.slice(0, 20).join(', ')}${res.fallidos.length > 20 ? '…' : ''}` }
    : { ok: true, aviso: `Enviado a ${res.enviados} ${res.enviados === 1 ? 'persona' : 'personas'}.` };
}

/** Envía el correo de la lista de espera o el aviso del nuevo grupo (a quienes falten). */
export async function enviarAvisoAhora(eventoId: string, tipo: TipoAviso, prueba: boolean): Promise<Simple> {
  return protegida(() => enviarAvisoAhoraSin(eventoId, tipo, prueba));
}
async function enviarAvisoAhoraSin(eventoId: string, tipo: TipoAviso, prueba: boolean): Promise<Simple> {
  const servidor = await servidorAdmin();
  if (!servidor) return { ok: false, error: 'Tu sesión expiró o no tienes permiso.' };
  const { data: e } = await servidor.from('eventos_privados').select('*').eq('id', eventoId).maybeSingle<Evento>();
  if (!e) return { ok: false, error: 'No se encontró el evento.' };
  if (tipo === 'lista_espera' && !e.lista_de) return { ok: false, error: 'Activa primero la prioridad y elige de qué evento es la lista de espera.' };
  const r = await enviarAviso(e, tipo, await urlDelSitio(), prueba);
  revalidatePath('/admin/eventos', 'layout');
  if (r.error) return { ok: false, error: r.error };
  if (prueba) return r.enviados ? { ok: true, aviso: `Prueba enviada a ${CORREO_ADMINISTRADORA}. Revisa la bandeja de entrada (y spam).` } : { ok: false, error: `No se pudo enviar la prueba. ${r.detalle || ''}`.trim() };
  if (!r.enviados && !r.fallidos.length) return { ok: true, aviso: 'No hay nadie pendiente: todos ya lo recibieron.' };
  const resto = r.pendientes ? ` Faltan ${r.pendientes}: vuelve a pulsar el botón para enviarles.` : ' Ya lo recibieron todos.';
  return r.fallidos.length
    ? { ok: false, error: `Se enviaron ${r.enviados}. No salieron ${r.fallidos.length}${r.detalle ? ` (${r.detalle})` : ''}; quedan pendientes y puedes reintentar.${resto}` }
    : { ok: true, aviso: `Enviado a ${r.enviados} ${r.enviados === 1 ? 'persona' : 'personas'}.${resto}` };
}

/** Fin de la etapa de prioridad: el grupo aparece en Eventos para todos y empieza el aviso general. */
export async function abrirATodos(eventoId: string, soloNovedades: boolean): Promise<Simple> {
  return protegida(() => abrirATodosSin(eventoId, soloNovedades));
}
async function abrirATodosSin(eventoId: string, soloNovedades: boolean): Promise<Simple> {
  const servidor = await servidorAdmin();
  if (!servidor) return { ok: false, error: 'Tu sesión expiró o no tienes permiso.' };
  const { data: e, error } = await servidor.from('eventos_privados').update({
    solo_lista_espera: false, en_lista: true, visible: true, inscripcion_abierta: true,
    aviso_publico_en: new Date().toISOString(), aviso_solo_novedades: soloNovedades, actualizado_en: new Date().toISOString(),
  }).eq('id', eventoId).select('*').maybeSingle<Evento>();
  if (error || !e) return { ok: false, error: error?.message ?? 'No se encontró el evento.' };
  revalidatePath('/portal/eventos', 'layout');
  revalidatePath('/eventos', 'layout');
  const r = await enviarAviso(e, 'nuevo_grupo', await urlDelSitio());
  revalidatePath('/admin/eventos', 'layout');
  return { ok: true, aviso: `Listo: el grupo ya está abierto para todos y aparece en Eventos. Aviso enviado a ${r.enviados} ${r.enviados === 1 ? 'persona' : 'personas'}.${r.pendientes ? ` Faltan ${r.pendientes}: pulsa «Enviar ya a los pendientes».` : ''}` };
}
