import Link from 'next/link';
import { Heart, Instagram, Youtube } from 'lucide-react';
import Brand from './Brand';
import { INSTAGRAM, YOUTUBE } from '@/data/academia';

export default function SiteFooter() {
  return <footer className="site-footer">
    <div className="wrap footer-grid">
      <div className="footer-brand">
        <Brand light />
        <p>El idioma del mercado: aprende a leer, analizar y desarrollar tu propio criterio.</p>
      </div>
      <div>
        <h2>Redes oficiales</h2>
        <ul>
          <li><a href={YOUTUBE} target="_blank" rel="noopener noreferrer"><Youtube size={18} aria-hidden="true" /> YouTube</a></li>
          <li><a href={INSTAGRAM} target="_blank" rel="noopener noreferrer"><Instagram size={18} aria-hidden="true" /> @dianagamboamomentum</a></li>
        </ul>
      </div>
      <div>
        <h2>Academia</h2>
        <ul>
          <li><Link href="/sobre-diana">Sobre Diana</Link></li>
          <li><Link href="/registro">Registro gratuito</Link></li>
          <li><Link href="/ingresar">Iniciar sesión</Link></li>
          <li><a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">Contacto</a></li>
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
      <p className="footer-disclaimer">El contenido de esta academia es exclusivamente educativo y no constituye asesoría financiera ni recomendaciones personalizadas de inversión.</p>
      <p>© {new Date().getFullYear()} Diana Gamboa · <a href="https://www.kytcode.lat" target="_blank" rel="noopener noreferrer">Desarrollado por K&amp;T <Heart size={12} fill="currentColor" aria-hidden="true" /></a></p>
    </div>
  </footer>;
}
