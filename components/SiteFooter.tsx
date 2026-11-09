import Link from 'next/link';
import { Heart, Instagram, Youtube } from 'lucide-react';
import Brand from './Brand';
import { getContenido } from '@/lib/contenido';

export default async function SiteFooter() {
  const { global: g } = await getContenido();
  const contacto = g.correoContacto ? `mailto:${g.correoContacto}` : g.instagram;
  return <footer className="site-footer">
    <div className="wrap footer-grid">
      <div className="footer-brand">
        <Brand logo={g.logoClaro} nombre={g.nombreSitio} />
        <p>{g.pieFrase}</p>
      </div>
      <div>
        <h2>Redes oficiales</h2>
        <ul>
          <li><a href={g.youtube} target="_blank" rel="noopener noreferrer"><Youtube size={18} aria-hidden="true" /> YouTube</a></li>
          <li><a href={g.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={18} aria-hidden="true" /> {g.instagramUsuario}</a></li>
        </ul>
      </div>
      <div>
        <h2>Academia</h2>
        <ul>
          <li><Link href="/sobre-diana">Sobre Diana</Link></li>
          <li><Link href="/registro">Registro gratuito</Link></li>
          <li><Link href="/ingresar">Iniciar sesión</Link></li>
          <li><a href={contacto} target={g.correoContacto ? undefined : '_blank'} rel="noopener noreferrer">Contacto</a></li>
        </ul>
      </div>
      <div>
        <h2>Legal</h2>
        <ul>
          <li><Link href="/terminos">Términos y condiciones</Link></li>
          <li><Link href="/privacidad">Política de privacidad</Link></li>
        </ul>
      </div>
    </div>
    <div className="wrap footer-base">
      <p className="footer-disclaimer">{g.avisoEducativo}</p>
      <p>© {new Date().getFullYear()} {g.nombreSitio} · <a href="https://www.kytcode.lat" target="_blank" rel="noopener noreferrer">Desarrollado por K&amp;T <Heart size={12} fill="currentColor" aria-hidden="true" /></a></p>
    </div>
  </footer>;
}
