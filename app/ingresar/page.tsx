import type { Metadata } from 'next';
import { Suspense } from 'react';
import AuthForm from '@/components/AuthForm';
import AuthLayout from '@/components/AuthLayout';
import { getContenido } from '@/lib/contenido';
import { envioPropio } from '@/lib/correo/enviar';

export const metadata: Metadata = { title: 'Iniciar sesión | Diana Gamboa' };
export default async function Page() {
  const { acceso: a } = await getContenido();
  return <AuthLayout title={a.ingresarTitulo} subtitle={a.ingresarTexto}>
    <Suspense><AuthForm mode="ingresar" envioPropio={envioPropio} /></Suspense>
  </AuthLayout>;
}
