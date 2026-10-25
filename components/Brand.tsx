import Link from 'next/link';

/** Logotipo provisional en texto. Se reemplaza fácilmente por el logo definitivo. */
export default function Brand({ href = '/', light = false }: { href?: string; light?: boolean }) {
  return <Link href={href} className={`brand ${light ? 'brand-light' : ''}`} aria-label="Diana Gamboa, ir al inicio">
    <span className="brand-mark" aria-hidden="true">DG</span>
    <span className="brand-text"><strong>DIANA GAMBOA</strong><small>EL IDIOMA DEL MERCADO</small></span>
  </Link>;
}
