import { NextResponse } from 'next/server';
import { ejecutarRecordatorios } from '@/lib/eventos/recordatorios';
import { continuarAvisos } from '@/lib/eventos/avisos';
import { urlDelSitio } from '@/lib/sitio';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/*
 * Recordatorios automáticos de los eventos y aviso de nuevos grupos (a quienes falten). Vercel la llama cada mañana (vercel.json → crons)
 * con la cabecera «Authorization: Bearer CRON_SECRET». Sin esa clave, no hace nada.
 */
export async function GET(req: Request) {
  const secreto = process.env.CRON_SECRET ?? '';
  if (!secreto || req.headers.get('authorization') !== `Bearer ${secreto}`) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }
  const sitio = await urlDelSitio();
  const r = { ...(await ejecutarRecordatorios(sitio)), avisos: await continuarAvisos(sitio) };
  console.log('Recordatorios de eventos', JSON.stringify(r));
  return NextResponse.json(r);
}
