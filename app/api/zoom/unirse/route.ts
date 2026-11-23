import { NextResponse } from 'next/server';
import { accesoSala } from '@/lib/eventos/sala';
import { firmaZoom, zakAnfitriona, zoomApiActiva } from '@/lib/zoom';

export const dynamic = 'force-dynamic';

const MENSAJES = {
  sesion: 'Tu sesión expiró. Vuelve a iniciar sesión para entrar a la clase.',
  evento: 'No encontramos este evento.',
  sin_pago: 'La sala es solo para las personas inscritas en este evento.',
  sin_sala: 'La sala de esta clase todavía no está abierta. Vuelve a intentarlo unos minutos antes de la hora de inicio.',
  sin_zoom: 'La sala de clase todavía no está configurada.',
} as const;

/**
 * Datos para entrar a la sala de clase (los usa /zoom/sala.html, en la misma web).
 * Solo responde a quien tiene su cupo pagado; la administradora entra como anfitriona.
 */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get('evento') ?? '';
  const sinCache = { 'Cache-Control': 'no-store' };
  if (!/^[a-z0-9-]{2,60}$/.test(slug)) return NextResponse.json({ error: MENSAJES.evento }, { status: 400, headers: sinCache });
  const a = await accesoSala(slug);
  if (!a.ok) return NextResponse.json({ error: MENSAJES[a.motivo], motivo: a.motivo }, { status: a.motivo === 'sesion' ? 401 : 403, headers: sinCache });

  // La anfitriona inicia la reunión desde la web si está la app Server-to-Server de Zoom.
  let zak = '';
  let aviso = '';
  if (a.anfitriona) {
    if (zoomApiActiva) {
      try { zak = await zakAnfitriona(); } catch (e) { aviso = (e as Error).message; }
    } else aviso = 'Para iniciar la clase como anfitriona desde la web falta la app Server-to-Server de Zoom. Mientras tanto, inicia la reunión en la aplicación de Zoom y aquí entrarás como participante.';
  }
  const rol = a.anfitriona && zak ? 1 : 0;
  return NextResponse.json({
    signature: firmaZoom(a.reunion, rol),
    meetingNumber: a.reunion,
    passWord: a.clave,
    userName: a.nombre,
    userEmail: a.correo,
    zak,
    anfitriona: rol === 1,
    aviso,
    titulo: a.evento.titulo,
    volver: `/portal/eventos/${a.evento.slug}`,
  }, { headers: sinCache });
}
