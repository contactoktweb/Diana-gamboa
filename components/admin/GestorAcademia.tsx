'use client';

import { useEffect, useState, useTransition } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, ListVideo, Plus, Save, Trash2, Youtube } from 'lucide-react';
import SubirArchivo from '@/components/admin/SubirArchivo';
import { guardarSeccion } from '@/app/admin/acciones';
import { ICONOS } from '@/lib/contenido/esquema';
import type { Recurso, Seccion, Video } from '@/lib/contenido/predeterminado';
import { parseYouTube, urlOEmbed } from '@/lib/youtube';

/** Mueve un elemento de una lista hacia arriba (-1) o hacia abajo (+1). */
function mover<T>(lista: T[], i: number, paso: -1 | 1) {
  const j = i + paso;
  if (j < 0 || j >= lista.length) return lista;
  const copia = [...lista];
  [copia[i], copia[j]] = [copia[j], copia[i]];
  return copia;
}

const slugDe = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'serie';
const numerar = (s: Seccion[]) => s.map((x, i) => ({ ...x, numero: String(i + 1).padStart(2, '0') }));

/** Título y portada que YouTube publica para un enlace (video o playlist). */
function useDatosYouTube(url: string) {
  const [datos, setDatos] = useState<{ url: string; titulo: string; portada: string } | null>(null);
  useEffect(() => {
    const u = urlOEmbed(url);
    if (!u) return;
    let vigente = true;
    const t = setTimeout(() => {
      fetch(u).then(r => (r.ok ? r.json() : null)).then(d => { if (vigente && d) setDatos({ url, titulo: d.title ?? '', portada: d.thumbnail_url ?? '' }); }).catch(() => {});
    }, 300);
    return () => { vigente = false; clearTimeout(t); };
  }, [url]);
  return datos?.url === url ? datos : null;
}

function Miniatura({ url }: { url: string }) {
  const yt = parseYouTube(url);
  const datos = useDatosYouTube(yt && !yt.videoId ? url : '');
  const src = yt?.videoId ? `https://i.ytimg.com/vi/${yt.videoId}/mqdefault.jpg` : datos?.portada;
  // eslint-disable-next-line @next/next/no-img-element
  if (src) return <img className="gestor-mini" src={src} alt="" loading="lazy" />;
  return <span className="gestor-mini es-vacia"><ListVideo size={22} aria-hidden="true" /></span>;
}

function useAvisoSinGuardar(sucio: boolean) {
  useEffect(() => {
    if (!sucio) return;
    const f = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', f);
    return () => window.removeEventListener('beforeunload', f);
  }, [sucio]);
}

function BarraGuardar({ sucio, pendiente, mensaje, onGuardar }: { sucio: boolean; pendiente: boolean; mensaje: { ok: boolean; texto: string } | null; onGuardar: () => void }) {
  return <div className={`gestor-guardar ${sucio ? 'es-sucio' : ''}`}>
    {mensaje ? <p role="status" className={mensaje.ok ? 'es-ok' : 'es-error'}>{mensaje.texto}</p>
      : <p>{sucio ? 'Tienes cambios sin guardar.' : 'Todo está guardado.'}</p>}
    <button type="button" className="btn btn-green" onClick={onGuardar} disabled={!sucio || pendiente}><Save size={18} aria-hidden="true" /> {pendiente ? 'Guardando…' : 'Guardar y publicar'}</button>
  </div>;
}

/* ------------------------------------------------------------------ */
/* Series y playlists                                                  */
/* ------------------------------------------------------------------ */

export function GestorSeries({ inicial }: { inicial: Seccion[] }) {
  const [series, setSeries] = useState(inicial);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [sucio, setSucio] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendiente, iniciar] = useTransition();
  useAvisoSinGuardar(sucio);

  const cambiar = (s: Seccion[]) => { setSeries(numerar(s)); setSucio(true); setMensaje(null); };
  const editar = (i: number, d: Partial<Seccion>) => cambiar(series.map((s, k) => (k === i ? { ...s, ...d } : s)));

  function nuevaSerie() {
    const titulo = prompt('Nombre de la nueva serie o playlist (por ejemplo «Estrategias de entrada»):')?.trim();
    if (!titulo) return;
    let slug = slugDe(titulo);
    const usados = new Set(series.map(s => s.slug));
    for (let n = 2; usados.has(slug); n++) slug = `${slugDe(titulo)}-${n}`;
    const nueva: Seccion = { slug, numero: '', titulo, tituloPagina: '', resumen: '', intro: '', icono: 'clases', tipo: 'serie', boton: 'Ver clases', laboratorio: false, lives: false, recursos: false, visible: true, videos: [] };
    // Las series nuevas van antes de los recursos complementarios.
    const pos = series.findIndex(s => s.tipo === 'complemento');
    const lista = [...series];
    lista.splice(pos === -1 ? lista.length : pos, 0, nueva);
    cambiar(lista);
    setAbierta(slug);
  }

  function guardar() {
    const sinVideos = series.filter(s => s.visible && !s.recursos && !s.lives && s.videos.length === 0).map(s => s.titulo);
    if (sinVideos.length && !confirm(`Estas series visibles aún no tienen videos: ${sinVideos.join(', ')}. ¿Guardar de todos modos?`)) return;
    iniciar(async () => {
      const r = await guardarSeccion('rutas', { secciones: series });
      setMensaje(r.ok ? { ok: true, texto: 'Guardado. Ya se ve en el Portal del Alumno.' } : { ok: false, texto: r.error });
      if (r.ok) setSucio(false);
    });
  }

  return <section className="admin-panel gestor">
    <div className="gestor-cabeza">
      <div><h2>Series y playlists</h2><p className="admin-nota">Son las tarjetas del Portal del Alumno, en este orden. Dentro de cada una van sus videos o listas de YouTube.</p></div>
      <button type="button" className="btn btn-outline btn-sm" onClick={nuevaSerie}><Plus size={16} aria-hidden="true" /> Nueva serie</button>
    </div>

    <ol className="gestor-lista">{series.map((s, i) => {
      const abiertaEsta = abierta === s.slug;
      return <li key={s.slug} className={`gestor-serie ${s.visible ? '' : 'es-oculta'}`}>
        <div className="gestor-fila">
          <span className="gestor-num">{s.numero}</span>
          <button type="button" className="gestor-titulo" onClick={() => setAbierta(abiertaEsta ? null : s.slug)} aria-expanded={abiertaEsta}>
            <strong>{s.titulo || 'Sin título'}</strong>
            <small>{s.recursos ? 'Biblioteca de PDF' : s.lives ? `Lives · ${s.videos.length} videos` : `${s.videos.length} ${s.videos.length === 1 ? 'video o lista' : 'videos o listas'}`}{!s.visible && ' · Oculta'}</small>
            <ChevronDown size={18} aria-hidden="true" className="gestor-flecha" />
          </button>
          <div className="gestor-botones">
            <button type="button" onClick={() => editar(i, { visible: !s.visible })} aria-label={s.visible ? `Ocultar ${s.titulo}` : `Mostrar ${s.titulo}`} title={s.visible ? 'Visible: pulsa para ocultar' : 'Oculta: pulsa para mostrar'}>{s.visible ? <Eye size={18} /> : <EyeOff size={18} />}</button>
            <button type="button" onClick={() => cambiar(mover(series, i, -1))} disabled={i === 0} aria-label={`Subir ${s.titulo}`}><ArrowUp size={18} /></button>
            <button type="button" onClick={() => cambiar(mover(series, i, 1))} disabled={i === series.length - 1} aria-label={`Bajar ${s.titulo}`}><ArrowDown size={18} /></button>
          </div>
        </div>

        {abiertaEsta && <div className="gestor-detalle">
          <div className="gestor-campos">
            <label className="editor-campo"><span className="editor-etiqueta">Título de la serie</span><input value={s.titulo} onChange={e => editar(i, { titulo: e.target.value })} /></label>
            <label className="editor-campo"><span className="editor-etiqueta">Grupo</span>
              <select value={s.tipo} onChange={e => editar(i, { tipo: e.target.value as Seccion['tipo'] })}><option value="serie">Serie educativa</option><option value="complemento">Recurso complementario</option></select></label>
            <label className="editor-campo"><span className="editor-etiqueta">Ícono</span>
              <select value={s.icono} onChange={e => editar(i, { icono: e.target.value as Seccion['icono'] })}>{ICONOS.map(o => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}</select></label>
            <label className="editor-campo gestor-ancho"><span className="editor-etiqueta">Resumen (lo que se lee en la tarjeta)</span><textarea rows={2} value={s.resumen} onChange={e => editar(i, { resumen: e.target.value })} /></label>
            <label className="editor-campo gestor-ancho"><span className="editor-etiqueta">Introducción (al entrar a la serie)</span><textarea rows={2} value={s.intro} onChange={e => editar(i, { intro: e.target.value })} /></label>
          </div>

          {!s.recursos && <Videos videos={s.videos} onChange={v => editar(i, { videos: v })} />}
          {s.recursos && <p className="admin-nota">Los PDF de esta tarjeta se suben más abajo, en «PDF y recursos».</p>}

          <div className="gestor-pie">
            <a className="btn btn-outline btn-sm" href={`/portal/${s.slug}`} target="_blank" rel="noopener noreferrer">Ver en el Portal</a>
            <button type="button" className="btn btn-outline btn-sm es-peligro" onClick={() => { if (confirm(`¿Eliminar la serie «${s.titulo}» con todos sus videos?`)) { cambiar(series.filter((_, k) => k !== i)); setAbierta(null); } }}><Trash2 size={16} aria-hidden="true" /> Eliminar serie</button>
          </div>
        </div>}
      </li>;
    })}</ol>

    <BarraGuardar sucio={sucio} pendiente={pendiente} mensaje={mensaje} onGuardar={guardar} />
  </section>;
}

function Videos({ videos, onChange }: { videos: Video[]; onChange: (v: Video[]) => void }) {
  const [url, setUrl] = useState('');
  const [titulo, setTitulo] = useState('');
  const [error, setError] = useState('');
  const editar = (i: number, d: Partial<Video>) => onChange(videos.map((v, k) => (k === i ? { ...v, ...d } : v)));
  const previa = useDatosYouTube(url);
  // Al pegar el enlace, el título de YouTube se propone solo (se puede cambiar).
  useEffect(() => { if (previa?.titulo) setTitulo(t => t || previa.titulo); }, [previa]);

  function agregar(e: React.FormEvent) {
    e.preventDefault();
    const yt = parseYouTube(url);
    if (!yt) { setError('Ese enlace no parece de YouTube. Copia el enlace desde el botón «Compartir» del video o de la playlist.'); return; }
    if (!titulo.trim()) { setError('Escribe un título para que tus alumnos sepan qué van a ver.'); return; }
    onChange([...videos, { titulo: titulo.trim(), descripcion: '', url: url.trim() }]);
    setUrl(''); setTitulo(''); setError('');
  }

  return <div className="gestor-videos">
    <h3>Videos y playlists de esta serie</h3>
    {videos.length === 0 ? <p className="admin-vacio">Aún no hay videos. Añade el primero abajo.</p>
      : <ol className="gestor-lista">{videos.map((v, i) => {
        const yt = parseYouTube(v.url);
        return <li key={i} className="gestor-video">
          <Miniatura url={v.url} />
          <div className="gestor-video-datos">
            <input aria-label="Título del video" value={v.titulo} onChange={e => editar(i, { titulo: e.target.value })} />
            <textarea aria-label="Descripción" rows={2} placeholder="Descripción (opcional)" value={v.descripcion} onChange={e => editar(i, { descripcion: e.target.value })} />
            <small>{yt?.listId ? <><ListVideo size={14} aria-hidden="true" /> Playlist completa</> : <><Youtube size={14} aria-hidden="true" /> Video</>} · <a href={v.url} target="_blank" rel="noopener noreferrer">Abrir en YouTube</a></small>
          </div>
          <div className="gestor-botones">
            <button type="button" onClick={() => onChange(mover(videos, i, -1))} disabled={i === 0} aria-label={`Subir ${v.titulo}`}><ArrowUp size={18} /></button>
            <button type="button" onClick={() => onChange(mover(videos, i, 1))} disabled={i === videos.length - 1} aria-label={`Bajar ${v.titulo}`}><ArrowDown size={18} /></button>
            <button type="button" onClick={() => confirm(`¿Quitar «${v.titulo}» de la serie?`) && onChange(videos.filter((_, k) => k !== i))} aria-label={`Quitar ${v.titulo}`} className="es-peligro"><Trash2 size={18} /></button>
          </div>
        </li>;
      })}</ol>}

    <form className="gestor-agregar" onSubmit={agregar}>
      <h4><Plus size={16} aria-hidden="true" /> Añadir video o playlist</h4>
      <label className="editor-campo"><span className="editor-etiqueta">Enlace de YouTube</span><input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.youtube.com/playlist?list=…" inputMode="url" /></label>
      <label className="editor-campo"><span className="editor-etiqueta">Título</span><input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej.: Temporada 3: Medias móviles" /></label>
      {url && parseYouTube(url) && <div className="gestor-previa">
        <Miniatura url={url} />
        <p className="admin-nota">{parseYouTube(url)?.listId ? 'Es una playlist: tus alumnos verán la lista completa.' : 'Es un video individual.'}{previa?.titulo && <><br />En YouTube se llama: <strong>{previa.titulo}</strong></>}</p>
      </div>}
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="btn btn-green btn-sm"><Plus size={16} aria-hidden="true" /> Añadir</button>
    </form>
  </div>;
}

/* ------------------------------------------------------------------ */
/* PDF y recursos                                                      */
/* ------------------------------------------------------------------ */

export function GestorRecursos({ inicial }: { inicial: Recurso[] }) {
  const [recursos, setRecursos] = useState(inicial);
  const [sucio, setSucio] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendiente, iniciar] = useTransition();
  useAvisoSinGuardar(sucio);

  const cambiar = (r: Recurso[]) => { setRecursos(r); setSucio(true); setMensaje(null); };
  const editar = (i: number, d: Partial<Recurso>) => cambiar(recursos.map((r, k) => (k === i ? { ...r, ...d } : r)));

  function guardar() {
    iniciar(async () => {
      const r = await guardarSeccion('biblioteca', { recursos });
      setMensaje(r.ok ? { ok: true, texto: 'Guardado. Ya se ve en la Biblioteca del Portal.' } : { ok: false, texto: r.error });
      if (r.ok) setSucio(false);
    });
  }

  return <section className="admin-panel gestor">
    <div className="gestor-cabeza">
      <div><h2>PDF y recursos</h2><p className="admin-nota">Los materiales de la Biblioteca del Portal, en este orden. El primero es también el regalo de bienvenida. Sin archivo, la tarjeta dice «Próximamente».</p></div>
      <button type="button" className="btn btn-outline btn-sm" onClick={() => cambiar([...recursos, { titulo: 'Nuevo recurso', descripcion: '', formato: 'PDF', archivo: '' }])}><Plus size={16} aria-hidden="true" /> Nuevo recurso</button>
    </div>

    <ol className="gestor-lista">{recursos.map((r, i) => <li key={i} className="gestor-recurso">
      <div className="gestor-fila">
        <span className="gestor-num">{String(i + 1).padStart(2, '0')}</span>
        <div className="gestor-recurso-datos">
          <label className="editor-campo"><span className="editor-etiqueta">Título</span><input value={r.titulo} onChange={e => editar(i, { titulo: e.target.value })} /></label>
          <label className="editor-campo"><span className="editor-etiqueta">Descripción</span><textarea rows={2} value={r.descripcion} onChange={e => editar(i, { descripcion: e.target.value })} /></label>
          <div className="gestor-recurso-archivo">
            <label className="editor-campo"><span className="editor-etiqueta">Formato</span><input value={r.formato} onChange={e => editar(i, { formato: e.target.value })} size={6} /></label>
            <div className="editor-campo"><span className="editor-etiqueta">Archivo {r.archivo ? '' : <em className="admin-tenue">(Próximamente)</em>}</span>
              <SubirArchivo tipo="archivo" valor={r.archivo} onChange={url => {
                const ext = url.split('.').pop()?.toUpperCase();
                editar(i, { archivo: url, ...(url && ext && ext.length <= 4 ? { formato: ext } : {}) });
              }} /></div>
          </div>
        </div>
        <div className="gestor-botones es-vertical">
          <button type="button" onClick={() => cambiar(mover(recursos, i, -1))} disabled={i === 0} aria-label={`Subir ${r.titulo}`}><ArrowUp size={18} /></button>
          <button type="button" onClick={() => cambiar(mover(recursos, i, 1))} disabled={i === recursos.length - 1} aria-label={`Bajar ${r.titulo}`}><ArrowDown size={18} /></button>
          <button type="button" className="es-peligro" onClick={() => confirm(`¿Eliminar «${r.titulo}» de la biblioteca?`) && cambiar(recursos.filter((_, k) => k !== i))} aria-label={`Eliminar ${r.titulo}`}><Trash2 size={18} /></button>
        </div>
      </div>
    </li>)}</ol>

    <BarraGuardar sucio={sucio} pendiente={pendiente} mensaje={mensaje} onGuardar={guardar} />
  </section>;
}
