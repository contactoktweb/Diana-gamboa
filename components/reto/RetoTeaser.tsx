import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Grafica from './Grafica';
import { velasDesdeCierres } from '@/lib/reto/grafica';
import { Parrafos } from '@/lib/contenido/texto';

const velas = velasDesdeCierres([100, 102, 101, 104, 103, 101, 104, 107, 106, 104, 107, 110, 109, 107, 110, 113], 5, 0.6);

/** Invitación al reto en la página principal. */
export default function RetoTeaser({ etiqueta, titulo, texto, boton, nota }: { etiqueta: string; titulo: string; texto: string; boton: string; nota: string }) {
  return <section className="section teaser" aria-labelledby="teaser-title">
    <div className="wrap teaser-grid" data-reveal>
      <div className="teaser-copy">
        <p className="eyebrow eyebrow-gold">{etiqueta}</p>
        <h2 id="teaser-title">{titulo}</h2>
        <Parrafos texto={texto} />
        <Link href="/reto" className="btn btn-gold btn-lg">{boton} <ArrowRight size={20} aria-hidden="true" /></Link>
        {nota && <p className="cta-note">{nota}</p>}
      </div>
      <div className="teaser-grafica" aria-hidden="true">
        <Grafica velas={velas} alto={260} etiqueta="Gráfica ilustrativa"
          recta={{ a: { i: 5, precio: velas[5].l }, b: { i: 13, precio: velas[13].l }, color: '#F2C94C', guiones: '8 7' }}
          marcas={[{ i: 9, precio: velas[9].l, color: '#F2C94C', etiqueta: '?', lado: 'der' }]} />
      </div>
    </div>
  </section>;
}
