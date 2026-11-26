import 'server-only';
import { createHmac } from 'node:crypto';
import { CORREO_ADMINISTRADORA } from '@/lib/administradora';

/*
 * Sala de clase con Zoom dentro de la web (Zoom Meeting SDK).
 * Variables (solo en Vercel, nunca en el código ni en el chat):
 * - ZOOM_SDK_CLIENT_ID y ZOOM_SDK_CLIENT_SECRET: app «General App» con Meeting SDK (marketplace.zoom.us).
 *   Con ellas los alumnos entran a la clase sin salir de la web.
 * - Opcionales, app «Server-to-Server OAuth»: ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID y ZOOM_CLIENT_SECRET.
 *   Con ellas Diana puede iniciar la clase como anfitriona desde la web y crear la reunión con un botón.
 * - Opcional: ZOOM_ANFITRIONA, correo de la cuenta de Zoom Pro (por defecto, el de la administradora).
 */
const SDK_ID = process.env.ZOOM_SDK_CLIENT_ID ?? '';
const SDK_SECRETO = process.env.ZOOM_SDK_CLIENT_SECRET ?? '';
const CUENTA = process.env.ZOOM_ACCOUNT_ID ?? '';
const API_ID = process.env.ZOOM_CLIENT_ID ?? '';
const API_SECRETO = process.env.ZOOM_CLIENT_SECRET ?? '';
const ANFITRIONA = (process.env.ZOOM_ANFITRIONA || CORREO_ADMINISTRADORA).toLowerCase();

export const zoomSdkActivo = Boolean(SDK_ID && SDK_SECRETO);
export const zoomApiActiva = Boolean(CUENTA && API_ID && API_SECRETO);

const b64url = (v: string | Buffer) => Buffer.from(v).toString('base64url');

/**
 * Firma (JWT) para entrar a una reunión con el Meeting SDK.
 * role 0 = participante, role 1 = anfitriona. Vale 2 horas.
 */
export function firmaZoom(reunion: string, rol: 0 | 1) {
  const iat = Math.floor(Date.now() / 1000) - 30;
  const exp = iat + 2 * 60 * 60;
  const cabecera = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const datos = b64url(JSON.stringify({ appKey: SDK_ID, sdkKey: SDK_ID, mn: reunion, role: rol, iat, exp, tokenExp: exp, video_webrtc_mode: 1 }));
  const firma = createHmac('sha256', SDK_SECRETO).update(`${cabecera}.${datos}`).digest('base64url');
  return `${cabecera}.${datos}.${firma}`;
}

let token: { valor: string; vence: number } | null = null;

/** Token de la API de Zoom (Server-to-Server OAuth). Se reutiliza mientras no venza. */
async function tokenApi() {
  if (!zoomApiActiva) throw new Error('Falta configurar la app Server-to-Server OAuth de Zoom.');
  if (token && token.vence > Date.now() + 60_000) return token.valor;
  const r = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(CUENTA)}`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${API_ID}:${API_SECRETO}`).toString('base64')}` },
    cache: 'no-store',
  });
  if (!r.ok) throw new Error(`Zoom rechazó las credenciales (${r.status}). Revisa ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID y ZOOM_CLIENT_SECRET.`);
  const d = await r.json() as { access_token: string; expires_in: number };
  token = { valor: d.access_token, vence: Date.now() + d.expires_in * 1000 };
  return token.valor;
}

async function api<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const r = await fetch(`https://api.zoom.us/v2${ruta}`, {
    ...opciones,
    headers: { Authorization: `Bearer ${await tokenApi()}`, 'Content-Type': 'application/json', ...opciones.headers },
    cache: 'no-store',
  });
  if (!r.ok) {
    const detalle = await r.text().catch(() => '');
    console.error('Zoom API', ruta, r.status, detalle);
    throw new Error(`Zoom respondió con un error (${r.status}).${r.status === 400 || r.status === 404 ? ` Revisa que ${ANFITRIONA} sea la cuenta de Zoom Pro.` : ''}`);
  }
  return (r.status === 204 ? null : await r.json()) as T;
}

/** Enlace para que la anfitriona inicie la reunión en Zoom (aplicación o zoom.us). Vence en unas horas: se pide al momento. */
export async function enlaceInicio(reunion: string) {
  const d = await api<{ start_url?: string }>(`/meetings/${encodeURIComponent(reunion)}`);
  if (!d.start_url) throw new Error('Zoom no devolvió el enlace de inicio.');
  return d.start_url;
}

/** Clave ZAK de la anfitriona: permite iniciar la reunión desde la web. */
export async function zakAnfitriona() {
  const d = await api<{ token: string }>(`/users/${encodeURIComponent(ANFITRIONA)}/token?type=zak`);
  return d.token;
}

/**
 * Crea una reunión recurrente (un día por cada día del evento, a la misma hora),
 * sin sala de espera (los inscritos entran directo cuando la anfitriona inicia) y con código. Devuelve el número y el código de la reunión.
 */
export async function crearReunionZoom({ titulo, inicio, dias, duracionMin }: { titulo: string; inicio: string; dias: number; duracionMin: number }) {
  const cuerpo = {
    topic: titulo.slice(0, 200),
    type: dias > 1 ? 8 : 2,
    start_time: inicio.replace(/\.\d{3}Z$/, 'Z'),
    duration: duracionMin,
    timezone: 'America/New_York',
    ...(dias > 1 ? { recurrence: { type: 1, repeat_interval: 1, end_times: dias } } : {}),
    settings: {
      waiting_room: false, join_before_host: false, mute_upon_entry: true,
      host_video: true, participant_video: false, approval_type: 2,
      auto_recording: 'cloud', meeting_authentication: false,
    },
  };
  const d = await api<{ id: number; password?: string; join_url?: string }>(`/users/${encodeURIComponent(ANFITRIONA)}/meetings`, { method: 'POST', body: JSON.stringify(cuerpo) });
  return { reunion: String(d.id), clave: unirClave(d.password ?? '', pwdDeEnlace(d.join_url ?? '')) };
}

/** «https://us06web.zoom.us/j/81234567890?pwd=…» o «812 3456 7890» → «81234567890». */
export function numeroReunion(texto: string) {
  const enlace = texto.match(/\/(?:j|wc|s)\/(\d{9,12})/);
  if (enlace) return enlace[1];
  const solo = texto.replace(/[\s-]/g, '');
  return /^\d{9,12}$/.test(solo) ? solo : '';
}

/*
 * La columna «clave» guarda el código de acceso y, si se pegó el enlace de invitación,
 * su parte cifrada «pwd» (así el enlace abre Zoom sin pedir el código): «482913#pwd=Abc…».
 */
export function pwdDeEnlace(texto: string) {
  return texto.match(/[?&]pwd=([A-Za-z0-9._-]+)/)?.[1] ?? '';
}
export function unirClave(codigo: string, pwd: string) {
  return pwd ? `${codigo}#pwd=${pwd}` : codigo;
}
export function partesClave(guardada: string) {
  const [codigo, pwd = ''] = (guardada ?? '').split('#pwd=');
  return { codigo, pwd };
}
/** Enlace para entrar a la reunión con la aplicación de Zoom. */
export function enlaceUnirse(reunion: string, guardada: string) {
  const { pwd } = partesClave(guardada);
  return `https://zoom.us/j/${reunion}${pwd ? `?pwd=${pwd}` : ''}`;
}
