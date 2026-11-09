'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabaseNavegador } from '@/lib/supabase/cliente';
import { EXPERIENCIAS } from '@/data/reto';
import type { Perfil } from '@/lib/sesion';

const PAISES = ['Colombia', 'México', 'Estados Unidos', 'Venezuela', 'Perú', 'Argentina', 'Chile', 'Ecuador', 'España', 'Otro'];

/** Datos del alumno: nombre, novedades, preguntas opcionales y eliminación de la cuenta. */
export default function MiCuenta({ perfil }: { perfil: Perfil }) {
  const router = useRouter();
  const [estado, setEstado] = useState<'' | 'guardando' | 'guardado' | 'error'>('');
  const [borrar, setBorrar] = useState(false);

  async function guardar(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const d = new FormData(ev.currentTarget);
    setEstado('guardando');
    const { error } = await supabaseNavegador()!.from('perfiles').update({
      nombre: String(d.get('nombre') ?? '').trim() || perfil.nombre,
      acepta_novedades: d.get('novedades') === 'on',
      pais: String(d.get('pais') ?? '') || null,
      experiencia: String(d.get('experiencia') ?? '') || null,
      intereses: String(d.get('intereses') ?? '').trim() || null,
    }).eq('id', perfil.id);
    setEstado(error ? 'error' : 'guardado');
    if (!error) router.refresh();
  }

  async function eliminar() {
    const sb = supabaseNavegador()!;
    const { error } = await sb.rpc('eliminar_mi_cuenta');
    if (error) { setEstado('error'); return; }
    await sb.auth.signOut();
    router.push('/');
  }

  return <div className="cuenta">
    <form className="auth-form cuenta-form" onSubmit={guardar}>
      <label className="field"><span>Nombre</span><input name="nombre" defaultValue={perfil.nombre} required /></label>
      <label className="field"><span>Correo electrónico</span><input value={perfil.correo} disabled /></label>
      <label className="check"><input type="checkbox" name="novedades" defaultChecked={perfil.acepta_novedades} /> <span>Quiero recibir novedades de la academia por correo.</span></label>
      <h2>Preguntas opcionales</h2>
      <label className="field"><span>¿Desde qué país nos acompañas?</span>
        <select name="pais" defaultValue={perfil.pais ?? ''}><option value="">Prefiero no decirlo</option>{PAISES.map(p => <option key={p}>{p}</option>)}</select></label>
      <label className="field"><span>¿Has estudiado antes el mercado de valores?</span>
        <select name="experiencia" defaultValue={perfil.experiencia ?? ''}><option value="">Prefiero no decirlo</option>{EXPERIENCIAS.map(e => <option key={e}>{e}</option>)}</select></label>
      <label className="field"><span>¿Qué te gustaría aprender?</span><textarea name="intereses" rows={3} defaultValue={perfil.intereses ?? ''} /></label>
      <button className="btn btn-green btn-lg" disabled={estado === 'guardando'}>{estado === 'guardando' ? 'Guardando…' : 'Guardar cambios'}</button>
      {estado === 'guardado' && <p className="auth-ok" role="status">Tus cambios se guardaron.</p>}
      {estado === 'error' && <p className="auth-error" role="alert">No se pudieron guardar los cambios. Inténtalo de nuevo.</p>}
    </form>

    <section className="cuenta-peligro">
      <h2>Eliminar mi cuenta</h2>
      <p>Se borrarán tu cuenta, tus datos y tus resultados del Reto. Esta acción no se puede deshacer.</p>
      {borrar
        ? <div className="cuenta-confirmar"><button type="button" className="btn btn-danger" onClick={eliminar}>Sí, eliminar mi cuenta</button><button type="button" className="btn btn-outline" onClick={() => setBorrar(false)}>Cancelar</button></div>
        : <button type="button" className="btn btn-outline" onClick={() => setBorrar(true)}>Eliminar mi cuenta</button>}
    </section>
  </div>;
}
