import type { Metadata } from 'next';
import { Suspense } from 'react';
import AuthForm from '@/components/AuthForm';
import AuthLayout from '@/components/AuthLayout';
import { getContenido } from '@/lib/contenido';

export const metadata: Metadata = { title: 'Registro gratuito | Diana Gamboa' };
export default async function Page() {
  const { acceso: a } = await getContenido();
  return <AuthLayout title={a.registroTitulo} subtitle={a.registroTexto}>
    <Suspense><AuthForm mode="registro" confirmacion={{ titulo: a.confirmacionTitulo, texto: a.confirmacionTexto }} /></Suspense>
  </AuthLayout>;
}
