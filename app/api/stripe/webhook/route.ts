import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe, WEBHOOK_SECRETO } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { procesarSesionPagada } from '@/lib/eventos/pago';

export const dynamic = 'force-dynamic';

/*
 * Avisos de Stripe. En Stripe → Developers → Webhooks se crea un destino con la dirección
 * https://TU-DOMINIO/api/stripe/webhook y estos eventos:
 * checkout.session.completed, checkout.session.async_payment_succeeded,
 * checkout.session.expired y charge.refunded.
 */
export async function POST(req: Request) {
  const s = stripe();
  const admin = supabaseAdmin();
  if (!s || !admin || !WEBHOOK_SECRETO) return NextResponse.json({ error: 'Stripe no está configurado.' }, { status: 503 });

  let evento: Stripe.Event;
  try {
    evento = s.webhooks.constructEvent(await req.text(), req.headers.get('stripe-signature') ?? '', WEBHOOK_SECRETO);
  } catch {
    return NextResponse.json({ error: 'Firma no válida.' }, { status: 400 });
  }

  try {
    switch (evento.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await procesarSesionPagada(evento.data.object.id);
        break;
      case 'checkout.session.expired': {
        // Nadie pagó a tiempo: el cupo apartado se libera.
        await admin.from('inscripciones').update({ estado: 'cancelada', actualizado_en: new Date().toISOString() })
          .eq('stripe_session_id', evento.data.object.id).eq('estado', 'pendiente');
        break;
      }
      case 'charge.refunded': {
        // Reembolso total hecho desde Stripe: se retira el acceso y se libera el cupo.
        const cargo = evento.data.object;
        const pago = typeof cargo.payment_intent === 'string' ? cargo.payment_intent : cargo.payment_intent?.id;
        if (pago && cargo.refunded) {
          await admin.from('inscripciones').update({ estado: 'reembolsada', actualizado_en: new Date().toISOString() })
            .eq('stripe_pago_id', pago).eq('estado', 'pagada');
        }
        break;
      }
    }
  } catch (e) {
    console.error('Error procesando el aviso de Stripe', evento.type, e);
    // Stripe reintenta el aviso si respondemos con error.
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
  return NextResponse.json({ recibido: true });
}
