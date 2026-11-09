import { NextResponse, type NextRequest } from 'next/server';
import { supabaseServidor } from '@/lib/supabase/servidor';

const destinoSeguro = (d: string | null) => (d && d.startsWith('/') && !d.startsWith('//') ? d : '/portal');

/**
 * Llegada desde un enlace de Supabase (confirmación de correo, Google o recuperación de
 * contraseña): abre la sesión y lleva al alumno a su destino.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = destinoSeguro(url.searchParams.get('next'));
  const code = url.searchParams.get('code');
  const supabase = await supabaseServidor();
  if (supabase && code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Registro con Google: guarda la aceptación de términos y la preferencia de novedades.
      const cambios: Record<string, unknown> = {};
      if (url.searchParams.get('terminos') === '1') cambios.acepta_terminos_en = new Date().toISOString();
      if (url.searchParams.get('novedades') === '1') cambios.acepta_novedades = true;
      if (Object.keys(cambios).length) await supabase.from('perfiles').update(cambios).eq('id', data.user.id).is('acepta_terminos_en', null);
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }
  return NextResponse.redirect(new URL(`/ingresar?error=enlace`, url.origin));
}
