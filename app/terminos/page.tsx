import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Términos y condiciones | Diana Gamboa' };
export default function TerminosPage() { return <LegalPage title="Términos y condiciones" />; }
