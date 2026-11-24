import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AccionesCompra from '@/components/admin/AccionesCompra';
import AprobarPagos from '@/components/admin/AprobarPagos';
import CopiarTexto from '@/components/admin/CopiarTexto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import FormEvento from '@/components/admin/FormEvento';
import SalaZoomAdmin from '@/components/admin/SalaZoomAdmin';
import LanzamientoAdmin from '@/components/admin/LanzamientoAdmin';
import { estadoAviso, LIMITE_AVISOS } from '@/lib/eventos/avisos';
import { urlDelSitio } from '@/lib/sitio';
import RecordatoriosAdmin, { type FilaRecordatorio } from '@/components/admin/RecordatoriosAdmin';
import { planRecordatorios } from '@/lib/eventos/recordatorios';
import { zoomApiActiva, zoomSdkActivo } from '@/lib/zoom';
import { supabaseServidor } from '@/lib/supabase/servidor';
import { diaLargo, fechaEvento, horaEnZona, precioTexto, type EstadoInscripcion, type Evento } from '@/lib/eventos/formato';

export const dynamic = 'force-dynamic';

interface Fila { id: string; nombre: string; correo: string; estado: EstadoInscripcion; monto_centavos: number | null; creado_en: string; pagado_en: string | null; comprobante: string | null; telefono: string | null; correo_pago: string | null }

const fecha = (d: string) => new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/New_York' }).format(new Date(d));
const GRUPOS: { estado: EstadoInscripcion; titulo: string; nota: string }[] = [
  { estado: 'verificacion', titulo: 'Compras por verificar', nota: 'Pagaron con el enlace de Stripe y esperan tu revisión. En Stripe › Payments busca el pago por su correo (o por el «correo de Stripe» si es distinto), confirma el valor y el estado «Succeeded», revisa el comprobante si lo subieron y apruébalo: le llega su correo «Gracias por tu confianza». Su cupo queda apartado mientras tanto. El teléfono abre WhatsApp.' },
  { estado: 'pagada', titulo: 'Inscritos (pago aprobado)', nota: 'Tienen su cupo, ven el acceso del evento en su portal y reciben los recordatorios. El teléfono (si lo escribieron en Stripe) abre WhatsApp.' },
  { estado: 'preinscrita', titulo: 'Preinscritos', nota: 'Se preinscribieron sin pagar (Stripe aún no estaba conectado). Envíales el enlace del evento para que paguen; no tienen cupo apartado.' },
  { estado: 'espera', titulo: 'Lista de espera', nota: 'Quisieron entrar con los cupos agotados. Te sirve para decidir si abres otra fecha o amplías cupos.' },
  { estado: 'reembolsada', titulo: 'Reembolsados', nota: 'Pagaron y se les devolvió el dinero desde Stripe. Ya no tienen acceso.' },
];

export default async function EventoAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServidor();
  if (!supabase || !/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const servidor = supabaseAdmin();
  // Todas las consultas del evento salen a la vez (antes iban una detrás de otra).
  const [{ data: e }, { data }, { data: todos }, { data: sala }, { data: enviados }] = await Promise.all([
    supabase.from('eventos_privados').select('*').eq('id', id).maybeSingle<Evento>(),
    supabase.from('inscripciones').select('id, nombre, correo, estado, monto_centavos, creado_en, pagado_en, comprobante, telefono, correo_pago').eq('evento_id', id).order('creado_en', { ascending: false }),
    supabase.from('eventos_privados').select('id, titulo, fecha_tipo, fecha, fecha_fin, fecha_periodo, fecha_mes, fecha_anio').neq('id', id).order('creado_en', { ascending: false }),
    // Sala de Zoom y correos programados (tablas de supabase/sala-y-recordatorios.sql).
    servidor ? servidor.from('eventos_zoom').select('reunion, clave').eq('evento_id', id).maybeSingle() : Promise.resolve({ data: null }),
    servidor ? servidor.from('recordatorios_enviados').select('clave, enviados, fallidos, manual, creado_en').eq('evento_id', id) : Promise.resolve({ data: null }),
  ]);
  if (!e) notFound();
  const filas = (data as Fila[]) ?? [];
  const pagadas = filas.filter(f => f.estado === 'pagada');
  // Enlaces temporales (1 hora) a los comprobantes, que están en un espacio privado.
  const comprobantes = new Map<string, string>();
  const conComprobante = filas.filter(f => f.comprobante && (f.estado === 'verificacion' || f.estado === 'pagada'));
  // Panel de lanzamiento solo para grupos con prioridad de lista de espera (o ya anunciados).
  const conLanzamiento = Boolean(e.lista_de || e.aviso_publico_en);
  const [firmados, [espera, general], sitio] = await Promise.all([
    servidor && conComprobante.length ? servidor.storage.from('comprobantes').createSignedUrls(conComprobante.map(f => f.comprobante!), 3600).then(r => r.data) : null,
    conLanzamiento ? Promise.all([estadoAviso(e, 'lista_espera'), estadoAviso(e, 'nuevo_grupo')]) : [null, null],
    urlDelSitio(),
  ]);
  (firmados ?? []).forEach((x, k) => { if (x.signedUrl) comprobantes.set(conComprobante[k].id, x.signedUrl); });
  const otros = (todos ?? []).map(o => ({ id: o.id as string, titulo: o.titulo as string, fecha: fechaEvento(o as Evento) }));
  const total = pagadas.reduce((s, f) => s + (f.monto_centavos ?? 0), 0);

  const listaNombre = e.lista_de ? otros.find(o => o.id === e.lista_de) : null;
  const ahora = Date.now();
  const recordatorios: FilaRecordatorio[] = planRecordatorios(e).map(r => {
    const hecho = enviados?.find(x => x.clave === r.clave);
    return {
      clave: r.clave, titulo: r.titulo, automatico: Boolean(r.envio),
      cuando: r.envio ? `${diaLargo(r.envio)}, 8:00 a. m. (Nueva York)` : 'Manual',
      vencido: Boolean(r.limite && ahora >= Date.parse(r.limite)),
      enviado: hecho && (hecho.enviados || hecho.fallidos) ? { fecha: fecha(hecho.creado_en as string), enviados: hecho.enviados as number, fallidos: hecho.fallidos as number, manual: Boolean(hecho.manual) } : null,
    };
  });

  return <>
    <p><Link href="/admin/eventos" className="admin-volver"><ArrowLeft size={16} aria-hidden="true" /> Eventos</Link></p>
    <header className="admin-cabecera"><h1>{e.titulo}</h1><p>Enlace para compartir: <strong>/portal/eventos/{e.slug}</strong></p></header>

    <section className="cifras" aria-label="Cifras del evento">
      <div className="cifra"><span>Cupos pagados</span><strong>{pagadas.length} de {e.cupos}</strong><small>{e.cupos - pagadas.length > 0 ? `${e.cupos - pagadas.length} disponibles` : 'Cupos agotados'}</small></div>
      <div className="cifra"><span>Ingresos</span><strong>{precioTexto(total)}</strong><small>Antes de la comisión de Stripe</small></div>
            {filas.some(f => f.estado === 'verificacion') && <div className="cifra"><span>Por verificar</span><strong>{filas.filter(f => f.estado === 'verificacion').length}</strong><small>Pagaron con el enlace</small></div>}
      <div className="cifra"><span>Preinscritos</span><strong>{filas.filter(f => f.estado === 'preinscrita').length}</strong><small>Sin pagar</small></div>
      <div className="cifra"><span>Lista de espera</span><strong>{filas.filter(f => f.estado === 'espera').length}</strong><small>Con cupos agotados</small></div>
    </section>

    {conLanzamiento && espera && general && <LanzamientoAdmin eventoId={e.id} enlace={`${sitio}/portal/eventos/${e.slug}`} prioridad={Boolean(e.solo_lista_espera && e.lista_de)}
      listaNombre={listaNombre ? `${listaNombre.titulo} · ${listaNombre.fecha}` : ''} espera={espera} general={general} abierto={Boolean(e.aviso_publico_en)} limite={LIMITE_AVISOS} />}
    <SalaZoomAdmin eventoId={e.id} slug={e.slug} sala={sala as { reunion: string; clave: string } | null} sdkActivo={zoomSdkActivo} apiActiva={zoomApiActiva} />
    <RecordatoriosAdmin eventoId={e.id} filas={recordatorios} activos={e.recordatorios !== false} cron={Boolean(process.env.CRON_SECRET)} inscritos={new Set(pagadas.map(f => f.correo.toLowerCase())).size} />

    {GRUPOS.map(g => {
      const lista = filas.filter(f => f.estado === g.estado);
      if (!lista.length && g.estado !== 'pagada') return null;
      const verificar = g.estado === 'verificacion';
      return <section className="admin-panel" key={g.estado}>
        <h2>{g.titulo} ({lista.length})</h2>
        <p className="admin-nota">{g.nota}</p>
        {lista.length === 0 ? <p className="admin-vacio">Todavía nadie.</p> : <>
          <div className="admin-tabla-contenedor"><table className="admin-tabla">
            <thead><tr><th>Nombre</th><th>Correo</th>{(g.estado === 'pagada' || verificar) && <th>Teléfono</th>}<th>Fecha (hora del Este)</th>{(g.estado === 'pagada' || verificar) && <th>Pago</th>}{verificar && <th>Comprobante</th>}{verificar && <th><span className="sr-only">Acciones</span></th>}</tr></thead>
            <tbody>{lista.map(f => <tr key={f.id}>
              <td data-titulo="Nombre"><strong>{f.nombre || '—'}</strong></td>
              <td data-titulo="Correo"><a href={`mailto:${f.correo}`}>{f.correo}</a>
                {f.correo_pago && <small className="correo-pago">Pagó en Stripe con: <strong>{f.correo_pago}</strong></small>}</td>
              {(g.estado === 'pagada' || verificar) && <td data-titulo="Teléfono">{f.telefono
                ? <a href={`https://wa.me/${f.telefono.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">{f.telefono}</a>
                : <span className="admin-tenue">—</span>}</td>}
              <td data-titulo="Fecha">{fecha(f.pagado_en ?? f.creado_en)}</td>
              {(g.estado === 'pagada' || verificar) && <td data-titulo="Pago">{precioTexto(f.monto_centavos ?? 0)}{comprobantes.has(f.id) && !verificar && <small><a href={comprobantes.get(f.id)} target="_blank" rel="noopener noreferrer">Ver comprobante</a></small>}</td>}
              {verificar && <td data-titulo="Comprobante">{comprobantes.has(f.id) ? <a href={comprobantes.get(f.id)} target="_blank" rel="noopener noreferrer">Ver comprobante</a> : <span className="admin-tenue">No subió</span>}</td>}
              {verificar && <td><AccionesCompra id={f.id} nombre={f.nombre || f.correo} /></td>}
            </tr>)}</tbody>
          </table></div>
          <div className="admin-botones"><CopiarTexto texto={lista.map(f => f.correo).join(', ')} etiqueta="Copiar todos los correos" /></div>
        </>}
      </section>;
    })}

    <details className="admin-panel aprobar-manual">
      <summary>Casos especiales: aprobar pagos a mano</summary>
      <p className="admin-nota">Los pagos con Stripe se aprueban solos. Usa esto solo si alguien pagó por fuera de la web y necesitas darle su cupo.</p>
      <AprobarPagos eventoId={e.id} />
    </details>

    <FormEvento otros={otros} inicial={{ ...e, precio: (e.precio_centavos / 100).toFixed(2), zona: 'America/New_York', hora_local: e.hora_inicio ? horaEnZona(e.hora_inicio, 'America/New_York') : '' }} />
  </>;
}
