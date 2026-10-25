import type { Metadata } from 'next';
import AuthForm from '@/components/AuthForm';
import AuthLayout from '@/components/AuthLayout';

export const metadata: Metadata = { title: 'Registro gratuito | Diana Gamboa' };
export default function RegistroPage() {
  return <AuthLayout title="Crea tu cuenta gratis" subtitle="Accede a tu ruta de aprendizaje, los lives y la biblioteca de recursos. Solo toma un minuto.">
    <AuthForm mode="registro" />
  </AuthLayout>;
}
