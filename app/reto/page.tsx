import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import RetoJuego from '@/components/reto/RetoJuego';

export const metadata: Metadata = {
  title: 'El Reto de la Gráfica | Diana Gamboa',
  description: '¿Qué tanto sabes leer el mercado? Pon a prueba tus conocimientos sobre velas japonesas con un pequeño reto interactivo.',
};

export default function RetoDemoPage() {
  return <>
    <SiteHeader />
    <main id="contenido" className="reto-pagina"><div className="wrap"><RetoJuego modo="demo" /></div></main>
    <SiteFooter />
  </>;
}
