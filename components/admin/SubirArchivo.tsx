'use client';

import { useRef, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { supabaseNavegador } from '@/lib/supabase/cliente';
import { BUCKET } from '@/lib/supabase/config';

const MAX_MB = 20;

/** Sube una imagen o un archivo a Supabase Storage y devuelve su dirección pública. */
export default function SubirArchivo({ tipo, valor, onChange, oscuro }: { tipo: 'imagen' | 'archivo'; valor: string; onChange: (url: string) => void; oscuro?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<'' | 'subiendo' | string>('');

  async function subir(file: File) {
    const sb = supabaseNavegador();
    if (!sb) { setEstado('Supabase no está conectado: no se pueden subir archivos todavía.'); return; }
    if (file.size > MAX_MB * 1024 * 1024) { setEstado(`El archivo pesa más de ${MAX_MB} MB.`); return; }
    setEstado('subiendo');
    const nombre = file.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9.]+/g, '-').toLowerCase();
    const ruta = `${tipo === 'imagen' ? 'imagenes' : 'archivos'}/${Date.now()}-${nombre}`;
    const { error } = await sb.storage.from(BUCKET).upload(ruta, file, { contentType: file.type, cacheControl: '31536000' });
    if (error) { setEstado('No se pudo subir: ' + error.message); return; }
    onChange(sb.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl);
    setEstado('');
  }

  const nombreArchivo = valor ? decodeURIComponent(valor.split('/').pop() ?? '').replace(/^\d+-/, '') : '';
  return <div className="subir">
    {valor && (tipo === 'imagen'
      // eslint-disable-next-line @next/next/no-img-element
      ? <img src={valor} alt="" className={`subir-vista ${oscuro ? 'es-oscuro' : ''}`} />
      : <a href={valor} target="_blank" rel="noopener noreferrer" className="subir-archivo"><FileText size={20} aria-hidden="true" /> {nombreArchivo}</a>)}
    <div className="subir-acciones">
      <button type="button" className="btn btn-outline btn-sm" onClick={() => input.current?.click()} disabled={estado === 'subiendo'}>
        <Upload size={16} aria-hidden="true" /> {estado === 'subiendo' ? 'Subiendo…' : valor ? 'Cambiar' : tipo === 'imagen' ? 'Subir imagen' : 'Subir archivo'}
      </button>
      {valor && tipo === 'archivo' && <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange('')}><X size={16} aria-hidden="true" /> Quitar archivo</button>}
    </div>
    <input ref={input} type="file" hidden accept={tipo === 'imagen' ? 'image/png,image/jpeg,image/webp,image/svg+xml' : '.pdf,.xlsx,.xls,.docx,.doc,.pptx,.zip,.png,.jpg'}
      onChange={e => { const f = e.target.files?.[0]; if (f) void subir(f); e.target.value = ''; }} />
    {estado && estado !== 'subiendo' && <p className="subir-error" role="alert">{estado}</p>}
  </div>;
}
