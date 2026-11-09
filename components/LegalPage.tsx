import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import { getContenido } from '@/lib/contenido';
import { Enriquecido, parrafos } from '@/lib/contenido/texto';

export default async function LegalPage({ title, campo }: { title: string; campo: 'terminos' | 'privacidad' }) {
  const { legal } = await getContenido();
  return <>
    <SiteHeader />
    <main className="section"><div className="wrap legal">
      <h1>{title}</h1>
      {parrafos(legal[campo]).map((p, i) => p.startsWith('# ')
        ? <h2 key={i}>{p.slice(2)}</h2>
        : <p key={i}><Enriquecido texto={p} /></p>)}
    </div></main>
    <SiteFooter />
  </>;
}
