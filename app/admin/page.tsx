import Link from 'next/link';
import { ArrowRight, Download } from 'lucide-react';
import { CATEGORIAS, NIVELES, type Categoria } from '@/data/reto';
import { getContenido } from '@/lib/contenido';
import { supabaseServidor } from '@/lib/supabase/servidor';
import { nombreItem } from '@/lib/reto/nombres';

interface Resumen {
  alumnos: number; alumnos_7d: number; alumnos_30d: number; novedades: number;
  retos_completos: number; retos_abandonados: number; alumnos_con_reto: number; visitantes_con_reto: number;
  niveles: Record<string, number>;
  categorias: Record<string, { aciertos: number; total: number }>;
  items: { item: string; categoria: string; fallos: number; total: number }[];
  experiencia: { experiencia: string; n: number; promedio: number }[];
  visitas: { referencia: string; n: number }[];
  descargas: { referencia: string; n: number }[];
  registros_semana: { semana: string; n: number }[];
}

const VACIO: Resumen = { alumnos: 0, alumnos_7d: 0, alumnos_30d: 0, novedades: 0, retos_completos: 0, retos_abandonados: 0, alumnos_con_reto: 0, visitantes_con_reto: 0, niveles: {}, categorias: {}, items: [], experiencia: [], visitas: [], descargas: [], registros_semana: [] };

/** Barras horizontales de una sola serie: el valor siempre escrito junto a la barra. */
function Barras({ filas, sufijo = '', vacio }: { filas: { etiqueta: string; valor: number; detalle?: string }[]; sufijo?: string; vacio: string }) {
  if (!filas.length) return <p className="admin-vacio">{vacio}</p>;
  const max = Math.max(...filas.map(f => f.valor), 1);
  return <ul className="barras">{filas.map(f => <li key={f.etiqueta} title={`${f.etiqueta}: ${f.valor}${sufijo}${f.detalle ? ` · ${f.detalle}` : ''}`}>
    <span className="barras-etiqueta">{f.etiqueta}</span>
    <span className="barras-pista"><span className="barras-barra" style={{ width: `${Math.max(2, (f.valor / max) * 100)}%` }} /></span>
    <span className="barras-valor">{f.valor}{sufijo}{f.detalle && <small>{f.detalle}</small>}</span>
  </li>)}</ul>;
}

export default async function ResumenPage() {
  const supabase = await supabaseServidor();
  const { rutas, biblioteca } = await getContenido();
  let r = VACIO;
  let ultimos: { id: string; nombre: string; correo: string; creado_en: string; primer_nivel: string | null; primer_puntaje: number | null }[] = [];
  let partidas: { id: string; usuario_id: string | null; inicio: string; puntaje: number | null; nivel: string | null }[] = [];
  const nombres = new Map<string, string>();
  if (supabase) {
    const [res, al, pa] = await Promise.all([
      supabase.rpc('admin_resumen'),
      supabase.rpc('admin_alumnos'),
      supabase.from('reto_intentos').select('id,usuario_id,inicio,puntaje,nivel').eq('completo', true).order('inicio', { ascending: false }).limit(6),
    ]);
    if (res.data) r = { ...VACIO, ...(res.data as Resumen) };
    ultimos = ([...((al.data ?? []) as typeof ultimos)]).sort((a, b) => b.creado_en.localeCompare(a.creado_en)).slice(0, 6);
    partidas = (pa.data ?? []) as typeof partidas;
    const ids = [...new Set(partidas.map(p => p.usuario_id).filter(Boolean))] as string[];
    if (ids.length) {
      const { data } = await supabase.from('perfiles').select('id,nombre').in('id', ids);
      for (const x of data ?? []) nombres.set(x.id as string, x.nombre as string);
    }
  }
  const cuando = (d: string) => new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
  const nombreSeccion = (slug: string) => rutas.secciones.find(s => s.slug === slug)?.titulo ?? (slug === 'salon' ? 'Salón Diana Gamboa' : slug);
  const totalNiveles = Object.values(r.niveles).reduce((a, b) => a + b, 0);
  const pct = (a: number, t: number) => (t ? Math.round((a / t) * 100) : 0);

  return <>
    <header className="admin-cabecera">
      <h1>Resumen de la academia</h1>
      <p>Cómo crece la academia y qué necesitan aprender tus alumnos.</p>
    </header>

    <section className="cifras" aria-label="Cifras principales">
      <Link href="/admin/alumnos" className="cifra es-enlace"><span>Alumnos registrados</span><strong>{r.alumnos}</strong><small>+{r.alumnos_7d} en los últimos 7 días · +{r.alumnos_30d} en 30 días</small><em>Ver la lista <ArrowRight size={16} aria-hidden="true" /></em></Link>
      <Link href="/admin/correos" className="cifra es-enlace"><span>Aceptan novedades por correo</span><strong>{r.novedades}</strong><small>{pct(r.novedades, r.alumnos)} % de los alumnos</small><em>Ver y descargar <ArrowRight size={16} aria-hidden="true" /></em></Link>
      <Link href="/admin/reto" className="cifra es-enlace"><span>Retos completados</span><strong>{r.retos_completos}</strong><small>{r.alumnos_con_reto} alumnos · {r.visitantes_con_reto} visitantes sin cuenta</small><em>Ver resultados <ArrowRight size={16} aria-hidden="true" /></em></Link>
      <Link href="/admin/reto?estado=sin-terminar" className="cifra es-enlace"><span>Retos abandonados</span><strong>{r.retos_abandonados}</strong><small>Empezados y no terminados</small><em>Ver cuáles <ArrowRight size={16} aria-hidden="true" /></em></Link>
    </section>

    <div className="admin-rejilla">
      <section className="admin-panel">
        <h2>Últimos alumnos registrados</h2>
        {ultimos.length === 0 ? <p className="admin-vacio">Aún no hay alumnos registrados.</p>
          : <ul className="recientes">{ultimos.map(a => <li key={a.id}>
            <div><strong>{a.nombre}</strong><small>{a.correo}</small></div>
            <span>{a.primer_nivel ? `${a.primer_nivel} · ${a.primer_puntaje}/20` : 'Sin reto'}<small>{cuando(a.creado_en)}</small></span>
          </li>)}</ul>}
        <Link href="/admin/alumnos" className="btn btn-green btn-sm">Ver todos los alumnos <ArrowRight size={16} aria-hidden="true" /></Link>
      </section>
      <section className="admin-panel">
        <h2>Últimos retos completados</h2>
        {partidas.length === 0 ? <p className="admin-vacio">Aún nadie ha completado el reto.</p>
          : <ul className="recientes">{partidas.map(x => <li key={x.id}>
            <div><strong>{x.usuario_id ? nombres.get(x.usuario_id) ?? 'Alumno' : 'Visitante sin cuenta'}</strong><small>{cuando(x.inicio)}</small></div>
            <span><b>{x.puntaje ?? 0}/20</b><small>{x.nivel}</small></span>
            <Link href={`/admin/reto/${x.id}`} className="recientes-ver" aria-label="Ver respuestas"><ArrowRight size={18} aria-hidden="true" /></Link>
          </li>)}</ul>}
        <Link href="/admin/reto" className="btn btn-green btn-sm">Ver todos los resultados <ArrowRight size={16} aria-hidden="true" /></Link>
      </section>
    </div>

    <div className="admin-rejilla">
      <section className="admin-panel">
        <h2>Nivel con el que llegan</h2>
        <p className="admin-nota">Primer reto completado de cada persona.</p>
        <Barras vacio="Aún nadie ha completado el reto." filas={NIVELES.map(n => ({ etiqueta: n.nombre, valor: r.niveles[n.nombre] ?? 0, detalle: `${pct(r.niveles[n.nombre] ?? 0, totalNiveles)} %` })).filter(() => totalNiveles > 0)} />
      </section>

      <section className="admin-panel">
        <h2>Aciertos por tema</h2>
        <p className="admin-nota">Porcentaje de respuestas correctas al primer intento.</p>
        <Barras sufijo=" %" vacio="Todavía no hay respuestas." filas={(Object.keys(CATEGORIAS) as Categoria[]).filter(c => r.categorias[c]).map(c => ({ etiqueta: CATEGORIAS[c].nombre, valor: pct(r.categorias[c].aciertos, r.categorias[c].total), detalle: `${r.categorias[c].aciertos} de ${r.categorias[c].total}` }))} />
      </section>

      <section className="admin-panel admin-panel-ancho">
        <h2>Preguntas en las que más se equivocan</h2>
        <p className="admin-nota">Útil para decidir qué clases o materiales preparar.</p>
        <Barras sufijo=" % fallan" vacio="Todavía no hay respuestas." filas={r.items.slice(0, 8).map(i => ({ etiqueta: nombreItem(i.item), valor: pct(i.fallos, i.total), detalle: `${i.fallos} de ${i.total}` }))} />
      </section>

      <section className="admin-panel">
        <h2>Experiencia declarada y puntaje</h2>
        <p className="admin-nota">Puntaje promedio (de 20) según lo que respondieron antes de empezar.</p>
        <Barras vacio="Todavía no hay datos." filas={r.experiencia.map(e => ({ etiqueta: e.experiencia, valor: Number(e.promedio), detalle: `${e.n} personas` }))} />
      </section>

      <section className="admin-panel">
        <h2>Secciones más visitadas del portal</h2>
        <Barras vacio="Todavía no hay visitas registradas." filas={r.visitas.slice(0, 8).map(v => ({ etiqueta: nombreSeccion(v.referencia), valor: v.n }))} />
      </section>

      <section className="admin-panel">
        <h2>Recursos más descargados</h2>
        <Barras vacio={biblioteca.recursos.some(x => x.archivo) ? 'Todavía no hay descargas.' : 'Aún no hay PDF publicados en la Biblioteca.'} filas={r.descargas.slice(0, 8).map(v => ({ etiqueta: v.referencia, valor: v.n }))} />
      </section>

      <section className="admin-panel">
        <h2>Nuevos alumnos por semana</h2>
        <p className="admin-nota">Últimas 12 semanas (fecha del lunes de cada semana).</p>
        <Barras vacio="Todavía no hay registros." filas={r.registros_semana.map(s => ({ etiqueta: new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(new Date(s.semana + 'T12:00:00')), valor: s.n }))} />
      </section>
    </div>

    <section className="admin-panel admin-descargas">
      <h2>Descargar datos</h2>
      <div className="admin-botones">
        <a className="btn btn-green btn-sm" href="/admin/exportar/alumnos?formato=xlsx"><Download size={16} aria-hidden="true" /> Alumnos (Excel)</a>
        <a className="btn btn-outline btn-sm" href="/admin/exportar/reto?formato=xlsx"><Download size={16} aria-hidden="true" /> Detalle del Reto (Excel)</a>
        <Link className="btn btn-outline btn-sm" href="/admin/alumnos">Ver y filtrar alumnos</Link>
      </div>
      <p className="admin-nota">Para el comportamiento de los visitantes en la web (clics, recorridos, grabaciones), usa Microsoft Clarity: configúralo en «Contenido de la web › Información general».</p>
    </section>
  </>;
}
