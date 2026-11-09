import Image from 'next/image';
import Link from 'next/link';

/** Logotipo. `logo` es la imagen configurada en la administración. */
export default function Brand({ href = '/', logo, nombre = 'Diana Gamboa' }: { href?: string; logo: string; nombre?: string }) {
  return <Link href={href} className="brand" aria-label={`${nombre}, ir al inicio`}>
    <Image src={logo} alt={nombre} width={600} height={345} className="brand-logo" priority unoptimized={logo.endsWith('.svg')} />
  </Link>;
}
