import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Clock3, HelpCircle, Lock, Video } from 'lucide-react';
import Brand from '@/components/Brand';
import SalaZoom from '@/components/eventos/SalaZoom';
import { accesoSala } from '@/lib/eventos/sala';
import { leerEnlaceClase } from '@/lib/eventos/enlaceClase';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getContenido } from '@/lib/contenido';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Entrar a la clase | Diana Gamboa', robots: { index: false, follow: false } };

/** Enlace personal de los correos de recordatorio: entra directo a la clase, sin iniciar sesión. */
export default async function ClaseDirecta({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const datos = leerEnlaceClase(token);
  const admin = supabaseAdmin();
  const { data: ev } = datos && admin ? await admin.from('eventos_privados').select('slug').eq('id', datos.eventoId).maybeSingle() : { data: null };
  const slug = ev?.slug as string | undefined;
  const a = slug ? await accesoSala(slug, token) : null;
  const { global: g } = await getContenido();

  // La clase no se abre dentro de la web (sin la app de Zoom): se va directo a Zoom.
  if (a?.ok && a.modo === 'enlace') redirect(a.enlace);

  const cabecera = <header className="clase-directa-cabecera"><div className="wrap"><Brand logo={g.logo} nombre={g.nombreSitio} /></div></header>;

  if (!a?.ok) {
    const texto = !a || a.motivo === 'sesion' || a.motivo === 'evento'
      ? 'Este enlace no es válido o ya venció. Entra a tu portal con tu correo para ver la clase.'
      : a.motivo === 'sin_pago' ? 'La clase es solo para las personas inscritas en este evento.'
        : 'La sala de esta clase se abrirá antes de la hora de inicio. Vuelve a abrir este enlace en unos minutos.';
    return <>{cabecera}<section className="lesson-head"><div className="wrap">
      <div className="lesson-title"><div><p className="eyebrow">Sala de clase</p><h1>{a && 'evento' in a && a.evento ? a.evento.titulo : 'Entrar a la clase'}</h1></div></div>
      <p className="evento-estado es-cerrado sala-aviso">{a && !a.ok && a.motivo === 'sin_sala' ? <Clock3 size={18} aria-hidden="true" /> : <Lock size={18} aria-hidden="true" />} {texto}</p>
      <p><Link href={slug ? `/portal/eventos/${slug}` : '/portal'} className="btn btn-green btn-sm">Ir a mi portal</Link></p>
    </div></section></>;
  }

  return <>{cabecera}<section className="sala">
    <div className="wrap sala-cabecera">
      <h1><Video size={20} aria-hidden="true" /> {a.evento.titulo}</h1>
      <details className="sala-ayuda">
        <summary><HelpCircle size={16} aria-hidden="true" /> Ayuda</summary>
        <ul>
          <li><strong>Cambiar cámara o micrófono:</strong> en la barra inferior, flechita <strong>^</strong> junto a «Video» o «Audio».</li>
          <li><strong>¿Dice «Esperando al anfitrión»?</strong> La clase aún no empieza: entrarás solo cuando Diana la inicie.</li>
          <li><strong>No te escuchan o no te ven:</strong> permite el micrófono y la cámara en el candado de la barra de direcciones y recarga.</li>
        </ul>
      </details>
    </div>
    <SalaZoom slug={a.evento.slug} token={token} />
  </section></>;
}
