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
  await supabase.auth.getUser();
  return response;
}

export const config = { matcher: ['/portal/:path*', '/admin/:path*', '/nueva-clave', '/auth/:path*'] };
