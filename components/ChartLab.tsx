'use client';

import { useState } from 'react';

const concepts = [
  { name: 'Velas', headline: 'La vela es información.', detail: 'Empieza por cuatro datos: apertura, cierre, máximo y mínimo. Antes de una opinión, busca la evidencia.', question: '¿Qué sucedió?' },
  { name: 'Tendencia', headline: 'Mira la dirección, no el ruido.', detail: 'Reconoce impulsos y retrocesos dentro de la estructura del precio. Un movimiento aislado no es toda la tendencia.', question: '¿Cómo se mueve?' },
  { name: 'Niveles', headline: 'Una línea no es una promesa.', detail: 'Observa zonas de soporte y resistencia sin confundirlas con una predicción o una operación garantizada.', question: '¿Dónde importa?' },
  { name: 'Lectura completa', headline: 'Conecta todo con la historia.', detail: 'Integra velas, tendencia, niveles y contexto. Hazte mejores preguntas para formar un análisis propio.', question: '¿Qué puedo inferir?' },
];
const candles = [
  [48, 174, 198, 155, 213], [82, 199, 164, 146, 211], [116, 160, 146, 126, 178],
  [150, 146, 167, 130, 184], [184, 170, 130, 114, 182], [218, 128, 113, 96, 143],
  [252, 112, 141, 98, 154], [286, 141, 100, 84, 153], [320, 102, 121, 89, 139],
  [354, 121, 99, 80, 134], [388, 98, 70, 54, 114], [422, 69, 92, 53, 107],
  [456, 91, 65, 44, 109], [490, 66, 48, 29, 84], [524, 47, 70, 35, 91],
];
const trend = 'M48 182 L82 180 L116 158 L150 163 L184 148 L218 133 L252 137 L286 115 L320 119 L354 107 L388 83 L422 87 L456 73 L490 54 L524 65';

/** Laboratorio interactivo: un gráfico ilustrativo que resalta un concepto a la vez. */
export default function ChartLab() {
  const [active, setActive] = useState(0);
  const c = concepts[active];
  return <div className="lab">
    <div className="lab-tabs" role="tablist" aria-label="Conceptos de la gráfica">
      {concepts.map((item, i) => <button key={item.name} type="button" role="tab" id={`lab-tab-${i}`} aria-selected={active === i} aria-controls="lab-panel" className={active === i ? 'is-active' : ''} onClick={() => setActive(i)}>
        <small>0{i + 1}</small> {item.name}
      </button>)}
    </div>
    <div className="lab-body">
      <div className={`lab-chart lab-chart-${active}`} role="img" aria-label="Gráfico ilustrativo para explicar velas, tendencia, niveles y contexto. No contiene datos reales.">
        <svg viewBox="0 0 580 280" aria-hidden="true">
          {[32, 78, 124, 170, 216, 262].map(y => <line className="lab-grid" key={'y' + y} x1="12" x2="568" y1={y} y2={y} />)}
          <rect x="20" y="91" width="540" height="55" className="lab-zone" rx="3" />
          <path className="lab-area" d={`${trend} L524 270 L48 270Z`} />
          <path className="lab-trend" d={trend} fill="none" />
          {candles.map(([x, o, cl, h, l], i) => <g key={i} className={`lab-candle ${cl < o ? 'up' : 'down'}`}>
            <line x1={x} x2={x} y1={h} y2={l} /><rect x={x - 7} y={Math.min(o, cl)} width="14" height={Math.max(5, Math.abs(o - cl))} rx="2" />
          </g>)}
          <circle cx="490" cy="52" r="34" className="lab-context" />
        </svg>
        <p className="lab-note">Gráfico ilustrativo · no son cotizaciones reales</p>
      </div>
      <div className="lab-panel" id="lab-panel" role="tabpanel" aria-labelledby={`lab-tab-${active}`}>
        <h3>{c.headline}</h3>
        <p>{c.detail}</p>
        <p className="lab-question">Pregúntate: <strong>{c.question}</strong></p>
      </div>
    </div>
  </div>;
}
