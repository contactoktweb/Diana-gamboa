import type { Metadata } from 'next';
import { Suspense } from 'react';
import AuthForm from '@/components/AuthForm';
import AuthLayout from '@/components/AuthLayout';

export const metadata: Metadata = { title: 'Nueva contraseña | Diana Gamboa' };
export default function Page() {
  return <AuthLayout title={'Crea tu nueva contraseña'} subtitle={'Escribe tu nueva contraseña dos veces para confirmarla.'}>
    <Suspense><AuthForm mode="nueva-clave" /></Suspense>
  </AuthLayout>;
}
