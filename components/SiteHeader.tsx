import Brand from './Brand';
import SiteHeaderMenu from './SiteHeaderMenu';
import { getContenido } from '@/lib/contenido';

export default async function SiteHeader() {
  const { global } = await getContenido();
  return <header className="site-header">
    <div className="wrap header-inner">
      <Brand logo={global.logo} nombre={global.nombreSitio} />
      <SiteHeaderMenu boton={global.botonPrincipal} />
    </div>
  </header>;
}
