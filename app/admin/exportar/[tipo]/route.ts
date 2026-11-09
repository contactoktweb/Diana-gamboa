import { NextResponse, type NextRequest } from 'next/server';
import { CATEGORIAS, type Categoria } from '@/data/reto';
import { crearCsv, crearXlsx } from '@/lib/excel';
import { getSesion } from '@/lib/sesion';
import { supabaseServidor } from '@/lib/supabase/servidor';

const fecha = (d: string | null) => (d ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Bogota' }).format(new Date(d)) : '');
const fechaParam = (v: string | null) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

/** Descargas de la administración: alumnos, detalle del reto y lista de novedades. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ tipo: string }> }) {
  const { tipo } = await params;
  const supabase = await supabaseServidor();
  const sesion = await getSesion();
  if (!supabase || sesion?.perfil?.rol !== 'admin') return new NextResponse('No autorizado', { status: 403 });

  const q = request.nextUrl.searchParams;
  const filtros = { p_busqueda: q.get('busqueda') || null, p_nivel: q.get('nivel') || null, p_desde: fechaParam(q.get('desde')), p_hasta: fechaParam(q.get('hasta')) };
  let encabezados: string[] = [];
  let filas: (string | number | boolean | null)[][] = [];
  let nombre = '';

  if (tipo === 'alumnos' || tipo === 'novedades') {
    const { data, error } = await supabase.rpc('admin_alumnos', filtros);
    if (error) return new NextResponse(error.message, { status: 500 });
    type Fila = Record<string, unknown> & { por_categoria?: Record<string, { aciertos: number; total: number }> };
    let lista = (data ?? []) as Fila[];
    if (tipo === 'novedades') {
      lista = lista.filter(a => a.acepta_novedades);
      encabezados = ['Nombre', 'Correo', 'Fecha de registro'];
      filas = lista.map(a => [a.nombre as string, a.correo as string, fecha(a.creado_en as string)]);
      nombre = 'lista-novedades';
    } else {
      const cats = Object.keys(CATEGORIAS) as Categoria[];
      encabezados = ['Nombre', 'Correo', 'Rol', 'Fecha de registro', 'Acepta novedades', 'País', 'Experiencia declarada', 'Intereses',
        'Nivel inicial (primer reto)', 'Puntaje inicial', ...cats.map(c => `${CATEGORIAS[c].nombre} (aciertos)`), 'Nivel actual (último reto)', 'Puntaje actual', 'Retos completados', 'Último reto'];
      filas = lista.map(a => {
        const pc = a.primer_por_categoria as Record<string, { aciertos: number; total: number }> | null;
        return [a.nombre as string, a.correo as string, a.rol === 'admin' ? 'Administración' : 'Alumno', fecha(a.creado_en as string), Boolean(a.acepta_novedades),
          (a.pais as string) ?? '', (a.experiencia as string) ?? '', (a.intereses as string) ?? '',
          (a.primer_nivel as string) ?? 'Sin reto', (a.primer_puntaje as number) ?? null,
          ...cats.map(c => (pc?.[c] ? `${pc[c].aciertos}/${pc[c].total}` : '')),
          (a.ultimo_nivel as string) ?? '', (a.ultimo_puntaje as number) ?? null, Number(a.retos_completos ?? 0), fecha(a.ultimo_reto as string | null)];
      });
      nombre = 'alumnos';
    }
  } else if (tipo === 'reto') {
    const { data, error } = await supabase.rpc('admin_reto_detalle', { p_desde: filtros.p_desde, p_hasta: filtros.p_hasta });
    if (error) return new NextResponse(error.message, { status: 500 });
    encabezados = ['Intento', 'Fecha', 'Primer reto de la persona', 'Completo', 'Nombre', 'Correo', 'Experiencia declarada', 'Puntaje', 'Nivel', 'Tema', 'Pregunta', 'Acierto al primer intento', 'Intentos'];
    filas = ((data ?? []) as Record<string, unknown>[]).map(r => [String(r.intento_id).slice(0, 8), fecha(r.inicio as string), Boolean(r.primer_intento), Boolean(r.completo),
      r.nombre as string, (r.correo as string) ?? '', (r.experiencia as string) ?? '', (r.puntaje as number) ?? null, (r.nivel as string) ?? '',
      CATEGORIAS[r.categoria as Categoria]?.nombre ?? String(r.categoria), r.item as string, Boolean(r.acierto_primer_intento), Number(r.intentos)]);
    nombre = 'reto-detalle';
  } else {
    return new NextResponse('Descarga desconocida', { status: 404 });
  }

  const hoy = new Date().toISOString().slice(0, 10);
  if (q.get('formato') === 'csv') {
    return new NextResponse(crearCsv(encabezados, filas), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${nombre}-${hoy}.csv"`, 'Cache-Control': 'no-store' } });
  }
  return new NextResponse(Buffer.from(crearXlsx(nombre, encabezados, filas)), {
    headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="${nombre}-${hoy}.xlsx"`, 'Cache-Control': 'no-store' },
  });
}
