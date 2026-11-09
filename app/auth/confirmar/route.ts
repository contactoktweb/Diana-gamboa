import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { supabaseServidor } from '@/lib/supabase/servidor';

const destinoSeguro = (d: string | null) => (d && d.startsWith('/') && !d.startsWith('//') ? d : '/portal');

/** Enlaces de las plantillas de correo (confirmación, recuperación, cambio de correo). */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const next = destinoSeguro(url.searchParams.get('next') ?? (type === 'recovery' ? '/nueva-clave' : '/portal'));
  const supabase = await supabaseServidor();
  if (supabase && token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL('/ingresar?error=enlace', url.origin));
}
