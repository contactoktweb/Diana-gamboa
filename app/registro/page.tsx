import type { Metadata } from 'next';
import AuthForm from '@/components/AuthForm';
import AuthLayout from '@/components/AuthLayout';

export const metadata: Metadata = { title: 'Registro gratuito | Diana Gamboa' };
export default function RegistroPage() {
  return <AuthLayout title="¡Bienvenido a tu academia!" subtitle="Crea tu cuenta gratuita y descubre tu ruta de aprendizaje. Encontrarás clases organizadas, transmisiones y recursos para comenzar desde cero.">
    <AuthForm mode="registro" />
  </AuthLayout>;
}
