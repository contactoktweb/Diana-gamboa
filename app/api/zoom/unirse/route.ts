import { NextResponse } from 'next/server';
import { accesoSala } from '@/lib/eventos/sala';
import { firmaZoom, zoomSdkActivo } from '@/lib/zoom';

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
  const a = await accesoSala(slug, new URL(req.url).searchParams.get('t') ?? undefined);
  if (!a.ok) return NextResponse.json({ error: MENSAJES[a.motivo], motivo: a.motivo }, { status: a.motivo === 'sesion' ? 401 : 403, headers: sinCache });
  if (!zoomSdkActivo) return NextResponse.json({ error: MENSAJES.sin_zoom, motivo: 'sin_zoom' }, { status: 403, headers: sinCache });

  // Dentro de la web todos entran como participantes: la anfitriona inicia la clase en Zoom
  // (botón «Iniciar la clase en Zoom»), así su sesión de anfitriona no se cierra al abrir esta vista.
  const rol = 0;
  const zak = '';
  const aviso = '';
  return NextResponse.json({
    signature: firmaZoom(a.reunion, rol),
    meetingNumber: a.reunion,
    passWord: a.clave,
    userName: a.nombre,
    userEmail: a.correo,
    zak,
    anfitriona: false,
    aviso,
    titulo: a.evento.titulo,
    volver: `/portal/eventos/${a.evento.slug}`,
  }, { headers: sinCache });
}
