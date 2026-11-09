import { Download, Search } from 'lucide-react';
import AccionesAlumno from '@/components/admin/AccionesAlumno';
import CrearAlumno from '@/components/admin/CrearAlumno';
import { envioPropio } from '@/lib/correo/enviar';
import { NIVELES } from '@/data/reto';
import { supabaseServidor } from '@/lib/supabase/servidor';

interface Alumno {
  id: string; nombre: string; correo: string; rol: 'alumno' | 'admin'; creado_en: string; acepta_novedades: boolean;
  pais: string | null; primer_nivel: string | null; primer_puntaje: number | null; ultimo_nivel: string | null; ultimo_puntaje: number | null; retos_completos: number;
}

const fecha = (d: string) => new Intl.DateTimeFormat('es', { dateStyle: 'medium' }).format(new Date(d));
type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function AlumnosPage({ searchParams }: Props) {
  const q = await searchParams;
  const filtros = { busqueda: q.busqueda ?? '', nivel: q.nivel ?? '', desde: q.desde ?? '', hasta: q.hasta ?? '' };
  const supabase = await supabaseServidor();
  let alumnos: Alumno[] = [];
  if (supabase) {
    const { data } = await supabase.rpc('admin_alumnos', {
      p_busqueda: filtros.busqueda || null, p_nivel: filtros.nivel || null, p_desde: filtros.desde || null, p_hasta: filtros.hasta || null,
    });
    alumnos = (data as Alumno[]) ?? [];
  }
  const consulta = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v)).toString();
  const enlace = (tipo: string, formato: string) => `/admin/exportar/${tipo}?formato=${formato}${consulta ? '&' + consulta : ''}`;

  return <>
    <header className="admin-cabecera">
      <h1>Alumnos</h1>
      <p>Consulta quién se ha registrado, su nivel en el Reto y descarga la información.</p>
    </header>

    <form className="admin-filtros" method="get">
      <label className="editor-campo"><span className="editor-etiqueta">Buscar por nombre o correo</span><input name="busqueda" defaultValue={filtros.busqueda} placeholder="Ej.: maría o @gmail.com" /></label>
      <label className="editor-campo"><span className="editor-etiqueta">Nivel inicial</span>
        <select name="nivel" defaultValue={filtros.nivel}><option value="">Todos</option>{NIVELES.map(n => <option key={n.nombre}>{n.nombre}</option>)}<option>Sin reto</option></select></label>
      <label className="editor-campo"><span className="editor-etiqueta">Registrados desde</span><input type="date" name="desde" defaultValue={filtros.desde} /></label>
      <label className="editor-campo"><span className="editor-etiqueta">Hasta</span><input type="date" name="hasta" defaultValue={filtros.hasta} /></label>
      <div className="admin-filtros-botones">
        <button className="btn btn-green btn-sm"><Search size={16} aria-hidden="true" /> Filtrar</button>
        {consulta && <a href="/admin/alumnos" className="btn btn-outline btn-sm">Quitar filtros</a>}
      </div>
    </form>

    <div className="admin-barra-tabla">
      <p><strong>{alumnos.length}</strong> {alumnos.length === 1 ? 'persona' : 'personas'}{consulta ? ' con estos filtros' : ' en total'}</p>
      <div className="admin-botones">
        <a className="btn btn-green btn-sm" href={enlace('alumnos', 'xlsx')}><Download size={16} aria-hidden="true" /> Descargar Excel</a>
        <a className="btn btn-outline btn-sm" href={enlace('alumnos', 'csv')}><Download size={16} aria-hidden="true" /> CSV</a>
        <a className="btn btn-outline btn-sm" href={enlace('reto', 'xlsx')}><Download size={16} aria-hidden="true" /> Detalle de cada intento del Reto</a>
        <CrearAlumno disponible={envioPropio} />
      </div>
    </div>

    {alumnos.length === 0
      ? <p className="admin-vacio">{supabase ? 'No hay alumnos que coincidan.' : 'Cuando Supabase esté conectado, aquí aparecerán los alumnos registrados.'}</p>
      : <div className="admin-tabla-contenedor"><table className="admin-tabla">
        <thead><tr><th>Nombre</th><th>Correo</th><th>Registro</th><th>Nivel inicial</th><th>Nivel actual</th><th>Novedades</th><th><span className="sr-only">Acciones</span></th></tr></thead>
        <tbody>{alumnos.map(a => <tr key={a.id}>
          <td data-titulo="Nombre"><strong>{a.nombre}</strong>{a.rol === 'admin' && <span className="admin-insignia">Administración</span>}{a.pais && <small>{a.pais}</small>}</td>
          <td data-titulo="Correo"><a href={`mailto:${a.correo}`}>{a.correo}</a></td>
          <td data-titulo="Registro">{fecha(a.creado_en)}</td>
          <td data-titulo="Nivel inicial">{a.primer_nivel ? `${a.primer_nivel} (${a.primer_puntaje}/20)` : <span className="admin-tenue">Sin reto</span>}</td>
          <td data-titulo="Nivel actual">{a.ultimo_nivel && a.retos_completos > 1 ? `${a.ultimo_nivel} (${a.ultimo_puntaje}/20)` : <span className="admin-tenue">—</span>}</td>
          <td data-titulo="Novedades">{a.acepta_novedades ? 'Sí' : 'No'}</td>
          <td><AccionesAlumno id={a.id} nombre={a.nombre} esAdmin={a.rol === 'admin'} /></td>
        </tr>)}</tbody>
      </table></div>}
  </>;
}
