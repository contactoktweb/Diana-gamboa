import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import RetoJuego from '@/components/reto/RetoJuego';

export const metadata: Metadata = {
  title: 'El Reto de la Gráfica | Diana Gamboa',
  description: '¿Qué tanto sabes leer el mercado? Cinco retos visuales sobre velas, tendencias, niveles y medias móviles. Gratis y sin registro.',
};

export default function RetoDemoPage() {
  return <>
    <SiteHeader />
    <main id="contenido" className="reto-pagina"><div className="wrap"><RetoJuego modo="visitante" /></div></main>
    <SiteFooter />
  </>;
}
