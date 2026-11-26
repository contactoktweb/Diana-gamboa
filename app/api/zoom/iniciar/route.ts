import { NextResponse } from 'next/server';
import { accesoSala } from '@/lib/eventos/sala';
import { enlaceInicio, zoomApiActiva } from '@/lib/zoom';

export const dynamic = 'force-dynamic';

/**
 * La anfitriona inicia la clase en Zoom (aplicación o zoom.us), fuera de la web.
 * Solo cuentas administradoras; el enlace de inicio se pide a Zoom en el momento porque vence.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get('evento') ?? '';
  const volver = (mensaje: string) => NextResponse.redirect(new URL(`/portal/eventos/${encodeURIComponent(slug)}/sala?error=${encodeURIComponent(mensaje)}`, url));
  if (!/^[a-z0-9-]{2,60}$/.test(slug)) return NextResponse.redirect(new URL('/admin/eventos', url));
  const a = await accesoSala(slug);
  if (!a.ok) {
    if (a.motivo === 'sesion') return NextResponse.redirect(new URL(`/ingresar?next=${encodeURIComponent(`/api/zoom/iniciar?evento=${slug}`)}`, url));
    return volver('No hay sala para esta clase todavía.');
  }
  if (!a.anfitriona) return NextResponse.redirect(new URL(`/portal/eventos/${slug}/sala`, url));
  if (!zoomApiActiva) return NextResponse.redirect(`https://zoom.us/s/${a.reunion}`);
  try {
    return NextResponse.redirect(await enlaceInicio(a.reunion));
  } catch {
    // Sin enlace de inicio: zoom.us pide iniciar sesión con la cuenta de la anfitriona.
    return NextResponse.redirect(`https://zoom.us/s/${a.reunion}`);
  }
}
