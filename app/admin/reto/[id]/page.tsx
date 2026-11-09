import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check, X } from 'lucide-react';
import { CATEGORIAS, NIVELES, type Categoria } from '@/data/reto';
import { duracion, nombreItem } from '@/lib/reto/nombres';
import { supabaseServidor } from '@/lib/supabase/servidor';
import type { FilaIntento } from '../page';

interface Respuesta { item: string; categoria: Categoria; acierto_primer_intento: boolean; intentos: number }

const fechaHora = (d: string) => new Intl.DateTimeFormat('es', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(d));
const cats = Object.keys(CATEGORIAS) as Categoria[];

export default async function DetalleRetoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServidor();
  if (!supabase || !/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { data: intento } = await supabase.from('reto_intentos').select('id,usuario_id,experiencia,inicio,fin,completo,puntaje,nivel,por_categoria').eq('id', id).maybeSingle<FilaIntento>();
  if (!intento) notFound();
  const [{ data: respuestas }, perfil, otros] = await Promise.all([
    supabase.from('reto_respuestas').select('item,categoria,acierto_primer_intento,intentos').eq('intento_id', id).order('creado_en'),
    intento.usuario_id ? supabase.from('perfiles').select('nombre,correo').eq('id', intento.usuario_id).maybeSingle() : Promise.resolve({ data: null }),
    intento.usuario_id ? supabase.from('reto_intentos').select('id,inicio,completo,puntaje,nivel').eq('usuario_id', intento.usuario_id).order('inicio', { ascending: false }).limit(20) : Promise.resolve({ data: [] }),
  ]);
  const lista = (respuestas as Respuesta[]) ?? [];
  const persona = perfil.data as { nombre: string; correo: string } | null;
  const historial = ((otros.data ?? []) as { id: string; inicio: string; completo: boolean; puntaje: number | null; nivel: string | null }[]);
  const nivel = NIVELES.find(n => n.nombre === intento.nivel);
  const aciertos = lista.filter(r => r.acierto_primer_intento).length;

  return <>
    <p><Link href="/admin/reto" className="admin-volver"><ArrowLeft size={16} aria-hidden="true" /> Resultados del Reto</Link></p>
    <header className="admin-cabecera">
      <h1>{persona ? persona.nombre : intento.usuario_id ? 'Cuenta eliminada' : 'Visitante sin cuenta'}</h1>
      <p>{persona && <><a href={`mailto:${persona.correo}`}>{persona.correo}</a> · </>}{fechaHora(intento.inicio)}{intento.fin && ` · ${duracion(intento.inicio, intento.fin)}`}{intento.experiencia && ` · Experiencia: ${intento.experiencia}`}</p>
    </header>

    <div className="cifras">
      <div className="cifra"><span>Puntaje</span><strong>{intento.completo ? `${intento.puntaje ?? 0}/20` : '—'}</strong><small>{intento.completo ? 'Aciertos al primer intento' : 'Partida sin terminar'}</small></div>
      <div className="cifra"><span>Nivel</span><strong style={nivel ? { color: nivel.color } : undefined}>{intento.nivel ?? '—'}</strong><small>{nivel?.mensaje ?? ''}</small></div>
      <div className="cifra"><span>Preguntas respondidas</span><strong>{lista.length}</strong><small>{aciertos} acertadas a la primera</small></div>
    </div>

    {intento.por_categoria && <section className="admin-panel">
      <h2>Por tema</h2>
      <ul className="barras">{cats.map(c => {
        const v = intento.por_categoria![c] ?? { aciertos: 0, total: CATEGORIAS[c].total };
        return <li key={c}>
          <span className="barras-etiqueta">{CATEGORIAS[c].nombre}</span>
          <span className="barras-pista"><span className="barras-barra" style={{ width: `${Math.max(2, (v.aciertos / (v.total || 1)) * 100)}%` }} /></span>
          <span className="barras-valor">{v.aciertos}/{v.total}</span>
        </li>;
      })}</ul>
    </section>}

    <section className="admin-panel">
      <h2>Respuestas, pregunta por pregunta</h2>
      {lista.length === 0 ? <p className="admin-vacio">Esta partida no tiene respuestas guardadas.</p>
        : <div className="admin-tabla-contenedor"><table className="admin-tabla">
          <thead><tr><th>Pregunta</th><th>Tema</th><th>Resultado</th><th>Intentos</th></tr></thead>
          <tbody>{lista.map(r => <tr key={r.item}>
            <td data-titulo="Pregunta">{nombreItem(r.item)}</td>
            <td data-titulo="Tema">{CATEGORIAS[r.categoria]?.nombre ?? r.categoria}</td>
            <td data-titulo="Resultado">{r.acierto_primer_intento
              ? <span className="reto-resultado es-ok"><Check size={16} aria-hidden="true" /> A la primera</span>
              : <span className="reto-resultado es-fallo"><X size={16} aria-hidden="true" /> Falló el primer intento</span>}</td>
            <td data-titulo="Intentos">{r.intentos}</td>
          </tr>)}</tbody>
        </table></div>}
    </section>

    {historial.length > 1 && <section className="admin-panel">
      <h2>Todas sus partidas</h2>
      <ul className="reto-historial">{historial.map(h => <li key={h.id}>
        {h.id === intento.id ? <strong>{fechaHora(h.inicio)} (esta)</strong> : <Link href={`/admin/reto/${h.id}`}>{fechaHora(h.inicio)}</Link>}
        <span>{h.completo ? `${h.puntaje ?? 0}/20 · ${h.nivel ?? ''}` : 'Sin terminar'}</span>
      </li>)}</ul>
    </section>}
  </>;
}
