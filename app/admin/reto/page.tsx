import Link from 'next/link';
import { ChevronLeft, ChevronRight, Download, Search } from 'lucide-react';
import { CATEGORIAS, NIVELES, type Categoria } from '@/data/reto';
import { duracion } from '@/lib/reto/nombres';
import { supabaseServidor } from '@/lib/supabase/servidor';

export interface FilaIntento {
  id: string; usuario_id: string | null; experiencia: string | null; inicio: string; fin: string | null;
  completo: boolean; puntaje: number | null; nivel: string | null;
  por_categoria: Record<Categoria, { aciertos: number; total: number }> | null;
}

const POR_PAGINA = 50;
const fechaHora = (d: string) => new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d));
const cats = Object.keys(CATEGORIAS) as Categoria[];
type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function RetoPage({ searchParams }: Props) {
  const q = await searchParams;
  const f = {
    busqueda: q.busqueda ?? '', quien: q.quien ?? '', estado: q.estado ?? 'completos', nivel: q.nivel ?? '',
    desde: q.desde ?? '', hasta: q.hasta ?? '', usuario: q.usuario ?? '',
  };
  const pagina = Math.max(1, Number(q.pagina) || 1);
  const supabase = await supabaseServidor();

  let filas: FilaIntento[] = [];
  let total = 0;
  const personas = new Map<string, { nombre: string; correo: string }>();
  let sinCoincidencias = false;

  if (supabase) {
    // La búsqueda por nombre o correo se resuelve primero en los perfiles.
    let ids: string[] | null = null;
    const texto = f.busqueda.replace(/[,()%*\\]/g, ' ').trim();
    if (texto) {
      const { data } = await supabase.from('perfiles').select('id').or(`nombre.ilike.%${texto}%,correo.ilike.%${texto}%`).limit(500);
      ids = (data ?? []).map(p => p.id as string);
      if (!ids.length) sinCoincidencias = true;
    }
    if (!sinCoincidencias) {
      let consulta = supabase.from('reto_intentos')
        .select('id,usuario_id,experiencia,inicio,fin,completo,puntaje,nivel,por_categoria', { count: 'exact' })
        .order('inicio', { ascending: false })
        .range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);
      if (f.estado === 'completos') consulta = consulta.eq('completo', true);
      if (f.estado === 'sin-terminar') consulta = consulta.eq('completo', false);
      if (f.quien === 'alumnos') consulta = consulta.not('usuario_id', 'is', null);
      if (f.quien === 'visitantes') consulta = consulta.is('usuario_id', null);
      if (f.nivel) consulta = consulta.eq('nivel', f.nivel);
      if (f.desde) consulta = consulta.gte('inicio', f.desde);
      if (f.hasta) consulta = consulta.lt('inicio', new Date(new Date(f.hasta).getTime() + 86400000).toISOString().slice(0, 10));
      if (f.usuario) consulta = consulta.eq('usuario_id', f.usuario);
      if (ids) consulta = consulta.in('usuario_id', ids);
      const { data, count } = await consulta;
      filas = (data as FilaIntento[]) ?? [];
      total = count ?? 0;

      const deUsuarios = [...new Set(filas.map(r => r.usuario_id).filter(Boolean))] as string[];
      if (deUsuarios.length) {
        const { data: perfiles } = await supabase.from('perfiles').select('id,nombre,correo').in('id', deUsuarios);
        for (const p of perfiles ?? []) personas.set(p.id as string, { nombre: p.nombre as string, correo: p.correo as string });
      }
    }
  }

  const activos = Object.entries(f).filter(([k, v]) => v && !(k === 'estado' && v === 'completos'));
  const params = (extra: Record<string, string> = {}) => {
    const u = new URLSearchParams(Object.entries({ ...f, ...extra }).filter(([k, v]) => v && !(k === 'estado' && v === 'completos')));
    return u.toString() ? `?${u}` : '';
  };
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const persona = f.usuario ? personas.get(f.usuario) : undefined;

  return <>
    <header className="admin-cabecera">
      <h1>Resultados del Reto</h1>
      <p>Cada partida del «Reto de la Gráfica»: quién la hizo, su puntaje, su nivel y cómo le fue en cada tema.
        Se guardan automáticamente, también las de los visitantes sin cuenta.</p>
    </header>

    {f.usuario && <p className="admin-aviso" role="status">Mostrando solo los retos de <strong>{persona?.nombre ?? 'este alumno'}</strong>{persona?.correo && ` (${persona.correo})`}. <Link href="/admin/reto">Ver todos</Link></p>}

    <form className="admin-filtros" method="get">
      {f.usuario && <input type="hidden" name="usuario" value={f.usuario} />}
      <label className="editor-campo"><span className="editor-etiqueta">Buscar alumno por nombre o correo</span><input name="busqueda" defaultValue={f.busqueda} placeholder="Ej.: maría o @gmail.com" /></label>
      <label className="editor-campo"><span className="editor-etiqueta">Quién</span>
        <select name="quien" defaultValue={f.quien}><option value="">Todos</option><option value="alumnos">Alumnos con cuenta</option><option value="visitantes">Visitantes sin cuenta</option></select></label>
      <label className="editor-campo"><span className="editor-etiqueta">Estado</span>
        <select name="estado" defaultValue={f.estado}><option value="completos">Terminados</option><option value="sin-terminar">Sin terminar</option><option value="todos">Todos</option></select></label>
      <label className="editor-campo"><span className="editor-etiqueta">Nivel</span>
        <select name="nivel" defaultValue={f.nivel}><option value="">Todos</option>{NIVELES.map(n => <option key={n.nombre}>{n.nombre}</option>)}</select></label>
      <label className="editor-campo"><span className="editor-etiqueta">Desde</span><input type="date" name="desde" defaultValue={f.desde} /></label>
      <label className="editor-campo"><span className="editor-etiqueta">Hasta</span><input type="date" name="hasta" defaultValue={f.hasta} /></label>
      <div className="admin-filtros-botones">
        <button className="btn btn-green btn-sm"><Search size={16} aria-hidden="true" /> Filtrar</button>
        {activos.length > 0 && <a href="/admin/reto" className="btn btn-outline btn-sm">Quitar filtros</a>}
      </div>
    </form>

    <div className="admin-barra-tabla">
      <p><strong>{total}</strong> {total === 1 ? 'partida' : 'partidas'}{activos.length ? ' con estos filtros' : ' terminadas'}</p>
      <div className="admin-botones">
        <a className="btn btn-green btn-sm" href={`/admin/exportar/reto?formato=xlsx${f.desde ? `&desde=${f.desde}` : ''}${f.hasta ? `&hasta=${f.hasta}` : ''}`}><Download size={16} aria-hidden="true" /> Descargar detalle (Excel)</a>
      </div>
    </div>

    {filas.length === 0
      ? <p className="admin-vacio">{supabase ? 'No hay partidas que coincidan.' : 'Cuando Supabase esté conectado, aquí aparecerán los resultados del Reto.'}</p>
      : <div className="admin-tabla-contenedor"><table className="admin-tabla reto-tabla">
        <thead><tr><th>Fecha</th><th>Persona</th><th>Puntaje</th><th>Nivel</th><th>Por tema (aciertos)</th><th>Duración</th><th><span className="sr-only">Detalle</span></th></tr></thead>
        <tbody>{filas.map(r => {
          const p = r.usuario_id ? personas.get(r.usuario_id) : undefined;
          return <tr key={r.id}>
            <td data-titulo="Fecha">{fechaHora(r.inicio)}</td>
            <td data-titulo="Persona">{p ? <><strong>{p.nombre}</strong><small><a href={`mailto:${p.correo}`}>{p.correo}</a></small></> : <span className="admin-tenue">{r.usuario_id ? 'Cuenta eliminada' : 'Visitante sin cuenta'}</span>}
              {r.experiencia && <small>Experiencia: {r.experiencia}</small>}</td>
            <td data-titulo="Puntaje">{r.completo ? <span className="reto-puntaje"><strong>{r.puntaje ?? 0}</strong>/20</span> : <span className="admin-insignia es-pendiente">Sin terminar</span>}</td>
            <td data-titulo="Nivel">{r.nivel ?? <span className="admin-tenue">—</span>}</td>
            <td data-titulo="Por tema">{r.por_categoria
              ? <ul className="reto-temas">{cats.map(c => <li key={c} title={CATEGORIAS[c].nombre}><span>{CATEGORIAS[c].nombre}</span> <strong>{r.por_categoria![c]?.aciertos ?? 0}/{CATEGORIAS[c].total}</strong></li>)}</ul>
              : <span className="admin-tenue">—</span>}</td>
            <td data-titulo="Duración">{duracion(r.inicio, r.fin) || <span className="admin-tenue">—</span>}</td>
            <td><Link className="btn btn-outline btn-sm" href={`/admin/reto/${r.id}`}>Ver respuestas</Link></td>
          </tr>;
        })}</tbody>
      </table></div>}

    {paginas > 1 && <nav className="admin-paginas" aria-label="Páginas">
      {pagina > 1 ? <Link className="btn btn-outline btn-sm" href={`/admin/reto${params({ pagina: String(pagina - 1) })}`}><ChevronLeft size={16} aria-hidden="true" /> Anteriores</Link> : <span />}
      <span>Página {pagina} de {paginas}</span>
      {pagina < paginas ? <Link className="btn btn-outline btn-sm" href={`/admin/reto${params({ pagina: String(pagina + 1) })}`}>Siguientes <ChevronRight size={16} aria-hidden="true" /></Link> : <span />}
    </nav>}
  </>;
}
