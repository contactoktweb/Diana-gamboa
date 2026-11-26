'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ExternalLink, Save, Trash2 } from 'lucide-react';
import { eliminarEvento, guardarEvento, type DatosEvento } from '@/app/admin/eventos/acciones';
import { fechaEvento, MESES, ZONAS } from '@/lib/eventos/formato';
import EditorTexto from '@/components/admin/EditorTexto';

const slugDe = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);


export default function FormEvento({ inicial, otros = [] }: { inicial: DatosEvento; otros?: { id: string; titulo: string; fecha: string }[] }) {
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
    <label className="editor-campo"><span className="editor-etiqueta">Nombre del evento</span>
      <input required value={d.titulo} placeholder="Ej.: Antes de Comprar Ese Call o Ese Put" onChange={e => cambiar({ titulo: e.target.value, ...(slugTocado ? {} : { slug: slugDe(e.target.value) }) })} /></label>
    {campo('subtitulo', 'Frase corta debajo del nombre', { placeholder: 'Ej.: Taller práctico en vivo para escoger mejor tu contrato de opciones.' })}
    {campo('resumen', 'Descripción para la tarjeta de «Eventos»', { filas: 2, placeholder: 'Ej.: Dos clases en vivo con Diana. Incluye las grabaciones.', ayuda: 'Dos o tres líneas: es lo que se lee en la lista de eventos antes de entrar.' })}
    <details className="form-evento-avanzado">
      <summary>Opciones avanzadas (opcional)</summary>
      {campo('etiqueta', 'Texto pequeño sobre el nombre', { placeholder: 'Ej.: NUEVO GRUPO · DICIEMBRE', ayuda: 'Aparece en letras pequeñas encima del nombre.' })}
      {campo('detalles', 'Datos destacados', { placeholder: 'Ej.: Nivel intermedio · 2 clases en vivo · Solo 50 cupos', ayuda: 'Aparece sobre el nombre y en el bloque «Reserva tu lugar».' })}
      <label className="editor-campo"><span className="editor-etiqueta">Dirección del evento</span>
        <span className="form-evento-slug"><span>/portal/eventos/</span><input required value={d.slug} onChange={e => { setSlugTocado(true); cambiar({ slug: e.target.value.toLowerCase() }); }} /></span>
        <small className="editor-ayuda">Se crea sola a partir del nombre. Solo cámbiala si lo necesitas, y nunca después de haber compartido el enlace.</small></label>
    </details>

    <h2>Fecha</h2>
    <div className="form-evento-fila">
      <label className="check"><input type="radio" name="fecha_tipo" checked={d.fecha_tipo === 'exacta'} onChange={() => cambiar({ fecha_tipo: 'exacta' })} /> <span>Fecha exacta</span></label>
      <label className="check"><input type="radio" name="fecha_tipo" checked={d.fecha_tipo === 'aproximada'} onChange={() => cambiar({ fecha_tipo: 'aproximada' })} /> <span>Fecha aproximada (aún no se sabe el día)</span></label>
    </div>
    {d.fecha_tipo === 'exacta'
      ? <div className="form-evento-fila">
        <label className="editor-campo"><span className="editor-etiqueta">Primer día</span><input type="date" value={d.fecha ?? ''} onChange={e => cambiar({ fecha: e.target.value })} /></label>
        <label className="editor-campo"><span className="editor-etiqueta">Último día (si dura varios días)</span><input type="date" value={d.fecha_fin ?? ''} min={d.fecha ?? undefined} onChange={e => cambiar({ fecha_fin: e.target.value || null })} /></label>
        <label className="editor-campo"><span className="editor-etiqueta">Hora de inicio</span><input type="time" value={d.hora_local ?? ''} onChange={e => cambiar({ hora_local: e.target.value })} /></label>
        <label className="editor-campo"><span className="editor-etiqueta">Zona horaria de esa hora</span>
          <select value={d.zona ?? 'America/New_York'} onChange={e => cambiar({ zona: e.target.value })}>{ZONAS.map(z => <option key={z.zona} value={z.zona}>{z.nombre}</option>)}</select></label>
      </div>
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
    <p className="admin-nota">Los alumnos verán: <strong>{fechaEvento(d)}</strong>{d.fecha_tipo === 'exacta' && d.hora_local ? <> y, debajo del horario, la hora convertida automáticamente a la zona horaria de cada alumno.</> : null}</p>
    {campo('horario', 'Texto del horario', { placeholder: 'Ej.: 2:00 p. m. hora de Nueva York (hora del Este) · 2 horas por sesión', ayuda: 'Escribe la hora con su zona horaria (por ejemplo, «hora de Nueva York»). Con la hora de inicio de arriba, cada alumno ve además su hora local.' })}

    <h2>Cupos y pago</h2>
    <div className="form-evento-fila">
      <label className="editor-campo"><span className="editor-etiqueta">Valor (USD)</span><input inputMode="decimal" value={d.precio} onChange={e => cambiar({ precio: e.target.value })} placeholder="Ej.: 99 · 0 = gratis" /></label>
      <label className="editor-campo"><span className="editor-etiqueta">Cupos</span><input type="number" min={1} value={d.cupos} onChange={e => cambiar({ cupos: Number(e.target.value) })} /></label>
    </div>
    <small className="editor-ayuda">Escribe <strong>0</strong> para un evento gratis: el alumno se inscribe con un clic, sin pagar. Si tiene valor, el pago es con tarjeta en Stripe: al pagar, el alumno queda inscrito solo y recibe su correo de bienvenida. Los alumnos no ven cuántos cupos quedan, solo si hay o no.</small>
    <label className="check"><input type="checkbox" checked={d.inscripcion_abierta} onChange={e => cambiar({ inscripcion_abierta: e.target.checked })} /> <span>Inscripciones abiertas</span></label>
    <fieldset className="form-evento-publicacion">
      <legend className="editor-etiqueta">¿Quién puede ver el evento?</legend>
      <label className="check"><input type="radio" name="publicacion" checked={!d.visible} onChange={() => cambiar({ visible: false })} /> <span><strong>Oculto:</strong> solo tú lo ves (vista previa mientras lo preparas)</span></label>
      <label className="check"><input type="radio" name="publicacion" checked={d.visible && d.en_lista !== false} onChange={() => cambiar({ visible: true, en_lista: true })} /> <span><strong>Publicado:</strong> aparece en la lista de Eventos para todos los alumnos</span></label>
      <label className="check"><input type="radio" name="publicacion" checked={d.visible && d.en_lista === false} onChange={() => cambiar({ visible: true, en_lista: false })} /> <span><strong>Solo con enlace:</strong> no aparece en la lista; entra quien tenga el enlace directo</span></label>
    </fieldset>
    <details className="form-evento-avanzado">
      <summary>Prioridad para una lista de espera (opcional)</summary>
      <label className="check"><input type="checkbox" checked={Boolean(d.solo_lista_espera)} onChange={e => cambiar({ solo_lista_espera: e.target.checked, lista_de: e.target.checked ? d.lista_de ?? otros[0]?.id ?? null : d.lista_de })} /> <span>Prioridad: por ahora solo puede comprar la lista de espera de otro evento</span></label>
      {d.solo_lista_espera && <label className="editor-campo"><span className="editor-etiqueta">Lista de espera con prioridad</span>
        <select value={d.lista_de ?? ''} onChange={e => cambiar({ lista_de: e.target.value || null })}>
          <option value="">Elige…</option>{otros.map(o => <option key={o.id} value={o.id}>{o.titulo} · {o.fecha}</option>)}
        </select>
        <small className="editor-ayuda">Para abrirlo a todos usa «Abrir a todos y avisar» en el panel de lanzamiento: quita la prioridad, lo muestra en Eventos y envía el aviso.</small></label>}
    </details>
    <label className="check"><input type="checkbox" checked={d.recordatorios !== false} onChange={e => cambiar({ recordatorios: e.target.checked })} /> <span>Enviar recordatorios automáticos a los inscritos (un día antes y el día de cada clase)</span></label>

    <h2>Página del evento</h2>
    <div className="editor-campo"><span className="editor-etiqueta">Texto de la página</span>
      <EditorTexto valor={d.contenido} onChange={t => cambiar({ contenido: t })} alto={360}
        placeholder="Cuenta de qué trata el evento, para quién es y qué van a aprender. Usa los botones de arriba para poner títulos, listas o negritas." />
      <small className="editor-ayuda">Escribe como en Word. Selecciona el texto y usa los botones: «Título» para cada sección, «Lista» para puntos (Tab = subpunto) y «Destacar» para una frase importante.</small></div>
    <div className="editor-campo"><span className="editor-etiqueta">Información solo para quienes pagaron (opcional)</span>
      <EditorTexto valor={d.acceso} onChange={t => cambiar({ acceso: t })} alto={140}
        placeholder="Ej.: Aquí encontrarás la grabación de cada clase y la hoja de trabajo." />
      <small className="editor-ayuda">Solo la ven los inscritos con pago. Por ejemplo, el enlace a las grabaciones o a los materiales. Puedes dejarla vacía y completarla después de la clase. El botón «Entrar a la clase» aparece solo cuando configuras la sala de Zoom.</small></div>
    {campo('aviso', 'Aviso de riesgo (ya viene escrito; normalmente no hay que cambiarlo)', { filas: 4 })}

    {mensaje && <p className={mensaje.ok ? 'auth-ok' : 'auth-error'} role={mensaje.ok ? 'status' : 'alert'}>{mensaje.texto}</p>}
    <div className="form-evento-botones">
      <button className="btn btn-green" disabled={pendiente}><Save size={18} aria-hidden="true" /> {pendiente ? 'Guardando…' : nuevo ? 'Crear evento' : 'Guardar cambios'}</button>
      {!nuevo && <a className="btn btn-outline btn-sm" href={`/portal/eventos/${inicial.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} aria-hidden="true" /> Ver como alumno</a>}
      {!nuevo && <a className="btn btn-outline btn-sm" href={`/eventos/${inicial.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} aria-hidden="true" /> Ver página pública</a>}
      {!nuevo && <button type="button" className="btn btn-outline btn-sm es-peligro" onClick={eliminar} disabled={pendiente}><Trash2 size={16} aria-hidden="true" /> Eliminar</button>}
    </div>
  </form>;
}
