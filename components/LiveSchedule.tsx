'use client';

import { useEffect, useState } from 'react';
import { programacion } from '@/data/academia';

const DAYS = ['Domingos', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábados'];
const ZONES = [
  { label: 'EE. UU. (Nueva York)', tz: 'America/New_York' },
  { label: 'Colombia', tz: 'America/Bogota' },
  { label: 'México (CDMX)', tz: 'America/Mexico_City' },
];

/** Convierte una hora de Nueva York (HH:MM) de hoy a un instante real, respetando el horario de verano. */
function fromNewYork(time: string) {
  const [h, m] = time.split(':').map(Number);
  const now = new Date();
  const guess = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h, m);
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
    .formatToParts(guess).map(p => [p.type, p.value]));
  const asNy = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return new Date(guess - (asNy - guess));
}
const fmt = (d: Date, tz?: string) => new Intl.DateTimeFormat('es', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true }).format(d);

export default function LiveSchedule() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return <div className="schedule">
    <ul>
      {programacion.map(item => {
        const at = fromNewYork(item.time);
        return <li key={item.title} className="schedule-row">
          <div><h3>{item.title}</h3><p>{item.days.map(d => DAYS[d]).join(' · ')}</p></div>
          <dl>
            {ZONES.map(z => <div key={z.tz}><dt>{z.label}</dt><dd>{ready ? fmt(at, z.tz) : '—'}</dd></div>)}
            <div className="schedule-local"><dt>Tu hora local</dt><dd>{ready ? fmt(at) : '—'}</dd></div>
          </dl>
        </li>;
      })}
    </ul>
    <p className="schedule-note">Programación provisional. Confirma cada transmisión en el canal de YouTube.</p>
  </div>;
}
