import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_KEY, SUPABASE_URL, supabaseActivo } from '@/lib/supabase/config';

/** Renueva la sesión del alumno en cada visita al portal o a la administración. */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!supabaseActivo) return response;
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: lista => {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  // Sin sesión: a iniciar sesión, recordando la página exacta (por ejemplo, el enlace de un evento).
  const ruta = request.nextUrl.pathname;
  if (!user && (ruta.startsWith('/portal') || ruta.startsWith('/admin'))) {
    const destino = request.nextUrl.clone();
    destino.pathname = '/ingresar';
    destino.search = `?next=${encodeURIComponent(ruta + request.nextUrl.search)}`;
    return NextResponse.redirect(destino);
  }
  return response;
}

export const config = { matcher: ['/portal/:path*', '/admin/:path*', '/nueva-clave', '/auth/:path*'] };
