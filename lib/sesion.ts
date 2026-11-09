import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { supabaseActivo } from '@/lib/supabase/config';
import { supabaseServidor } from '@/lib/supabase/servidor';

export interface Perfil {
  id: string; nombre: string; correo: string; rol: 'alumno' | 'admin';
  acepta_novedades: boolean; pais: string | null; experiencia: string | null; intereses: string | null;
}

/** Usuario con sesión iniciada y su perfil (null si no hay sesión o Supabase no está configurado). */
export const getSesion = cache(async (): Promise<{ id: string; correo: string; debeCambiarClave: boolean; perfil: Perfil | null } | null> => {
  const supabase = await supabaseServidor();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: perfil } = await supabase.from('perfiles')
    .select('id, nombre, correo, rol, acepta_novedades, pais, experiencia, intereses').eq('id', user.id).maybeSingle();
  return { id: user.id, correo: user.email ?? '', debeCambiarClave: Boolean(user.user_metadata?.debe_cambiar_clave), perfil: (perfil as Perfil | null) ?? null };
});

/** Exige sesión iniciada (solo si Supabase está activo; sin él, el portal funciona en modo demostración). */
export async function exigirSesion(destino: string) {
  if (!supabaseActivo) return null;
  const sesion = await getSesion();
  if (!sesion) redirect(`/ingresar?next=${encodeURIComponent(destino)}`);
  // Cuenta con contraseña provisional: primero debe crear la suya.
  if (sesion.debeCambiarClave) redirect('/nueva-clave?primera=1');
  return sesion;
}

/** Exige una cuenta administradora. */
export async function exigirAdmin() {
  if (!supabaseActivo) return null;
  const sesion = await getSesion();
  if (!sesion) redirect('/ingresar?next=/admin');
  if (sesion.debeCambiarClave) redirect('/nueva-clave?primera=1');
  if (sesion.perfil?.rol !== 'admin') redirect('/portal?aviso=sin-permiso');
  return sesion;
}
