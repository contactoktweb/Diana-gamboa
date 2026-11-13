'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ExternalLink, Save, Trash2 } from 'lucide-react';
import { eliminarEvento, guardarEvento, type DatosEvento } from '@/app/admin/eventos/acciones';
import { fechaEvento, MESES } from '@/lib/eventos/formato';

const slugDe = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

const AYUDA_FORMATO = 'Formato: «## » título de sección · «### » pregunta · «- » punto de lista (dos espacios antes del guion = subpunto) · «> » frase destacada · **negrita** · [texto](/direccion). Deja una línea en blanco entre párrafos.';

export default function FormEvento({ inicial }: { inicial: DatosEvento }) {
  const router = useRouter();
  const [d, setD] = useState<DatosEvento>(inicial);
  const [slugTocado, setSlugTocado] = useState(Boolean(inicial.id));
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendiente, iniciar] = useTransition();
  const nuevo = !inicial.id;
  const cambiar = (c: Partial<DatosEvento>) => { setD(x => ({ ...x, ...c })); setMensaje(null); };
  const anio = new Date().getFullYear();

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    iniciar(async () => {
      const r = await guardarEvento(d);
      if (!r.ok) { setMensaje({ ok: false, texto: r.error }); return; }
      setMensaje({ ok: true, texto: 'Guardado. Los alumnos ya ven los cambios.' });
      if (nuevo) router.push(`/admin/eventos/${r.id}`); else router.refresh();
    });
  }

  function eliminar() {
    if (!inicial.id || !confirm(`¿Eliminar «${inicial.titulo}»? No se puede deshacer.`)) return;
    iniciar(async () => {
      const r = await eliminarEvento(inicial.id!);
      if (!r.ok) { setMensaje({ ok: false, texto: r.error }); return; }
      router.push('/admin/eventos');
    });
  }

  const campo = (clave: keyof DatosEvento, etiqueta: string, extra: { ayuda?: string; filas?: number; placeholder?: string } = {}) =>
    <label className="editor-campo"><span className="editor-etiqueta">{etiqueta}</span>
      {extra.filas
        ? <textarea rows={extra.filas} value={String(d[clave] ?? '')} placeholder={extra.placeholder} onChange={e => cambiar({ [clave]: e.target.value } as Partial<DatosEvento>)} />
        : <input value={String(d[clave] ?? '')} placeholder={extra.placeholder} onChange={e => cambiar({ [clave]: e.target.value } as Partial<DatosEvento>)} />}
      {extra.ayuda && <small className="editor-ayuda">{extra.ayuda}</small>}
    </label>;

  return <form className="admin-panel form-evento" onSubmit={guardar}>
    <h2>Datos principales</h2>
    <label className="editor-campo"><span className="editor-etiqueta">Título</span>
      <input required value={d.titulo} onChange={e => cambiar({ titulo: e.target.value, ...(slugTocado ? {} : { slug: slugDe(e.target.value) }) })} /></label>
    <label className="editor-campo"><span className="editor-etiqueta">Dirección del evento</span>
      <span className="form-evento-slug"><span>/portal/eventos/</span><input required value={d.slug} onChange={e => { setSlugTocado(true); cambiar({ slug: e.target.value.toLowerCase() }); }} /></span>
      <small className="editor-ayuda">Solo letras minúsculas, números y guiones. No la cambies si ya compartiste el enlace.</small></label>
    {campo('subtitulo', 'Subtítulo', { placeholder: 'Ej.: Taller práctico en vivo para…' })}
    {campo('detalles', 'Datos destacados', { placeholder: 'Ej.: Nivel intermedio · 2 clases en vivo · Solo 50 cupos', ayuda: 'Aparece sobre el título y en el bloque «Reserva tu lugar».' })}
    {campo('resumen', 'Resumen (tarjeta en la lista de eventos)', { filas: 2 })}

    <h2>Fecha</h2>
    <div className="form-evento-fila">
      <label className="check"><input type="radio" name="fecha_tipo" checked={d.fecha_tipo === 'exacta'} onChange={() => cambiar({ fecha_tipo: 'exacta' })} /> <span>Fecha exacta</span></label>
      <label className="check"><input type="radio" name="fecha_tipo" checked={d.fecha_tipo === 'aproximada'} onChange={() => cambiar({ fecha_tipo: 'aproximada' })} /> <span>Fecha aproximada (aún no se sabe el día)</span></label>
    </div>
    {d.fecha_tipo === 'exacta'
      ? <label className="editor-campo"><span className="editor-etiqueta">Día</span><input type="date" value={d.fecha ?? ''} onChange={e => cambiar({ fecha: e.target.value })} /></label>
      : <div className="form-evento-fila">
        <label className="editor-campo"><span className="editor-etiqueta">Momento del mes</span>
          <select value={d.fecha_periodo ?? ''} onChange={e => cambiar({ fecha_periodo: (e.target.value || null) as DatosEvento['fecha_periodo'] })}>
            <option value="">Todo el mes</option><option value="inicio">Inicios</option><option value="mediados">Mediados</option><option value="finales">Finales</option>
          </select></label>
        <label className="editor-campo"><span className="editor-etiqueta">Mes</span>
          <select value={d.fecha_mes ?? ''} onChange={e => cambiar({ fecha_mes: Number(e.target.value) || null })}>
            <option value="">Elige…</option>{MESES.map((m, i) => <option key={m} value={i + 1}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
          </select></label>
        <label className="editor-campo"><span className="editor-etiqueta">Año</span>
          <select value={d.fecha_anio ?? ''} onChange={e => cambiar({ fecha_anio: Number(e.target.value) || null })}>
            {[anio, anio + 1, anio + 2].map(a => <option key={a} value={a}>{a}</option>)}
          </select></label>
      </div>}
    <p className="admin-nota">Los alumnos verán: <strong>{fechaEvento(d)}</strong></p>
    {campo('horario', 'Horario y duración', { placeholder: 'Ej.: Día 1: 28 nov · Día 2: 29 nov · 6:00 p. m. Pacífico / 9:00 p. m. Este · 2 horas por sesión' })}

    <h2>Cupos y pago</h2>
    <div className="form-evento-fila">
      <label className="editor-campo"><span className="editor-etiqueta">Valor (USD)</span><input inputMode="decimal" value={d.precio} onChange={e => cambiar({ precio: e.target.value })} placeholder="98.99" /></label>
      <label className="editor-campo"><span className="editor-etiqueta">Cupos</span><input type="number" min={1} value={d.cupos} onChange={e => cambiar({ cupos: Number(e.target.value) })} /></label>
    </div>
    <small className="editor-ayuda">El valor solo se muestra cuando el alumno pulsa «Reserva tu lugar». Los alumnos nunca ven cuántos cupos quedan: solo si hay o no.</small>
    <label className="check"><input type="checkbox" checked={d.inscripcion_abierta} onChange={e => cambiar({ inscripcion_abierta: e.target.checked })} /> <span>Inscripciones abiertas</span></label>
    <label className="check"><input type="checkbox" checked={d.visible} onChange={e => cambiar({ visible: e.target.checked })} /> <span>Visible para los alumnos en «Eventos»</span></label>

    <h2>Página del evento</h2>
    {campo('contenido', 'Texto de la página', { filas: 18, ayuda: AYUDA_FORMATO })}
    {campo('acceso', 'Acceso para inscritos (solo lo ven quienes pagaron)', { filas: 5, ayuda: 'Enlace de las clases, grabaciones, hoja de chequeo… ' + AYUDA_FORMATO })}
    {campo('aviso', 'Aviso de riesgo (siempre visible al final de la página)', { filas: 4 })}

    {mensaje && <p className={mensaje.ok ? 'auth-ok' : 'auth-error'} role={mensaje.ok ? 'status' : 'alert'}>{mensaje.texto}</p>}
    <div className="form-evento-botones">
      <button className="btn btn-green" disabled={pendiente}><Save size={18} aria-hidden="true" /> {pendiente ? 'Guardando…' : nuevo ? 'Crear evento' : 'Guardar cambios'}</button>
      {!nuevo && <a className="btn btn-outline btn-sm" href={`/portal/eventos/${inicial.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} aria-hidden="true" /> Ver como alumno</a>}
      {!nuevo && <button type="button" className="btn btn-outline btn-sm es-peligro" onClick={eliminar} disabled={pendiente}><Trash2 size={16} aria-hidden="true" /> Eliminar</button>}
    </div>
  </form>;
}
