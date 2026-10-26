import { Instagram, ShieldAlert, Youtube } from 'lucide-react';
import { INSTAGRAM, YOUTUBE } from '@/data/academia';

export default function ScamNotice() {
  return <section className="section scam" aria-labelledby="scam-title">
    <div className="wrap scam-card" data-reveal>
      <div className="scam-icon"><ShieldAlert size={34} aria-hidden="true" /></div>
      <div className="scam-copy">
        <p className="eyebrow eyebrow-alert">Prevención de estafas</p>
        <h2 id="scam-title">No tengo Telegram ni WhatsApp de inversiones.</h2>
        <p>Mis únicas cuentas oficiales son mi canal de YouTube y mi Instagram <strong>@dianagamboamomentum</strong>. Si alguien te contacta en mi nombre para ofrecerte inversiones o pedirte dinero, es una estafa.</p>
      </div>
      <div className="scam-links">
        <a className="btn btn-outline" href={YOUTUBE} target="_blank" rel="noopener noreferrer"><Youtube size={20} aria-hidden="true" /> YouTube oficial</a>
        <a className="btn btn-outline" href={INSTAGRAM} target="_blank" rel="noopener noreferrer"><Instagram size={20} aria-hidden="true" /> Instagram oficial</a>
      </div>
    </div>
  </section>;
}
