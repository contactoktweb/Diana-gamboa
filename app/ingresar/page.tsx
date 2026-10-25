import type { Metadata } from 'next';
import AuthForm from '@/components/AuthForm';
import AuthLayout from '@/components/AuthLayout';

export const metadata: Metadata = { title: 'Iniciar sesión | Diana Gamboa' };
export default function IngresarPage() {
  return <AuthLayout title="Bienvenido de nuevo" subtitle="Ingresa para continuar con tu formación.">
    <AuthForm mode="ingresar" />
  </AuthLayout>;
}
