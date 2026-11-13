'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, MailCheck } from 'lucide-react';
import { guardarNombre, leerNombre, nombreDesdeCorreo, primerNombre } from '@/lib/alumno';
import { supabaseNavegador } from '@/lib/supabase/cliente';
import { traducirError } from '@/lib/supabase/errores';
import { idsLocales } from '@/lib/reto/registro';
import { confirmarPendiente, recuperar, registrar } from '@/app/acceso/acciones';

type Mode = 'registro' | 'ingresar' | 'recuperar' | 'nueva-clave';

/** Error con un mensaje ya escrito para el alumno (no hace falta traducirlo). */
class Aviso extends Error {}

/** Solo se permite volver a páginas internas de la academia. */
const destinoSeguro = (d: string | null, porDefecto = '/portal') => (d && d.startsWith('/') && !d.startsWith('//') ? d : porDefecto);

/**
 * Registro, inicio de sesión y recuperación de contraseña.
 * - Con Resend configurado (`envioPropio`), los correos los envía la web con las plantillas de la marca.
 * - Sin Resend, los envía Supabase. Sin Supabase, funciona en modo demostración.
 */
export default function AuthForm({ mode, confirmacion, envioPropio = false }: { mode: Mode; confirmacion?: { titulo: string; texto: string }; envioPropio?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [showPass, setShowPass] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(params.get('error') === 'enlace' ? 'El enlace ya no es válido o caducó. Solicita uno nuevo.' : '');
  const [novedades, setNovedades] = useState(false);
  const sb = supabaseNavegador();
  const next = destinoSeguro(params.get('next'));
  const provisional = mode === 'nueva-clave' && params.get('primera') === '1';

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
        if (envioPropio) {
          const r = await registrar({ nombre, correo, clave, novedades, next });
          if (!r.ok) throw new Aviso(r.error);
          if (r.entrar) {
            const { error: e } = await sb.auth.signInWithPassword({ email: correo, password: clave });
            if (e) throw e;
            await entrar(next);
          } else setEnviado(true);
        } else {
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
        }
      } else if (mode === 'ingresar') {
        let { data: r, error: e } = await sb.auth.signInWithPassword({ email: correo, password: clave });
        // Cuenta antigua sin confirmar: si la confirmación ya no se exige, se confirma y se reintenta.
        if (e && /not confirmed/i.test(e.message) && envioPropio && (await confirmarPendiente(correo)).ok) {
          ({ data: r, error: e } = await sb.auth.signInWithPassword({ email: correo, password: clave }));
        }
        if (e) throw e;
        // Cuenta creada con contraseña provisional: primero debe crear la suya.
        if (r.user!.user_metadata?.debe_cambiar_clave) { await entrar('/nueva-clave?primera=1'); return; }
        const { data: perfil } = await sb.from('perfiles').select('rol').eq('id', r.user!.id).maybeSingle();
        await entrar(params.get('next') ? next : perfil?.rol === 'admin' ? '/admin' : '/portal');
      } else if (mode === 'recuperar') {
        if (envioPropio) {
          const r = await recuperar(correo);
          if (!r.ok) throw new Aviso(r.error);
        } else {
          const { error: e } = await sb.auth.resetPasswordForEmail(correo, { redirectTo: `${origen}/auth/callback?next=/nueva-clave` });
          if (e) throw e;
        }
        setEnviado(true);
      } else {
        if (clave !== String(data.get('clave2') ?? '')) throw new Aviso('Las contraseñas no coinciden.');
        const { data: r, error: e } = await sb.auth.updateUser({ password: clave, data: { debe_cambiar_clave: false } });
        if (e) throw e;
        const { data: perfil } = await sb.from('perfiles').select('rol').eq('id', r.user.id).maybeSingle();
        await entrar(perfil?.rol === 'admin' ? '/admin' : '/portal');
      }
    } catch (e) {
      setError(e instanceof Aviso ? e.message : traducirError(e instanceof Error ? e.message : ''));
    } finally {
      setCargando(false);
    }
  }

  if (enviado) return <div className="auth-sent" role="status">
    <MailCheck size={40} aria-hidden="true" />
    {mode === 'registro'
      ? <><h2>{confirmacion?.titulo ?? 'Revisa tu correo'}</h2><p>{confirmacion?.texto}</p><p className="auth-nota">¿No te llegó? Revisa la carpeta de spam o promociones.</p></>
      : <><h2>Te enviamos un enlace</h2><p>Si el correo está registrado, recibirás un enlace para crear una nueva contraseña.</p><p className="auth-nota">¿No te llegó? Revisa la carpeta de spam o promociones.</p></>}
    <Link className="btn btn-green btn-block" href="/ingresar">Ir a iniciar sesión</Link>
  </div>;

  return <form className="auth-form" onSubmit={submit}>
    {provisional && <p className="auth-ok">Bienvenido. Antes de continuar, crea tu propia contraseña.</p>}
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
      <label className="check"><input type="checkbox" required /> <span>Acepto los <Link href="/terminos" target="_blank">términos y condiciones</Link> y la <Link href="/privacidad" target="_blank">política de privacidad</Link>.</span></label>
      <label className="check"><input type="checkbox" checked={novedades} onChange={e => setNovedades(e.target.checked)} /> <span>Quiero recibir novedades por correo (opcional).</span></label>
    </>}
    {error && <p className="auth-error" role="alert">{error}</p>}
    <button type="submit" className="btn btn-green btn-lg btn-block" disabled={cargando}>
      {cargando ? 'Un momento…' : mode === 'registro' ? 'Crear mi cuenta gratis' : mode === 'ingresar' ? 'Iniciar sesión' : mode === 'recuperar' ? 'Enviar enlace' : 'Guardar contraseña'} <ArrowRight aria-hidden="true" />
    </button>
    <p className="auth-switch">
      {mode === 'registro' && <>¿Ya eres alumno? <Link href={params.get('next') ? `/ingresar?next=${encodeURIComponent(next)}` : '/ingresar'}>Iniciar sesión</Link></>}
      {mode === 'ingresar' && <>¿Aún no tienes cuenta? <Link href={params.get('next') ? `/registro?next=${encodeURIComponent(next)}` : '/registro'}>Regístrate gratis</Link></>}
      {mode === 'recuperar' && <><Link href="/ingresar">Volver a iniciar sesión</Link></>}
    </p>
  </form>;
}
