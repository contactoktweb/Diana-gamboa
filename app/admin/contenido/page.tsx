import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { SECCIONES } from '@/lib/contenido/esquema';
import { supabaseServidor } from '@/lib/supabase/servidor';

const fecha = (d: string) => new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d));

export default async function ContenidoPage() {
  const supabase = await supabaseServidor();
  const { data } = supabase ? await supabase.from('contenido').select('seccion, actualizado_en') : { data: [] };
  const editado = new Map((data ?? []).map(f => [f.seccion as string, f.actualizado_en as string]));
  return <>
    <header className="admin-cabecera">
      <h1>Contenido de la web</h1>
      <p>Elige qué parte de la web quieres cambiar. Los cambios se publican al instante al pulsar «Guardar y publicar».</p>
    </header>
    <ul className="admin-secciones">
      {SECCIONES.map(s => <li key={s.id}>
        <Link href={`/admin/contenido/${s.id}`} className="admin-tarjeta">
          <div>
            <h2>{s.titulo}</h2>
            <p>{s.descripcion}</p>
            <small>{editado.has(s.id) ? `Última edición: ${fecha(editado.get(s.id)!)}` : 'Contenido original'}</small>
          </div>
          <span className="admin-tarjeta-ir">Editar <ArrowRight size={18} aria-hidden="true" /></span>
        </Link>
        <a href={s.ver} target="_blank" rel="noopener noreferrer" className="admin-ver"><ExternalLink size={16} aria-hidden="true" /> Ver en la web</a>
      </li>)}
    </ul>
  </>;
}
