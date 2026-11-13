import 'server-only';
import Stripe from 'stripe';
import { adminActivo } from '@/lib/supabase/admin';

/*
 * Pagos con Stripe. Las claves solo existen en el servidor (variables de Vercel):
 * STRIPE_SECRET_KEY (sk_live_… o sk_test_…) y STRIPE_WEBHOOK_SECRET (whsec_…).
 * Sin clave, los eventos funcionan con preinscripción.
 */
const CLAVE = process.env.STRIPE_SECRET_KEY ?? '';
export const WEBHOOK_SECRETO = process.env.STRIPE_WEBHOOK_SECRET ?? '';
export const stripeActivo = Boolean(CLAVE) && adminActivo;

let cliente: Stripe | null = null;
export function stripe() {
  if (!stripeActivo) return null;
  cliente ??= new Stripe(CLAVE);
  return cliente;
}
