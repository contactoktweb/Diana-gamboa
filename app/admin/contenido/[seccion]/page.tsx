import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import EditorSeccion from '@/components/admin/EditorSeccion';
import { seccionPorId } from '@/lib/contenido/esquema';
import { PREDETERMINADO, type NombreSeccion } from '@/lib/contenido/predeterminado';
import { supabaseServidor } from '@/lib/supabase/servidor';

type Props = { params: Promise<{ seccion: string }> };

export default async function EditarSeccionPage({ params }: Props) {
  const { seccion } = await params;
  const def = seccionPorId(seccion);
  if (!def) notFound();
  const base = PREDETERMINADO[seccion as NombreSeccion] as Record<string, unknown>;
  const supabase = await supabaseServidor();
  let guardado: Record<string, unknown> = {};
  let historial: { id: number; guardado_en: string }[] = [];
  if (supabase) {
    // Se lee directamente de la base de datos (sin caché) para editar siempre la última versión.
    const [c, h] = await Promise.all([
      supabase.from('contenido').select('datos').eq('seccion', seccion).maybeSingle(),
      supabase.from('contenido_historial').select('id, guardado_en').eq('seccion', seccion).order('guardado_en', { ascending: false }).limit(15),
    ]);
    guardado = (c.data?.datos as Record<string, unknown>) ?? {};
    historial = (h.data as typeof historial) ?? [];
  }
  const datos = { ...base, ...Object.fromEntries(Object.entries(guardado).filter(([k]) => k in base)) };
  return <>
    <Link href="/admin/contenido" className="back-link"><ArrowLeft size={18} aria-hidden="true" /> Todas las secciones</Link>
    <header className="admin-cabecera">
      <h1>{def.titulo}</h1>
      <p>{def.descripcion}</p>
    </header>
    <EditorSeccion seccion={def.id} campos={def.campos} inicial={datos} ver={def.ver} historial={historial} />
  </>;
}
