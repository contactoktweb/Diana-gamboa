'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, MailCheck } from 'lucide-react';
import { guardarNombre, leerNombre, nombreDesdeCorreo, primerNombre } from '@/lib/alumno';
import { supabaseNavegador } from '@/lib/supabase/cliente';
import { traducirError } from '@/lib/supabase/errores';
import { idsLocales } from '@/lib/reto/registro';

type Mode = 'registro' | 'ingresar' | 'recuperar' | 'nueva-clave';

/** Solo se permite volver a páginas internas de la academia. */
const destinoSeguro = (d: string | null, porDefecto = '/portal') => (d && d.startsWith('/') && !d.startsWith('//') ? d : porDefecto);

/**
 * Registro, inicio de sesión y recuperación de contraseña.
 * Con Supabase configurado usa cuentas reales; sin él funciona en modo demostración.
 */
export default function AuthForm({ mode, confirmacion }: { mode: Mode; confirmacion?: { titulo: string; texto: string } }) {
  const router = useRouter();
  const params = useSearchParams();
  const [showPass, setShowPass] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(params.get('error') === 'enlace' ? 'El enlace ya no es válido o caducó. Solicita uno nuevo.' : '');
  const [terminos, setTerminos] = useState(false);
  const [novedades, setNovedades] = useState(false);
  const sb = supabaseNavegador();
  const next = destinoSeguro(params.get('next'));

  async function entrar(destino: string) {
    // Los retos hechos como visitante en este navegador pasan a la cuenta.
    const ids = idsLocales();
    if (sb && ids.length) await sb.rpc('reto_vincular', { ids });
    router.push(destino);
    router.refresh();
  }

  async function submit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setError('');
    const data = new FormData(ev.currentTarget);
    const correo = String(data.get('correo') ?? '').trim();
    const clave = String(data.get('clave') ?? '');
    const nombre = String(data.get('nombre') ?? '').trim();

    if (!sb) {
      // Modo demostración (sin Supabase): solo guarda el nombre en este navegador.
      if (mode === 'registro') guardarNombre(primerNombre(nombre));
      else if (mode === 'ingresar' && !leerNombre()) guardarNombre(nombreDesdeCorreo(correo));
      if (mode === 'recuperar') setEnviado(true); else router.push('/portal');
      return;
    }

    setCargando(true);
    const origen = window.location.origin;
    try {
      if (mode === 'registro') {
        const { data: r, error: e } = await sb.auth.signUp({
          email: correo, password: clave,
          options: {
            data: { nombre, acepta_terminos: 'true', acepta_novedades: novedades ? 'true' : 'false' },
            emailRedirectTo: `${origen}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (e) throw e;
        // Supabase no avisa si el correo ya existe (por privacidad): devuelve un usuario sin identidades.
        if (r.user && r.user.identities?.length === 0) throw new Error('already registered');
        if (r.session) await entrar(next); else setEnviado(true);
      } else if (mode === 'ingresar') {
        const { data: r, error: e } = await sb.auth.signInWithPassword({ email: correo, password: clave });
        if (e) throw e;
        const { data: perfil } = await sb.from('perfiles').select('rol').eq('id', r.user.id).maybeSingle();
        await entrar(params.get('next') ? next : perfil?.rol === 'admin' ? '/admin' : '/portal');
      } else if (mode === 'recuperar') {
        const { error: e } = await sb.auth.resetPasswordForEmail(correo, { redirectTo: `${origen}/auth/callback?next=/nueva-clave` });
        if (e) throw e;
        setEnviado(true);
      } else {
        if (clave !== String(data.get('clave2') ?? '')) throw new Error('Las contraseñas no coinciden.');
        const { error: e } = await sb.auth.updateUser({ password: clave });
        if (e) throw e;
        await entrar('/portal');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      setError(msg === 'Las contraseñas no coinciden.' ? msg : traducirError(msg));
    } finally {
      setCargando(false);
    }
  }

  async function conGoogle() {
    setError('');
    if (!sb) { router.push('/portal'); return; }
    if (mode === 'registro' && !terminos) { setError('Para crear tu cuenta, acepta primero los términos y la política de privacidad.'); return; }
    const extra = mode === 'registro' ? `&terminos=1${novedades ? '&novedades=1' : ''}` : '';
    const { error: e } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}${extra}` },
    });
    if (e) setError(traducirError(e.message));
  }

  if (enviado) return <div className="auth-sent" role="status">
    <MailCheck size={40} aria-hidden="true" />
    {mode === 'registro'
      ? <><h2>{confirmacion?.titulo ?? 'Revisa tu correo'}</h2><p>{confirmacion?.texto}</p><p className="auth-nota">¿No te llegó? Revisa la carpeta de spam o promociones.</p></>
      : <><h2>Te enviamos un enlace</h2><p>Si el correo está registrado, recibirás un enlace para crear una nueva contraseña.</p></>}
    <Link className="btn btn-green btn-block" href="/ingresar">Ir a iniciar sesión</Link>
  </div>;

  return <form className="auth-form" onSubmit={submit}>
    {(mode === 'registro' || mode === 'ingresar') && <>
      <button type="button" className="btn btn-google btn-block" onClick={conGoogle}>
        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
        Continuar con Google
      </button>
      <div className="auth-divider"><span>o con tu correo</span></div>
    </>}
    {mode === 'registro' && <label className="field"><span>Nombre</span><input name="nombre" autoComplete="given-name" required placeholder="Tu nombre" /></label>}
    {mode !== 'nueva-clave' && <label className="field"><span>Correo electrónico</span><input name="correo" type="email" autoComplete="email" required placeholder="tucorreo@ejemplo.com" /></label>}
    {mode !== 'recuperar' && <label className="field"><span>{mode === 'nueva-clave' ? 'Nueva contraseña' : 'Contraseña'}</span>
      <span className="field-pass">
        <input name="clave" type={showPass ? 'text' : 'password'} autoComplete={mode === 'ingresar' ? 'current-password' : 'new-password'} required minLength={8} placeholder={mode === 'ingresar' ? 'Tu contraseña' : 'Mínimo 8 caracteres'} />
        <button type="button" onClick={() => setShowPass(v => !v)} aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPass ? <EyeOff size={20} /> : <Eye size={20} />}</button>
      </span>
    </label>}
    {mode === 'nueva-clave' && <label className="field"><span>Repite la contraseña</span><input name="clave2" type={showPass ? 'text' : 'password'} autoComplete="new-password" required minLength={8} /></label>}
    {mode === 'ingresar' && <Link className="auth-forgot" href="/recuperar">¿Olvidaste tu contraseña?</Link>}
    {mode === 'registro' && <>
      <label className="check"><input type="checkbox" required checked={terminos} onChange={e => setTerminos(e.target.checked)} /> <span>Acepto los <Link href="/terminos" target="_blank">términos y condiciones</Link> y la <Link href="/privacidad" target="_blank">política de privacidad</Link>.</span></label>
      <label className="check"><input type="checkbox" checked={novedades} onChange={e => setNovedades(e.target.checked)} /> <span>Quiero recibir novedades por correo (opcional).</span></label>
    </>}
    {error && <p className="auth-error" role="alert">{error}</p>}
    <button type="submit" className="btn btn-green btn-lg btn-block" disabled={cargando}>
      {cargando ? 'Un momento…' : mode === 'registro' ? 'Crear mi cuenta gratis' : mode === 'ingresar' ? 'Iniciar sesión' : mode === 'recuperar' ? 'Enviar enlace' : 'Guardar contraseña'} <ArrowRight aria-hidden="true" />
    </button>
    <p className="auth-switch">
      {mode === 'registro' && <>¿Ya eres alumno? <Link href="/ingresar">Iniciar sesión</Link></>}
      {mode === 'ingresar' && <>¿Aún no tienes cuenta? <Link href="/registro">Regístrate gratis</Link></>}
      {mode === 'recuperar' && <><Link href="/ingresar">Volver a iniciar sesión</Link></>}
    </p>
  </form>;
}
