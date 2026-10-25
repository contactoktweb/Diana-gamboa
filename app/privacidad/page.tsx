import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Política de privacidad | Diana Gamboa' };
export default function PrivacidadPage() { return <LegalPage title="Política de privacidad" />; }
