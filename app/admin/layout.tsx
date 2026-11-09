import type { Metadata } from 'next';
import AdminNav from '@/components/admin/AdminNav';
import { getContenido } from '@/lib/contenido';
import { exigirAdmin } from '@/lib/sesion';
import { supabaseActivo } from '@/lib/supabase/config';

export const metadata: Metadata = { title: 'Administración | Diana Gamboa', robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sesion = await exigirAdmin();
  const { global: g } = await getContenido();
  return <div className="admin">
    <AdminNav logo={g.logo} nombre={sesion?.perfil?.nombre ?? ''} />
    <main className="admin-main" id="contenido">
      {!supabaseActivo && <div className="admin-aviso" role="status">
        <strong>Modo de demostración.</strong> Supabase aún no está conectado: puedes recorrer la administración, pero los cambios no se guardan y no hay alumnos reales. Consulta el apartado «Puesta en marcha» del manual.
      </div>}
      {children}
    </main>
  </div>;
}
