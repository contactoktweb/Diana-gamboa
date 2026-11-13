import Link from 'next/link';
import { Plus } from 'lucide-react';
import { supabaseServidor } from '@/lib/supabase/servidor';
import { stripeActivo } from '@/lib/stripe';
import { fechaEvento, precioTexto, type Evento } from '@/lib/eventos/formato';

export const dynamic = 'force-dynamic';

export default async function EventosAdminPage() {
  const supabase = await supabaseServidor();
  let eventos: Evento[] = [];
  let falta = false;
  const cuenta = new Map<string, Record<string, number>>();
  if (supabase) {
    const { data, error } = await supabase.from('eventos_privados').select('*').order('creado_en', { ascending: false });
    falta = Boolean(error);
    eventos = (data as Evento[]) ?? [];
    const { data: ins } = await supabase.from('inscripciones').select('evento_id, estado');
    for (const i of ins ?? []) {
      const c = cuenta.get(i.evento_id as string) ?? {};
      c[i.estado as string] = (c[i.estado as string] ?? 0) + 1;
      cuenta.set(i.evento_id as string, c);
    }
  }

  return <>
    <header className="admin-cabecera">
      <h1>Eventos</h1>
      <p>Talleres y clases privadas para tus alumnos. Aparecen en «Eventos» del Portal y se pagan con Stripe.</p>
    </header>
    {stripeActivo
      ? <p className="correos-estado es-ok">Stripe está conectado: los alumnos pagan directamente en la página del evento.</p>
      : <p className="correos-estado es-pendiente">Stripe aún no está conectado: los alumnos pueden preinscribirse y verás sus datos aquí para enviarles el enlace de pago.</p>}
    {falta && <p className="admin-aviso" role="status">Falta crear las tablas de eventos en Supabase: ejecuta el archivo <code>supabase/eventos.sql</code> en el SQL Editor.</p>}

    <div className="admin-barra-tabla">
      <p><strong>{eventos.length}</strong> {eventos.length === 1 ? 'evento' : 'eventos'}</p>
      <Link href="/admin/eventos/nuevo" className="btn btn-green btn-sm"><Plus size={16} aria-hidden="true" /> Nuevo evento</Link>
    </div>

    {eventos.length === 0 ? <p className="admin-vacio">Aún no hay eventos.</p>
      : <div className="admin-tabla-contenedor"><table className="admin-tabla">
        <thead><tr><th>Evento</th><th>Fecha</th><th>Valor</th><th>Cupos pagados</th><th>Preinscritos / espera</th><th>Estado</th></tr></thead>
        <tbody>{eventos.map(e => {
          const c = cuenta.get(e.id) ?? {};
          return <tr key={e.id}>
            <td data-titulo="Evento"><Link href={`/admin/eventos/${e.id}`}><strong>{e.titulo}</strong></Link><small>/portal/eventos/{e.slug}</small></td>
            <td data-titulo="Fecha">{fechaEvento(e)}</td>
            <td data-titulo="Valor">{precioTexto(e.precio_centavos)}</td>
            <td data-titulo="Cupos pagados"><strong>{c.pagada ?? 0}</strong> de {e.cupos}</td>
            <td data-titulo="Preinscritos / espera">{c.preinscrita ?? 0} / {c.espera ?? 0}</td>
            <td data-titulo="Estado">{!e.visible ? <span className="admin-tenue">Oculto</span> : e.inscripcion_abierta ? 'Inscripciones abiertas' : 'Inscripciones cerradas'}</td>
          </tr>;
        })}</tbody>
      </table></div>}
  </>;
}
