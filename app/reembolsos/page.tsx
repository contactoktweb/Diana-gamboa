import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Política de reembolsos | Diana Gamboa' };
export default function ReembolsosPage() { return <LegalPage title="Política de reembolsos" campo="reembolsos" />; }
