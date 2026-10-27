import { Instagram, ShieldAlert, X, Youtube } from 'lucide-react';
import { INSTAGRAM, YOUTUBE } from '@/data/academia';

const nunca = [
  'No administro cuentas de inversión de mis alumnos.',
  'No solicito dinero para realizar operaciones en nombre de otras personas.',
  'No ofrezco señales privadas de compra y venta.',
  'No solicito contraseñas ni acceso a cuentas de inversión.',
];

export default function ScamNotice() {
  return <section className="section scam" aria-labelledby="scam-title">
    <div className="wrap scam-card" data-reveal>
      <div className="scam-icon"><ShieldAlert size={34} aria-hidden="true" /></div>
      <div className="scam-copy">
        <p className="eyebrow eyebrow-alert">Prevención de estafas</p>
        <h2 id="scam-title">No tengo Telegram ni WhatsApp de inversiones.</h2>
        <ul className="scam-list">
          {nunca.map(t => <li key={t}><X size={18} aria-hidden="true" /> {t}</li>)}
        </ul>
        <p>Si alguien te contacta en mi nombre para ofrecerte inversiones o pedirte dinero, es una estafa. Mis únicos canales oficiales son:</p>
      </div>
      <div className="scam-links">
        <a className="btn btn-outline" href={YOUTUBE} target="_blank" rel="noopener noreferrer"><Youtube size={20} aria-hidden="true" /> YouTube: @DianaGamboaMomentum</a>
        <a className="btn btn-outline" href={INSTAGRAM} target="_blank" rel="noopener noreferrer"><Instagram size={20} aria-hidden="true" /> Instagram: @dianagamboamomentum</a>
      </div>
    </div>
  </section>;
}
