import Link from 'next/link';
import { Download } from 'lucide-react';
import { CATEGORIAS, NIVELES, type Categoria } from '@/data/reto';
import { getContenido } from '@/lib/contenido';
import { supabaseServidor } from '@/lib/supabase/servidor';

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

/** Nombre legible de cada pregunta del reto (por ejemplo «velas-bajista-cierre»). */
function nombreItem(item: string) {
  const p = item.split('-');
  const parte: Record<string, string> = { apertura: 'apertura', cierre: 'cierre', maximo: 'máximo', minimo: 'mínimo' };
  if (p[0] === 'velas') return `Vela ${p[1]}: ${parte[p[2]] ?? p[2]}`;
  if (p[0] === 'movimiento') return `Movimiento ${p[2]} (ejercicio ${p[1]})`;
  if (p[0] === 'tendencia') return `Línea de tendencia ${p[1]}`;
  if (p[0] === 'niveles') return `Nivel de ${p[1]}`;
  const medias: Record<string, string> = { 'medias-mas-rapida': 'Media más rápida', 'medias-identifica-ema8': 'Identificar la EMA 8', 'medias-identifica-ema21': 'Identificar la EMA 21', 'medias-identifica-ema21-b': 'Identificar la EMA 21 (2.ª gráfica)', 'medias-lectura': 'Lectura de las medias' };
  return medias[item] ?? item;
}

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
  if (supabase) {
    const { data } = await supabase.rpc('admin_resumen');
    if (data) r = { ...VACIO, ...(data as Resumen) };
  }
  const nombreSeccion = (slug: string) => rutas.secciones.find(s => s.slug === slug)?.titulo ?? (slug === 'salon' ? 'Salón Diana Gamboa' : slug);
  const totalNiveles = Object.values(r.niveles).reduce((a, b) => a + b, 0);
  const pct = (a: number, t: number) => (t ? Math.round((a / t) * 100) : 0);

  return <>
    <header className="admin-cabecera">
      <h1>Resumen de la academia</h1>
      <p>Cómo crece la academia y qué necesitan aprender tus alumnos.</p>
    </header>

    <section className="cifras" aria-label="Cifras principales">
      <div className="cifra"><span>Alumnos registrados</span><strong>{r.alumnos}</strong><small>+{r.alumnos_7d} en los últimos 7 días · +{r.alumnos_30d} en 30 días</small></div>
      <div className="cifra"><span>Aceptan novedades por correo</span><strong>{r.novedades}</strong><small>{pct(r.novedades, r.alumnos)} % de los alumnos</small></div>
      <div className="cifra"><span>Retos completados</span><strong>{r.retos_completos}</strong><small>{r.alumnos_con_reto} alumnos · {r.visitantes_con_reto} visitantes sin cuenta</small></div>
      <div className="cifra"><span>Retos abandonados</span><strong>{r.retos_abandonados}</strong><small>Empezados y no terminados</small></div>
    </section>

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
