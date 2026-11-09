import { GestorRecursos, GestorSeries } from '@/components/admin/GestorAcademia';
import { getContenido } from '@/lib/contenido';

export const dynamic = 'force-dynamic';

export default async function AcademiaPage() {
  const { rutas, biblioteca } = await getContenido();
  return <>
    <header className="admin-cabecera">
      <h1>Clases y recursos</h1>
      <p>Añade playlists y videos de YouTube, cambia su orden y sube los PDF de la biblioteca. Al guardar, el Portal del Alumno se actualiza al instante.</p>
    </header>
    <GestorSeries inicial={rutas.secciones} />
    <div id="recursos" />
    <GestorRecursos inicial={biblioteca.recursos} />
  </>;
}
