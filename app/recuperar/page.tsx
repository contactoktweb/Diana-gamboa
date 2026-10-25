import type { Metadata } from 'next';
import AuthForm from '@/components/AuthForm';
import AuthLayout from '@/components/AuthLayout';

export const metadata: Metadata = { title: 'Recuperar contraseña | Diana Gamboa' };
export default function RecuperarPage() {
  return <AuthLayout title="Recupera tu contraseña" subtitle="Escribe tu correo y te enviaremos un enlace para crear una nueva.">
    <AuthForm mode="recuperar" />
  </AuthLayout>;
}
