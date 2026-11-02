'use client';

import { useId, useRef } from 'react';
import type { Vela } from '@/lib/reto/grafica';

export interface Linea { puntos: [number, number][]; color: string; grosor?: number; guiones?: string; id?: string; onElegir?: () => void; elegida?: boolean }
export interface LineaH { precio: number; color: string; guiones?: string; etiqueta?: string; grosor?: number }
export interface Zona { desde: number; hasta: number; color: string }
export interface Marca { i: number; precio: number; color: string; etiqueta?: string; lado?: 'izq' | 'der' }
export interface Punto { i: number; precio: number }

interface Props {
  velas: Vela[];
  alto?: number;
  dominio?: [number, number];
  lineas?: Linea[];
  lineasH?: LineaH[];
  zonas?: Zona[];
  marcas?: Marca[];
  /** Línea recta extendida entre dos puntos (líneas de tendencia). */
  recta?: { a: Punto; b: Punto; color: string; guiones?: string };
  /** Vela activa: las demás se atenúan. */
  activa?: number;
  cuerpoMax?: number;
  /** Sombrea las últimas velas para indicar «este momento». */
  resaltarUltimas?: number;
  onPunto?: (p: Punto, fase: 'inicio' | 'mover' | 'fin') => void;
  arrastrable?: boolean;
  etiqueta: string;
}

const W = 640, PAD = { l: 14, r: 14, t: 18, b: 18 };

export default function Grafica({ velas, alto = 320, dominio, lineas = [], lineasH = [], zonas = [], marcas = [], recta, activa, cuerpoMax = 26, resaltarUltimas, onPunto, arrastrable, etiqueta }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const clip = useId();
  const arrastrando = useRef(false);
  const n = velas.length;
  const precios = [...velas.flatMap(v => [v.h, v.l]), ...lineas.flatMap(l => l.puntos.map(p => p[1]))];
  const [min, max] = dominio ?? (() => { const lo = Math.min(...precios), hi = Math.max(...precios), m = (hi - lo) * 0.1; return [lo - m, hi + m]; })();
  const paso = (W - PAD.l - PAD.r) / n;
  const altoUtil = alto - PAD.t - PAD.b;
  const x = (i: number) => PAD.l + (i + 0.5) * paso;
  const y = (p: number) => PAD.t + ((max - p) / (max - min)) * altoUtil;
  const ancho = Math.min(paso * 0.62, cuerpoMax);

  function aPunto(ev: React.PointerEvent): Punto | null {
    const el = svg.current; const ctm = el?.getScreenCTM();
    if (!el || !ctm) return null;
    const pt = el.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    const p = pt.matrixTransform(ctm.inverse());
    return { i: Math.max(-0.5, Math.min(n - 0.5, (p.x - PAD.l) / paso - 0.5)), precio: max - ((p.y - PAD.t) / altoUtil) * (max - min) };
  }
  const handlers = onPunto ? {
    onPointerDown: (ev: React.PointerEvent<SVGSVGElement>) => { const p = aPunto(ev); if (!p) return; arrastrando.current = true; if (arrastrable) ev.currentTarget.setPointerCapture(ev.pointerId); onPunto(p, 'inicio'); },
    onPointerMove: (ev: React.PointerEvent<SVGSVGElement>) => { if (!arrastrando.current || !arrastrable) return; const p = aPunto(ev); if (p) onPunto(p, 'mover'); },
    onPointerUp: (ev: React.PointerEvent<SVGSVGElement>) => { if (!arrastrando.current) return; arrastrando.current = false; const p = aPunto(ev); if (p && arrastrable) onPunto(p, 'fin'); },
  } : {};

  // Recta extendida a todo el ancho.
  let segmento: [number, number, number, number] | null = null;
  if (recta && Math.abs(recta.b.i - recta.a.i) > 0.01) {
    const m = (recta.b.precio - recta.a.precio) / (recta.b.i - recta.a.i);
    const en = (i: number) => recta.a.precio + m * (i - recta.a.i);
    segmento = [x(-0.5), y(en(-0.5)), x(n - 0.5), y(en(n - 0.5))];
  }

  return <svg ref={svg} viewBox={`0 0 ${W} ${alto}`} className={`reto-grafica ${onPunto ? 'es-interactiva' : ''} ${arrastrable ? 'es-arrastrable' : ''}`} role="img" aria-label={etiqueta} {...handlers}>
    <defs><clipPath id={clip}><rect x={PAD.l} y={PAD.t} width={W - PAD.l - PAD.r} height={altoUtil} /></clipPath></defs>
    {[0.2, 0.4, 0.6, 0.8].map(f => <line key={f} className="reto-rejilla" x1={PAD.l} x2={W - PAD.r} y1={PAD.t + altoUtil * f} y2={PAD.t + altoUtil * f} />)}
    {resaltarUltimas && <rect className="reto-momento" x={x(n - resaltarUltimas) - paso / 2} y={PAD.t} width={paso * resaltarUltimas + PAD.r} height={altoUtil} />}
    {zonas.map((z, k) => <rect key={k} x={PAD.l} width={W - PAD.l - PAD.r} y={y(Math.max(z.desde, z.hasta))} height={Math.abs(y(z.desde) - y(z.hasta))} fill={z.color} rx="4" />)}
    {velas.map((v, i) => {
      const sube = v.c >= v.o;
      return <g key={i} className={`reto-vela ${sube ? 'sube' : 'baja'}`} opacity={activa !== undefined && activa !== i ? 0.28 : 1}>
        <line x1={x(i)} x2={x(i)} y1={y(v.h)} y2={y(v.l)} />
        <rect x={x(i) - ancho / 2} width={ancho} y={y(Math.max(v.o, v.c))} height={Math.max(2, Math.abs(y(v.o) - y(v.c)))} rx="2" />
      </g>;
    })}
    <g clipPath={`url(#${clip})`}>
      {lineas.map((l, k) => {
        const d = l.puntos.map(([i, p], j) => `${j ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p).toFixed(1)}`).join(' ');
        return <g key={l.id ?? k}>
          <path d={d} fill="none" stroke={l.color} strokeWidth={(l.grosor ?? 3) + (l.elegida ? 2 : 0)} strokeDasharray={l.guiones} strokeLinecap="round" strokeLinejoin="round" />
          {l.onElegir && <path d={d} fill="none" stroke="transparent" strokeWidth={24} className="reto-linea-toque" onPointerDown={ev => { ev.stopPropagation(); l.onElegir?.(); }} />}
        </g>;
      })}
      {segmento && <line x1={segmento[0]} y1={segmento[1]} x2={segmento[2]} y2={segmento[3]} stroke={recta!.color} strokeWidth={3} strokeDasharray={recta!.guiones} strokeLinecap="round" />}
    </g>
    {lineasH.map((h, k) => <g key={k}>
      <line x1={PAD.l} x2={W - PAD.r} y1={y(h.precio)} y2={y(h.precio)} stroke={h.color} strokeWidth={h.grosor ?? 2.5} strokeDasharray={h.guiones} />
      {h.etiqueta && <text x={W - PAD.r - 6} y={y(h.precio) - 8} textAnchor="end" className="reto-texto" fill={h.color}>{h.etiqueta}</text>}
    </g>)}
    {marcas.map((m, k) => <g key={k}>
      <circle cx={x(m.i)} cy={y(m.precio)} r={7} fill={m.color} stroke="#fff" strokeWidth={2.5} />
      {m.etiqueta && <text x={x(m.i) + (m.lado === 'izq' ? -14 : 14)} y={y(m.precio) + 5} textAnchor={m.lado === 'izq' ? 'end' : 'start'} className="reto-texto reto-texto-marca" fill={m.color}>{m.etiqueta}</text>}
    </g>)}
  </svg>;
}
