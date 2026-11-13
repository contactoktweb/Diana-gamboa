import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AccionesCompra from '@/components/admin/AccionesCompra';
import CopiarTexto from '@/components/admin/CopiarTexto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import FormEvento from '@/components/admin/FormEvento';
import { supabaseServidor } from '@/lib/supabase/servidor';
import { precioTexto, type EstadoInscripcion, type Evento } from '@/lib/eventos/formato';

export const dynamic = 'force-dynamic';

interface Fila { id: string; nombre: string; correo: string; estado: EstadoInscripcion; monto_centavos: number | null; creado_en: string; pagado_en: string | null; comprobante: string | null }

const fecha = (d: string) => new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/New_York' }).format(new Date(d));
const GRUPOS: { estado: EstadoInscripcion; titulo: string; nota: string }[] = [
  { estado: 'verificacion', titulo: 'Compras por verificar', nota: 'Pagaron con el enlace de Stripe y esperan tu revisión. Busca el pago en tu panel de Stripe (Pagos) por su correo, revisa el comprobante si lo subieron y apruébalo. Su cupo queda apartado mientras tanto.' },
  { estado: 'pagada', titulo: 'Inscritos (pago aprobado)', nota: 'Tienen su cupo y ven el acceso del evento en su portal.' },
  { estado: 'preinscrita', titulo: 'Preinscritos', nota: 'Se preinscribieron sin pagar (Stripe aún no estaba conectado). Envíales el enlace del evento para que paguen; no tienen cupo apartado.' },
  { estado: 'espera', titulo: 'Lista de espera', nota: 'Quisieron entrar con los cupos agotados. Te sirve para decidir si abres otra fecha o amplías cupos.' },
  { estado: 'reembolsada', titulo: 'Reembolsados', nota: 'Pagaron y se les devolvió el dinero desde Stripe. Ya no tienen acceso.' },
];

export default async function EventoAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServidor();
  if (!supabase || !/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data: e } = await supabase.from('eventos_privados').select('*').eq('id', id).maybeSingle<Evento>();
  if (!e) notFound();
  const { data } = await supabase.from('inscripciones').select('id, nombre, correo, estado, monto_centavos, creado_en, pagado_en, comprobante').eq('evento_id', id).order('creado_en', { ascending: false });
  const filas = (data as Fila[]) ?? [];
  const pagadas = filas.filter(f => f.estado === 'pagada');
  // Enlaces temporales (1 hora) a los comprobantes, que están en un espacio privado.
  const comprobantes = new Map<string, string>();
  const servidor = supabaseAdmin();
  const conComprobante = filas.filter(f => f.comprobante && (f.estado === 'verificacion' || f.estado === 'pagada'));
  if (servidor && conComprobante.length) {
    const { data: firmados } = await servidor.storage.from('comprobantes').createSignedUrls(conComprobante.map(f => f.comprobante!), 3600);
    (firmados ?? []).forEach((x, k) => { if (x.signedUrl) comprobantes.set(conComprobante[k].id, x.signedUrl); });
  }
  const total = pagadas.reduce((s, f) => s + (f.monto_centavos ?? 0), 0);

  return <>
    <p><Link href="/admin/eventos" className="admin-volver"><ArrowLeft size={16} aria-hidden="true" /> Eventos</Link></p>
    <header className="admin-cabecera"><h1>{e.titulo}</h1><p>Enlace para compartir: <strong>/portal/eventos/{e.slug}</strong></p></header>

    <section className="cifras" aria-label="Cifras del evento">
      <div className="cifra"><span>Cupos pagados</span><strong>{pagadas.length} de {e.cupos}</strong><small>{e.cupos - pagadas.length > 0 ? `${e.cupos - pagadas.length} disponibles` : 'Cupos agotados'}</small></div>
      <div className="cifra"><span>Ingresos</span><strong>{precioTexto(total)}</strong><small>Antes de la comisión de Stripe</small></div>
      <div className="cifra"><span>Por verificar</span><strong>{filas.filter(f => f.estado === 'verificacion').length}</strong><small>Pagaron con el enlace</small></div>
      <div className="cifra"><span>Preinscritos</span><strong>{filas.filter(f => f.estado === 'preinscrita').length}</strong><small>Sin pagar</small></div>
      <div className="cifra"><span>Lista de espera</span><strong>{filas.filter(f => f.estado === 'espera').length}</strong><small>Con cupos agotados</small></div>
    </section>

    {GRUPOS.map(g => {
      const lista = filas.filter(f => f.estado === g.estado);
      if (!lista.length && g.estado !== 'pagada') return null;
      const verificar = g.estado === 'verificacion';
      return <section className="admin-panel" key={g.estado}>
        <h2>{g.titulo} ({lista.length})</h2>
        <p className="admin-nota">{g.nota}</p>
        {lista.length === 0 ? <p className="admin-vacio">Todavía nadie.</p> : <>
          <div className="admin-tabla-contenedor"><table className="admin-tabla">
            <thead><tr><th>Nombre</th><th>Correo</th><th>Fecha (hora del Este)</th>{(g.estado === 'pagada' || verificar) && <th>Pago</th>}{verificar && <th>Comprobante</th>}{verificar && <th><span className="sr-only">Acciones</span></th>}</tr></thead>
            <tbody>{lista.map(f => <tr key={f.id}>
              <td data-titulo="Nombre"><strong>{f.nombre || '—'}</strong></td>
              <td data-titulo="Correo"><a href={`mailto:${f.correo}`}>{f.correo}</a></td>
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

    <FormEvento inicial={{ ...e, precio: (e.precio_centavos / 100).toFixed(2) }} />
  </>;
}
