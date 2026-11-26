import { NextResponse } from 'next/server';
import { getSesion } from '@/lib/sesion';
import { accesoSala } from '@/lib/eventos/sala';

export const dynamic = 'force-dynamic';

/**
 * El moderador (o la administración) abre la clase en su aplicación de Zoom, con su nombre.
 * Ahí Diana lo nombra coanfitrión para que pueda moderar el chat, silenciar y apagar cámaras.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get('evento') ?? '';
  if (!/^[a-z0-9-]{2,60}$/.test(slug)) return NextResponse.redirect(new URL('/portal/eventos', url));
  const sesion = await getSesion();
  if (!sesion) return NextResponse.redirect(new URL(`/ingresar?next=${encodeURIComponent(`/portal/eventos/${slug}`)}`, url));
  const rol = sesion.perfil?.rol;
  if (rol !== 'moderador' && rol !== 'admin') return NextResponse.redirect(new URL(`/portal/eventos/${slug}`, url));
  const a = await accesoSala(slug);
  if (!a.ok) return NextResponse.redirect(new URL(`/portal/eventos/${slug}`, url));
  const destino = new URL(a.enlace);
  destino.searchParams.set('uname', `${sesion.perfil?.nombre || 'Moderador'} (moderador)`);
  return NextResponse.redirect(destino.toString());
}
