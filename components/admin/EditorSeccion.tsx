'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useId, useState, useTransition } from 'react';
import { ChevronDown, ChevronUp, Copy, ExternalLink, History, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import type { Campo } from '@/lib/contenido/esquema';
import { guardarSeccion, restablecerOriginal, restaurarVersion } from '@/app/admin/acciones';
import SubirArchivo from './SubirArchivo';

type Datos = Record<string, unknown>;
const fecha = (d: string) => new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d));

/** Valor vacío para un nuevo elemento de una lista. */
function vacio(campos: Campo[]): Datos {
  return Object.fromEntries(campos.filter(c => c.tipo !== 'titulo').map(c => [c.clave,
    c.tipo === 'booleano' ? (c.clave === 'visible') : c.tipo === 'lista' ? [] : c.tipo === 'opciones' ? c.opciones?.[0]?.valor ?? '' : '']));
}

/** Formulario de edición de una sección del contenido. */
export default function EditorSeccion({ seccion, campos, inicial, ver, historial }: {
  seccion: string; campos: Campo[]; inicial: Datos; ver: string; historial: { id: number; guardado_en: string }[];
}) {
  const router = useRouter();
  const [datos, setDatos] = useState<Datos>(inicial);
  const [sucio, setSucio] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [pendiente, iniciar] = useTransition();

  // Aviso al salir con cambios sin guardar.
  useEffect(() => {
    if (!sucio) return;
    const aviso = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', aviso);
    return () => window.removeEventListener('beforeunload', aviso);
  }, [sucio]);

  const cambiar = (nuevo: Datos) => { setDatos(nuevo); setSucio(true); setMensaje(null); };

  function guardar() {
    iniciar(async () => {
      const r = await guardarSeccion(seccion, datos);
      if (r.ok) { setSucio(false); setMensaje({ tipo: 'ok', texto: 'Guardado. Los cambios ya están publicados en la web.' }); router.refresh(); }
      else setMensaje({ tipo: 'error', texto: r.error });
    });
  }
  function restaurar(id: number) {
    if (!confirm('¿Volver a esta versión? La versión actual quedará guardada en el historial.')) return;
    iniciar(async () => {
      const r = await restaurarVersion(seccion, id);
      setMensaje(r.ok ? { tipo: 'ok', texto: 'Versión restaurada y publicada.' } : { tipo: 'error', texto: r.error });
      if (r.ok) { router.refresh(); window.location.reload(); }
    });
  }
  function original() {
    if (!confirm('¿Volver a los textos originales de esta sección? Lo que has guardado quedará en el historial por si lo necesitas.')) return;
    iniciar(async () => {
      const r = await restablecerOriginal(seccion);
      setMensaje(r.ok ? { tipo: 'ok', texto: 'Se restableció el contenido original.' } : { tipo: 'error', texto: r.error });
      if (r.ok) window.location.reload();
    });
  }

  return <div className="editor">
    <div className="editor-campos">
      <Campos campos={campos} datos={datos} onChange={cambiar} />
    </div>

    <div className="editor-barra" role="region" aria-label="Guardar cambios">
      <div className="editor-estado" aria-live="polite">
        {mensaje ? <span className={mensaje.tipo === 'ok' ? 'es-ok' : 'es-error'}>{mensaje.texto}</span>
          : sucio ? <span className="es-pendiente">Tienes cambios sin guardar.</span> : <span>Sin cambios pendientes.</span>}
      </div>
      <a href={ver} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm"><ExternalLink size={16} aria-hidden="true" /> Ver en la web</a>
      <button type="button" className="btn btn-green" onClick={guardar} disabled={pendiente || !sucio}><Save size={18} aria-hidden="true" /> {pendiente ? 'Guardando…' : 'Guardar y publicar'}</button>
    </div>

    <details className="editor-historial">
      <summary><History size={18} aria-hidden="true" /> Historial y versiones anteriores</summary>
      {historial.length === 0 ? <p>Todavía no hay versiones anteriores de esta sección.</p>
        : <ul>{historial.map(h => <li key={h.id}><span>Versión del {fecha(h.guardado_en)}</span><button type="button" className="btn btn-outline btn-sm" onClick={() => restaurar(h.id)} disabled={pendiente}>Restaurar</button></li>)}</ul>}
      <button type="button" className="btn btn-outline btn-sm editor-original" onClick={original} disabled={pendiente}><RotateCcw size={16} aria-hidden="true" /> Volver al contenido original</button>
    </details>
  </div>;
}

/** Lista de campos (se usa también dentro de cada elemento de una lista). */
function Campos({ campos, datos, onChange }: { campos: Campo[]; datos: Datos; onChange: (d: Datos) => void }) {
  return <>{campos.filter(c => !c.mostrarSi || c.mostrarSi.valores.includes(String(datos[c.mostrarSi.clave] ?? ''))).map((c, i) => c.tipo === 'titulo'
    ? <h2 key={i} className="editor-grupo">{c.etiqueta}</h2>
    : <CampoEditor key={`${c.clave}-${i}`} campo={c} valor={datos[c.clave]} onChange={v => onChange({ ...datos, [c.clave]: v })} />)}</>;
}

function CampoEditor({ campo: c, valor, onChange }: { campo: Campo; valor: unknown; onChange: (v: unknown) => void }) {
  const id = useId();
  const ayuda = c.ayuda && <small className="editor-ayuda">{c.ayuda}</small>;
  const texto = typeof valor === 'string' ? valor : '';

  switch (c.tipo) {
    case 'booleano':
      return <label className="editor-check"><input type="checkbox" checked={Boolean(valor)} onChange={e => onChange(e.target.checked)} /> <span>{c.etiqueta}</span>{ayuda}</label>;
    case 'opciones':
      return <div className="editor-campo"><label htmlFor={id}>{c.etiqueta}</label>
        <select id={id} value={texto} onChange={e => onChange(e.target.value)}>{c.opciones?.map(o => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}</select>{ayuda}</div>;
    case 'parrafos':
    case 'largo':
      return <div className="editor-campo"><label htmlFor={id}>{c.etiqueta}</label>
        <textarea id={id} value={texto} rows={c.tipo === 'largo' ? 18 : Math.min(10, Math.max(3, texto.split('\n').length + 1))} onChange={e => onChange(e.target.value)} />{ayuda}</div>;
    case 'imagen':
    case 'archivo':
      return <div className="editor-campo"><span className="editor-etiqueta">{c.etiqueta}</span>
        <SubirArchivo tipo={c.tipo} valor={texto} onChange={onChange} />{ayuda}</div>;
    case 'lista':
      return <EditorLista campo={c} valor={Array.isArray(valor) ? valor as Datos[] : []} onChange={onChange} />;
    default:
      return <div className="editor-campo"><label htmlFor={id}>{c.etiqueta}</label>
        <input id={id} type={c.tipo === 'url' ? 'url' : c.tipo === 'correo' ? 'email' : 'text'} value={texto} readOnly={c.soloLectura} onChange={e => onChange(e.target.value)}
          placeholder={c.tipo === 'url' ? 'https://…' : undefined} />{ayuda}</div>;
  }
}

function EditorLista({ campo: c, valor, onChange }: { campo: Campo; valor: Datos[]; onChange: (v: Datos[]) => void }) {
  const [abierto, setAbierto] = useState<number | null>(null);
  const campos = c.campos ?? [];
  const mover = (i: number, d: number) => {
    const j = i + d; if (j < 0 || j >= valor.length) return;
    const copia = [...valor]; [copia[i], copia[j]] = [copia[j], copia[i]]; onChange(copia);
    if (abierto === i) setAbierto(j);
  };
  const titulo = (item: Datos, i: number) => {
    const t = String(item[c.tituloDe ?? ''] ?? '').replace(/\*\*/g, '').trim();
    // En la historia de «Sobre Diana» se indica el tipo de bloque (párrafo, foto…).
    const tipo = c.clave === 'bloques' && campos.find(x => x.clave === 'tipo')?.opciones?.find(o => o.valor === item.tipo)?.etiqueta;
    return [tipo, t ? (t.length > 70 ? t.slice(0, 70) + '…' : t) : `${c.elemento ?? 'Elemento'} ${i + 1}`].filter(Boolean).join(' · ');
  };
  return <fieldset className="editor-lista">
    <legend>{c.etiqueta} <small>({valor.length})</small></legend>
    {c.ayuda && <small className="editor-ayuda">{c.ayuda}</small>}
    <ol>
      {valor.map((item, i) => <li key={i} className={abierto === i ? 'is-abierto' : ''}>
        <div className="editor-item-cabecera">
          <button type="button" className="editor-item-titulo" onClick={() => setAbierto(abierto === i ? null : i)} aria-expanded={abierto === i}>
            <span className="editor-item-num">{i + 1}</span> {titulo(item, i)}
          </button>
          <div className="editor-item-acciones">
            <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir"><ChevronUp size={18} /></button>
            <button type="button" onClick={() => mover(i, 1)} disabled={i === valor.length - 1} aria-label="Bajar"><ChevronDown size={18} /></button>
            <button type="button" onClick={() => { const copia = [...valor]; copia.splice(i + 1, 0, structuredClone(item)); onChange(copia); }} aria-label="Duplicar"><Copy size={16} /></button>
            <button type="button" className="es-peligro" onClick={() => { if (confirm(`¿Quitar «${titulo(item, i)}»?`)) { onChange(valor.filter((_, j) => j !== i)); setAbierto(null); } }} aria-label="Quitar"><Trash2 size={16} /></button>
          </div>
        </div>
        {abierto === i && <div className="editor-item-cuerpo">
          <Campos campos={campos} datos={item} onChange={d => onChange(valor.map((x, j) => j === i ? d : x))} />
        </div>}
      </li>)}
    </ol>
    <button type="button" className="btn btn-outline btn-sm" onClick={() => { onChange([...valor, vacio(campos)]); setAbierto(valor.length); }}>
      <Plus size={16} aria-hidden="true" /> Añadir {(c.elemento ?? 'elemento').toLowerCase()}
    </button>
  </fieldset>;
}
