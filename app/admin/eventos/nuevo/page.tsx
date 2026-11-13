import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import FormEvento from '@/components/admin/FormEvento';

const AVISO = 'Este evento es educativo y no es una recomendación de inversión ni asesoría financiera. Invertir tiene riesgos y puedes perder dinero. Los resultados pasados no garantizan resultados futuros. Cada persona es responsable de sus propias decisiones.';

export default function NuevoEventoPage() {
  const hoy = new Date();
  return <>
    <p><Link href="/admin/eventos" className="admin-volver"><ArrowLeft size={16} aria-hidden="true" /> Eventos</Link></p>
    <header className="admin-cabecera"><h1>Nuevo evento</h1><p>Completa los datos. Puedes guardarlo oculto y publicarlo cuando esté listo.</p></header>
    <FormEvento inicial={{
      slug: '', titulo: '', subtitulo: '', detalles: '', resumen: '', contenido: '', acceso: '', aviso: AVISO,
      fecha_tipo: 'aproximada', fecha: null, fecha_periodo: null, fecha_mes: hoy.getMonth() + 1, fecha_anio: hoy.getFullYear(),
      horario: '', precio: '', cupos: 50, inscripcion_abierta: true, visible: false,
    }} />
  </>;
}
