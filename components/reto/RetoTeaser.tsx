import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Grafica from './Grafica';
import { velasDesdeCierres } from '@/lib/reto/grafica';

const velas = velasDesdeCierres([100, 102, 101, 104, 103, 101, 104, 107, 106, 104, 107, 110, 109, 107, 110, 113], 5, 0.6);

/** Invitación al reto en la página principal. */
export default function RetoTeaser() {
  return <section className="section teaser" aria-labelledby="teaser-title">
    <div className="wrap teaser-grid" data-reveal>
      <div className="teaser-copy">
        <p className="eyebrow eyebrow-gold">El Reto de la Gráfica</p>
        <h2 id="teaser-title">¿Qué tanto sabes leer el mercado?</h2>
        <p>Pon a prueba tus conocimientos con unos pequeños retos sobre velas, tendencias, niveles y medias móviles.</p>
        <Link href="/reto" className="btn btn-gold btn-lg">Acepto el reto <ArrowRight size={20} aria-hidden="true" /></Link>
        <p className="cta-note">No necesitas experiencia. Aquí también se aprende intentando.</p>
      </div>
      <div className="teaser-grafica" aria-hidden="true">
        <Grafica velas={velas} alto={260} etiqueta="Gráfica ilustrativa"
          recta={{ a: { i: 5, precio: velas[5].l }, b: { i: 13, precio: velas[13].l }, color: '#F2C94C', guiones: '8 7' }}
          marcas={[{ i: 9, precio: velas[9].l, color: '#F2C94C', etiqueta: '?', lado: 'der' }]} />
      </div>
    </div>
  </section>;
}
