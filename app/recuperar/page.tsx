import type { Metadata } from 'next';
import { Suspense } from 'react';
import AuthForm from '@/components/AuthForm';
import AuthLayout from '@/components/AuthLayout';
import { getContenido } from '@/lib/contenido';

export const metadata: Metadata = { title: 'Recuperar contraseña | Diana Gamboa' };
export default async function Page() {
  const { acceso: a } = await getContenido();
  return <AuthLayout title={a.recuperarTitulo} subtitle={a.recuperarTexto}>
    <Suspense><AuthForm mode="recuperar" /></Suspense>
  </AuthLayout>;
}
