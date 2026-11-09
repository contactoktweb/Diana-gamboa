'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_KEY, SUPABASE_URL, supabaseActivo } from './config';

let cliente: SupabaseClient | null = null;

/** Cliente de Supabase en el navegador (null si Supabase no está configurado). */
export function supabaseNavegador() {
  if (!supabaseActivo) return null;
  cliente ??= createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  return cliente;
}
