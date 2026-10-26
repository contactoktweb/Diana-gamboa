import Image from 'next/image';
import Link from 'next/link';

/** Logotipo oficial (manual de marca). `light` usa la versión en negativo para fondos oscuros. */
export default function Brand({ href = '/', light = false, tagline = false }: { href?: string; light?: boolean; tagline?: boolean }) {
  return <Link href={href} className={`brand ${light ? 'brand-light' : ''}`} aria-label="Diana Gamboa, ir al inicio">
    <Image src={light ? '/brand/logo-dg-light.png' : '/brand/logo-dg.png'} alt="Diana Gamboa" width={600} height={345} className="brand-logo" priority />
    {tagline && <span className="brand-tagline">El idioma<br />del mercado</span>}
  </Link>;
}
