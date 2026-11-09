import Image from 'next/image';
import Brand from './Brand';
import { getContenido } from '@/lib/contenido';
import { Parrafos } from '@/lib/contenido/texto';

export default async function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const { acceso, global: g } = await getContenido();
  return <main className="auth">
    <div className="auth-panel">
      <Brand logo={g.logo} nombre={g.nombreSitio} />
      <div className="auth-box">
        <h1>{title}</h1>
        <div className="auth-sub"><Parrafos texto={subtitle} /></div>
        {children}
      </div>
    </div>
    <div className="auth-visual" aria-hidden="true">
      <Image src={acceso.foto} alt="" fill sizes="50vw" />
    </div>
  </main>;
}
