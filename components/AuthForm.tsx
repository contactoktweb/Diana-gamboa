'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, MailCheck } from 'lucide-react';
import { guardarNombre, leerNombre, nombreDesdeCorreo, primerNombre } from '@/lib/alumno';

type Mode = 'registro' | 'ingresar' | 'recuperar';

/* VISTA PREVIA: el formulario aún no está conectado a un sistema de cuentas.
   Guarda solo el nombre en este navegador para mostrar el saludo del portal. */
export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [sent, setSent] = useState(false);

  function submit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    const correo = String(data.get('correo') ?? '');
    if (mode === 'registro') guardarNombre(primerNombre(String(data.get('nombre') ?? '')));
    else if (mode === 'ingresar' && !leerNombre()) guardarNombre(nombreDesdeCorreo(correo));
    // Al registrarse o iniciar sesión, el alumno entra directamente a su portal.
    if (mode === 'recuperar') setSent(true);
    else router.push('/portal');
  }

  if (sent) return <div className="auth-sent" role="status">
    <MailCheck size={40} aria-hidden="true" />
    <h2>Te enviamos un enlace</h2>
    <p>Si el correo está registrado, recibirás un enlace para crear una nueva contraseña.</p>
    <Link className="btn btn-green btn-block" href="/ingresar">Volver a iniciar sesión</Link>
  </div>;

  return <form className="auth-form" onSubmit={submit}>
    {mode !== 'recuperar' && <>
      <button type="button" className="btn btn-google btn-block" onClick={() => router.push('/portal')}>
        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
        Continuar con Google
      </button>
      <div className="auth-divider"><span>o con tu correo</span></div>
    </>}
    {mode === 'registro' && <label className="field"><span>Nombre</span><input name="nombre" autoComplete="given-name" required placeholder="Tu nombre" /></label>}
    <label className="field"><span>Correo electrónico</span><input name="correo" type="email" autoComplete="email" required placeholder="tucorreo@ejemplo.com" /></label>
    {mode !== 'recuperar' && <label className="field"><span>Contraseña</span>
      <span className="field-pass">
        <input name="clave" type={showPass ? 'text' : 'password'} autoComplete={mode === 'registro' ? 'new-password' : 'current-password'} required minLength={8} placeholder={mode === 'registro' ? 'Mínimo 8 caracteres' : 'Tu contraseña'} />
        <button type="button" onClick={() => setShowPass(v => !v)} aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPass ? <EyeOff size={20} /> : <Eye size={20} />}</button>
      </span>
    </label>}
    {mode === 'ingresar' && <Link className="auth-forgot" href="/recuperar">¿Olvidaste tu contraseña?</Link>}
    {mode === 'registro' && <>
      <label className="check"><input type="checkbox" required /> <span>Acepto los <Link href="/terminos" target="_blank">términos y condiciones</Link> y la <Link href="/privacidad" target="_blank">política de privacidad</Link>.</span></label>
      <label className="check"><input type="checkbox" name="novedades" /> <span>Quiero recibir novedades por correo (opcional).</span></label>
    </>}
    <button type="submit" className="btn btn-green btn-lg btn-block">
      {mode === 'registro' ? 'Crear mi cuenta gratis' : mode === 'ingresar' ? 'Iniciar sesión' : 'Enviar enlace'} <ArrowRight aria-hidden="true" />
    </button>
    <p className="auth-switch">
      {mode === 'registro' && <>¿Ya eres alumno? <Link href="/ingresar">Iniciar sesión</Link></>}
      {mode === 'ingresar' && <>¿Aún no tienes cuenta? <Link href="/registro">Regístrate gratis</Link></>}
      {mode === 'recuperar' && <><Link href="/ingresar">Volver a iniciar sesión</Link></>}
    </p>
  </form>;
}
