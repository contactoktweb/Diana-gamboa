import { NIVELES } from '@/data/reto';

/** Insignia digital del nivel: un medallón con velas que crecen según el nivel. */
export default function Insignia({ nivel, tam = 120 }: { nivel: string; tam?: number }) {
  const idx = Math.max(0, NIVELES.findIndex(n => n.nombre === nivel));
  const color = NIVELES[idx].color;
  return <svg width={tam} height={tam} viewBox="0 0 120 120" role="img" aria-label={`Insignia: ${nivel}`} className="reto-insignia">
    <circle cx="60" cy="60" r="56" fill="#FFFDF6" stroke="#CBA52F" strokeWidth="2" />
    <circle cx="60" cy="60" r="49" fill="none" stroke={color} strokeWidth="4" />
    <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(15,65,49,.15)" strokeWidth="1.5" strokeDasharray="3 4" />
    {[0, 1, 2, 3].map(k => {
      const h = 14 + k * 7, x = 33 + k * 15, on = k <= idx;
      return <g key={k} opacity={on ? 1 : 0.3}>
        <line x1={x} x2={x} y1={80 - h - 7} y2={84} stroke={on ? '#B8901E' : '#0F4131'} strokeWidth="2.5" strokeLinecap="round" />
        <rect x={x - 5} y={80 - h} width="10" height={h} rx="2" fill={on ? '#CBA52F' : 'none'} stroke={on ? '#B8901E' : '#0F4131'} strokeWidth="2" />
      </g>;
    })}
  </svg>;
}
