import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import FormEvento from '@/components/admin/FormEvento';
import { supabaseServidor } from '@/lib/supabase/servidor';
import { fechaEvento, type Evento } from '@/lib/eventos/formato';

const AVISO = 'Este evento es educativo y no es una recomendación de inversión ni asesoría financiera. Invertir tiene riesgos y puedes perder dinero. Los resultados pasados no garantizan resultados futuros. Cada persona es responsable de sus propias decisiones.';

export default async function NuevoEventoPage() {
  const hoy = new Date();
  const supabase = await supabaseServidor();
  const { data } = supabase ? await supabase.from('eventos_privados').select('id, titulo, fecha_tipo, fecha, fecha_fin, fecha_periodo, fecha_mes, fecha_anio').order('creado_en', { ascending: false }) : { data: null };
  const otros = (data ?? []).map(o => ({ id: o.id as string, titulo: o.titulo as string, fecha: fechaEvento(o as Evento) }));
  return <>
    <p><Link href="/admin/eventos" className="admin-volver"><ArrowLeft size={16} aria-hidden="true" /> Eventos</Link></p>
    <header className="admin-cabecera"><h1>Nuevo evento</h1><p>Completa los datos. Puedes guardarlo oculto y publicarlo cuando esté listo.</p></header>
    <FormEvento otros={otros} inicial={{
      slug: '', titulo: '', subtitulo: '', detalles: '', resumen: '', contenido: '', acceso: '', aviso: AVISO,
      fecha_tipo: 'aproximada', fecha: null, fecha_periodo: null, fecha_mes: hoy.getMonth() + 1, fecha_anio: hoy.getFullYear(),
      horario: '', precio: '', cupos: 50, inscripcion_abierta: true, visible: false, recordatorios: true, enlace_pago: '', etiqueta: '', en_lista: true, solo_lista_espera: false, lista_de: null, fecha_fin: null, hora_inicio: null, hora_local: '', zona: 'America/New_York',
    }} />
  </>;
}
