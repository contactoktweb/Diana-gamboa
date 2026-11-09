import { Instagram, ShieldAlert, X, Youtube } from 'lucide-react';
import { Parrafos } from '@/lib/contenido/texto';
import { getContenido } from '@/lib/contenido';

export default async function ScamNotice() {
  const { inicio: c, global: g } = await getContenido();
  return <section className="section scam" aria-labelledby="scam-title">
    <div className="wrap scam-card" data-reveal>
      <div className="scam-icon"><ShieldAlert size={34} aria-hidden="true" /></div>
      <div className="scam-copy">
        <p className="eyebrow eyebrow-alert">{c.estafasEtiqueta}</p>
        <h2 id="scam-title">{c.estafasTitulo}</h2>
        <ul className="scam-list">
          {c.estafasLista.map((t, i) => <li key={i}><X size={18} aria-hidden="true" /> {t.texto}</li>)}
        </ul>
        <Parrafos texto={c.estafasTexto} />
      </div>
      <div className="scam-links">
        <a className="btn btn-outline" href={g.youtube} target="_blank" rel="noopener noreferrer"><Youtube size={20} aria-hidden="true" /> YouTube: {g.youtubeUsuario}</a>
        <a className="btn btn-outline" href={g.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={20} aria-hidden="true" /> Instagram: {g.instagramUsuario}</a>
      </div>
    </div>
  </section>;
}
