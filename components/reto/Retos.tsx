'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Eraser } from 'lucide-react';
import Grafica, { type Marca, type Punto } from './Grafica';
import Opciones from './Opciones';
import Pregunta, { type Resultado } from './Pregunta';
import { PARTES, lineaValida, relacionFinal, type Banco, type Categoria, type Movimiento, type ParteVela, type Relacion } from '@/data/reto';
import { pivotes, type Vela } from '@/lib/reto/grafica';
import type { Respuesta } from '@/lib/reto/registro';

export interface PropsReto { onRespuesta: (r: Respuesta) => void; onFin: () => void }
const C = { verde: '#176244', oro: '#B8901E', oroClaro: '#CBA52F', zona: 'rgba(23,98,68,.16)', violeta: '#7C4DCC', gris: '#7B817E', azul: '#2563EB' };

/** Avanza ejercicio por ejercicio y registra cada respuesta. */
function useSecuencia(total: number, categoria: Categoria, { onRespuesta, onFin }: PropsReto) {
  const [idx, setIdx] = useState(0);
  const responder = (item: string) => (r: Resultado) => {
    onRespuesta({ categoria, item, ...r });
    if (idx + 1 >= total) onFin(); else setIdx(idx + 1);
  };
  return { idx, responder, contador: <p className="reto-contador">Ejercicio {idx + 1} de {total}</p> };
}

/* ---------------- Reto 1: velas ---------------- */
const NOMBRE: Record<ParteVela, string> = { apertura: 'la apertura', cierre: 'el cierre', maximo: 'el máximo', minimo: 'el mínimo' };
const ETIQUETA: Record<ParteVela, string> = { apertura: 'Apertura', cierre: 'Cierre', maximo: 'Máximo', minimo: 'Mínimo' };
const precioDe = (v: Vela, p: ParteVela) => ({ apertura: v.o, cierre: v.c, maximo: v.h, minimo: v.l }[p]);

function explicacionVela(alcista: boolean, parte: ParteVela) {
  if (parte === 'maximo') return 'El máximo es el punto más alto que alcanzó el precio: el extremo de la mecha superior.';
  if (parte === 'minimo') return 'El mínimo es el punto más bajo que alcanzó el precio: el extremo de la mecha inferior.';
  if (alcista) return parte === 'apertura'
    ? 'En una vela alcista (verde) el precio abrió abajo y subió: la apertura es la parte inferior del cuerpo.'
    : 'En una vela alcista (verde) el precio terminó arriba: el cierre es la parte superior del cuerpo.';
  return parte === 'apertura'
    ? 'En una vela bajista (roja) el precio abrió arriba y bajó: la apertura es la parte superior del cuerpo.'
    : 'En una vela bajista (roja) el precio terminó abajo: el cierre es la parte inferior del cuerpo.';
}

/** En celular, las velas se dibujan en un formato más alto para verse más grandes. */
function usePantallaEstrecha() {
  const [estrecha, setEstrecha] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 600px)');
    const cambiar = () => setEstrecha(mq.matches);
    cambiar(); mq.addEventListener('change', cambiar);
    return () => mq.removeEventListener('change', cambiar);
  }, []);
  return estrecha;
}

/** Preguntas concretas: nombran la vela y dicen qué precio buscar. */
function textoVela(parte: ParteVela, alcista: boolean) {
  const vela = alcista ? 'la vela alcista (verde)' : 'la vela bajista (roja)';
  return {
    apertura: { pregunta: `¿En qué precio abrió ${vela}?`, instruccion: 'La apertura es el primer precio de la vela. Toca su altura sobre la vela marcada.' },
    cierre: { pregunta: `¿En qué precio cerró ${vela}?`, instruccion: 'El cierre es el último precio de la vela. Toca su altura sobre la vela marcada.' },
    maximo: { pregunta: `¿Cuál fue el precio más alto que alcanzó ${vela}?`, instruccion: 'Toca la altura del precio máximo al que llegó durante la vela.' },
    minimo: { pregunta: `¿Cuál fue el precio más bajo que alcanzó ${vela}?`, instruccion: 'Toca la altura del precio mínimo al que llegó durante la vela.' },
  }[parte];
}
const dolares = (p: number) => `$${Math.round(p)}`;

function PreguntaVela({ velas, k, parte, onSiguiente, ultima }: { velas: [Vela, Vela]; k: number; parte: ParteVela; onSiguiente: (r: Resultado) => void; ultima: boolean }) {
  const [toque, setToque] = useState<number | null>(null);
  const estrecha = usePantallaEstrecha();
  const v = velas[k];
  const { pregunta, instruccion } = textoVela(parte, k === 0);
  // Correcto si el toque cae cerca de la parte pedida: margen del 12 % del tamaño total de la vela.
  const acierta = (precio: number) => Math.abs(precio - precioDe(v, parte)) <= (v.h - v.l) * 0.12;
  return <Pregunta pregunta={pregunta} instruccion={instruccion} listo={toque !== null}
    comprobar={() => toque !== null && acierta(toque)}
    acierto={`¡Excelente! Reconociste ${NOMBRE[parte]} de esta vela: ${dolares(precioDe(v, parte))}.`}
    pista={parte === 'apertura' || parte === 'cierre' ? 'Observa el cuerpo de la vela e inténtalo nuevamente.' : 'Observa las mechas de la vela e inténtalo nuevamente.'}
    explicacion={explicacionVela(k === 0, parte)} onSiguiente={onSiguiente} ultima={ultima}>
    {estado => {
      const fin = estado === 'acierto' || estado === 'revelado';
      const marcas: Marca[] = fin ? [{ i: k, precio: precioDe(v, parte), color: C.oro, etiqueta: `${ETIQUETA[parte]}: ${dolares(precioDe(v, parte))}`, lado: k === 0 ? 'der' : 'izq' }] : [];
      return <>
        <div className="reto-chips"><span className={`reto-chip ${k === 0 ? 'es-sube' : 'es-baja'}`}>{k === 0 ? 'Vela alcista' : 'Vela bajista'}</span></div>
        <Grafica velas={velas} dominio={[10, 100]} ejePrecio={10} activa={k} cuerpoMax={78} alto={estrecha ? 460 : 360} anchoVista={estrecha ? 420 : 640} marcas={marcas}
          lineasH={toque !== null && !fin ? [{ precio: toque, color: C.oro, guiones: '6 5', etiqueta: dolares(toque), enVela: k, grosor: 3 }] : []}
          onPunto={fin ? undefined : p => setToque(p.precio)} etiqueta={`Dos velas: una alcista y una bajista. ${pregunta}`} />
      </>;
    }}
  </Pregunta>;
}

export function RetoVelas({ velas, ...props }: PropsReto & { velas: [Vela, Vela] }) {
  const items = [0, 1].flatMap(k => PARTES.map(p => ({ k, parte: p.parte })));
  const { idx, responder, contador } = useSecuencia(items.length, 'velas', props);
  const it = items[idx];
  return <>{contador}<PreguntaVela key={idx} velas={velas} k={it.k} parte={it.parte} ultima={idx === items.length - 1}
    onSiguiente={responder(`velas-${it.k === 0 ? 'alcista' : 'bajista'}-${it.parte}`)} /></>;
}

/* ---------------- Reto 2: movimiento ---------------- */
const EXPLICA_MOV: Record<Movimiento, string> = {
  alcista: 'Los máximos y los mínimos son cada vez más altos: el precio está subiendo.',
  bajista: 'Los máximos y los mínimos son cada vez más bajos: el precio está bajando.',
  lateral: 'Los máximos y los mínimos se mantienen dentro de un rango: el precio se mueve de lado.',
};
function PreguntaMovimiento({ ej, onSiguiente, ultima }: { ej: Banco['movimiento'][number]; onSiguiente: (r: Resultado) => void; ultima: boolean }) {
  const [eleccion, setEleccion] = useState<string | null>(null);
  return <Pregunta pregunta="¿Qué movimiento reconoces?" instruccion="Observa el recorrido completo del precio, no solo el color de las velas." listo={eleccion !== null}
    comprobar={() => eleccion === ej.tipo} acierto="¡Muy bien! Reconociste el movimiento del precio."
    pista="Fíjate si los máximos y los mínimos suben, bajan o se mantienen." explicacion={EXPLICA_MOV[ej.tipo]} onSiguiente={onSiguiente} ultima={ultima}>
    {estado => {
      const fin = estado === 'acierto' || estado === 'revelado';
      const pv = pivotes(ej.velas);
      const marcas: Marca[] = fin ? [...pv.altos.map(i => ({ i, precio: ej.velas[i].h, color: C.oro })), ...pv.bajos.map(i => ({ i, precio: ej.velas[i].l, color: C.verde }))] : [];
      return <>
        {fin && <div className="reto-leyenda"><span><b className="reto-punto" style={{ background: C.oro }} /> Máximos</span><span><b className="reto-punto" style={{ background: C.verde }} /> Mínimos</span></div>}
        <Grafica velas={ej.velas} alto={300} marcas={marcas} etiqueta="Gráfica de velas para reconocer el movimiento del precio." />
        <Opciones etiqueta="Movimiento" valor={eleccion} onCambio={setEleccion} bloqueado={fin} correcta={estado === 'revelado' ? ej.tipo : undefined}
          opciones={[{ valor: 'alcista', etiqueta: 'Alcista' }, { valor: 'bajista', etiqueta: 'Bajista' }, { valor: 'lateral', etiqueta: 'Lateral' }]} />
      </>;
    }}
  </Pregunta>;
}
export function RetoMovimiento({ ejercicios, ...props }: PropsReto & { ejercicios: Banco['movimiento'] }) {
  const { idx, responder, contador } = useSecuencia(ejercicios.length, 'movimiento', props);
  return <>{contador}<PreguntaMovimiento key={idx} ej={ejercicios[idx]} ultima={idx === ejercicios.length - 1} onSiguiente={responder(`movimiento-${idx + 1}-${ejercicios[idx].tipo}`)} /></>;
}

/* ---------------- Reto 3: líneas de tendencia ---------------- */

function PreguntaTendencia({ ej, onSiguiente, ultima }: { ej: Banco['tendencia'][number]; onSiguiente: (r: Resultado) => void; ultima: boolean }) {
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const k = ej.tipo === 'alcista' ? 'l' : 'h';
  const [i1, i2] = ej.anclas;
  const ref = { a: { i: i1, precio: ej.velas[i1][k] }, b: { i: i2, precio: ej.velas[i2][k] } };
  const valida = () => puntos.length === 2 && lineaValida(ej.velas, ej.tipo, puntos[0], puntos[1]);
  return <Pregunta pregunta="¿Por dónde pasarías la línea de tendencia?" instruccion="Toca dos puntos de la gráfica. La línea se dibuja sola entre ellos."
    listo={puntos.length === 2} comprobar={valida} textoBoton="Comprobar mi línea"
    acierto="¡Muy bien! Reconociste los puntos que ayudan a identificar esta tendencia."
    pista="Observa dónde el precio ha venido reaccionando e inténtalo nuevamente."
    explicacion={ej.tipo === 'alcista' ? 'En una tendencia alcista, la línea se apoya en los mínimos, que van subiendo.' : 'En una tendencia bajista, la línea se apoya en los máximos, que van bajando.'}
    onSiguiente={onSiguiente} ultima={ultima}>
    {estado => {
      const fin = estado === 'acierto' || estado === 'revelado';
      return <>
        <div className="reto-chips"><span className={`reto-chip ${ej.tipo === 'alcista' ? 'es-sube' : 'es-baja'}`}>Movimiento {ej.tipo}</span>
          {!fin && puntos.length > 0 && <button type="button" className="reto-borrar" onClick={() => setPuntos([])}><Eraser size={16} aria-hidden="true" /> Borrar puntos</button>}</div>
        <Grafica velas={ej.velas} alto={320}
          marcas={[...puntos.map(p => ({ ...p, color: C.oroClaro })), ...(fin ? [{ ...ref.a, color: C.verde }, { ...ref.b, color: C.verde }] : [])]}
          recta={estado === 'revelado' ? { ...ref, color: C.verde, guiones: '8 6' } : puntos.length === 2 ? { a: puntos[0], b: puntos[1], color: estado === 'acierto' ? C.verde : C.oro } : undefined}
          onPunto={fin ? undefined : p => setPuntos(prev => prev.length >= 2 ? [p] : [...prev, p])}
          etiqueta={`Gráfica con movimiento ${ej.tipo}. Toca dos puntos para trazar la línea de tendencia.`} />
      </>;
    }}
  </Pregunta>;
}
export function RetoTendencia({ ejercicios, ...props }: PropsReto & { ejercicios: Banco['tendencia'] }) {
  const { idx, responder, contador } = useSecuencia(ejercicios.length, 'tendencia', props);
  return <>{contador}<PreguntaTendencia key={idx} ej={ejercicios[idx]} ultima={idx === ejercicios.length - 1} onSiguiente={responder(`tendencia-${ejercicios[idx].tipo}`)} /></>;
}

/* ---------------- Reto 4: niveles ---------------- */
function PreguntaNivel({ ej, onSiguiente, ultima }: { ej: Banco['niveles'][number]; onSiguiente: (r: Resultado) => void; ultima: boolean }) {
  const [nivel, setNivel] = useState<number | null>(null);
  const lo = Math.min(...ej.velas.map(v => v.l)), hi = Math.max(...ej.velas.map(v => v.h));
  const paso = (hi - lo) / 40;
  const mover = (d: number) => setNivel(n => Math.max(lo, Math.min(hi, (n ?? (lo + hi) / 2) + d)));
  // Vale tanto el nivel principal como el opuesto: los dos son zonas reales de reacción.
  const zonaElegida = nivel === null ? undefined : ej.zonas.find(z => nivel >= z.desde && nivel <= z.hasta);
  return <Pregunta pregunta="¿Dónde colocarías un nivel importante?" instruccion="Toca la gráfica para colocar la línea. Puedes arrastrarla o moverla con las flechas."
    listo={nivel !== null} comprobar={() => zonaElegida !== undefined} textoBoton="Comprobar mi nivel"
    acierto={`¡Muy bien! Encontraste una zona de ${zonaElegida?.tipo ?? ej.tipo}: ${zonaElegida?.tipo === 'resistencia' ? 'allí el precio dejó de subir' : 'allí el precio dejó de bajar'} varias veces.`}
    pista="Observa dónde el precio se ha detenido y ha cambiado de dirección varias veces."
    explicacion="En esta gráfica hay un soporte, donde el precio dejó de bajar, y una resistencia, donde dejó de subir. Los niveles importantes no siempre son precios exactos: muchas veces representan zonas donde debemos prestar atención."
    onSiguiente={onSiguiente} ultima={ultima}>
    {estado => {
      const fin = estado === 'acierto' || estado === 'revelado';
      return <>
        <div className="reto-nivel-wrap">
          <Grafica velas={ej.velas} alto={320} arrastrable={!fin}
            zonas={fin ? ej.zonas.map(z => ({ desde: z.desde, hasta: z.hasta, color: C.zona })) : []}
            lineasH={nivel !== null ? [{ precio: nivel, color: estado === 'acierto' ? C.verde : C.oro, etiqueta: 'Tu nivel', grosor: 3 }] : []}
            onPunto={fin ? undefined : p => setNivel(p.precio)} etiqueta="Gráfica con varios movimientos. Coloca una línea horizontal en el nivel importante." />
          {!fin && <div className="reto-flechas">
            <button type="button" onClick={() => mover(paso)} aria-label="Subir la línea"><ChevronUp size={24} /></button>
            <button type="button" onClick={() => mover(-paso)} aria-label="Bajar la línea"><ChevronDown size={24} /></button>
          </div>}
        </div>
      </>;
    }}
  </Pregunta>;
}
export function RetoNiveles({ ejercicios, ...props }: PropsReto & { ejercicios: Banco['niveles'] }) {
  const { idx, responder, contador } = useSecuencia(ejercicios.length, 'niveles', props);
  return <>{contador}<PreguntaNivel key={idx} ej={ejercicios[idx]} ultima={idx === ejercicios.length - 1} onSiguiente={responder(`niveles-${ejercicios[idx].tipo}`)} /></>;
}

/* ---------------- Reto 5: medias móviles ---------------- */
const COLOR = { oro: C.oroClaro, violeta: C.violeta } as const;
const NOMBRE_COLOR = { oro: 'Línea dorada', violeta: 'Línea violeta' } as const;
type ColorMedia = keyof typeof COLOR;
const serie = (vals: number[]) => vals.map((p, i) => [i, p] as [number, number]).slice(2);
const EXPLICA_RAPIDA = 'La EMA 8 se calcula con las últimas 8 velas: por eso acompaña más de cerca al precio y reacciona antes. La EMA 21 usa más velas y es más lenta y suave.';

function PreguntaColor({ g, ema8Color, pregunta, buscar, onSiguiente, ultima }: {
  g: Banco['medias']['rapida']['g']; ema8Color: ColorMedia; pregunta: string; buscar: 8 | 21; onSiguiente: (r: Resultado) => void; ultima: boolean;
}) {
  const [eleccion, setEleccion] = useState<string | null>(null);
  const otro: ColorMedia = ema8Color === 'oro' ? 'violeta' : 'oro';
  const correcta = buscar === 8 ? ema8Color : otro;
  return <Pregunta pregunta={pregunta} instruccion="Toca una de las líneas o elige su color." listo={eleccion !== null}
    comprobar={() => eleccion === correcta} acierto="¡Muy bien! Reconociste la media."
    pista="Observa cuál de las dos líneas acompaña más de cerca a las velas."
    explicacion={buscar === 8 ? EXPLICA_RAPIDA : 'La EMA 21 usa más velas para su cálculo: por eso es la línea más suave y la que se aleja más del precio.'}
    onSiguiente={onSiguiente} ultima={ultima}>
    {estado => {
      const fin = estado === 'acierto' || estado === 'revelado';
      const linea = (c: ColorMedia, vals: number[]) => ({ id: c, puntos: serie(vals), color: COLOR[c], grosor: 3.5, elegida: eleccion === c, onElegir: fin ? undefined : () => setEleccion(c) });
      return <>
        <Grafica velas={g.velas} alto={320} lineas={[linea(ema8Color, g.ema8), linea(otro, g.ema21)]}
          marcas={fin ? [{ i: g.ema8.length - 1, precio: g.ema8.at(-1)!, color: COLOR[ema8Color], etiqueta: 'EMA 8', lado: 'izq' }, { i: g.ema21.length - 1, precio: g.ema21.at(-1)!, color: COLOR[otro], etiqueta: 'EMA 21', lado: 'izq' }] : []}
          etiqueta="Gráfica de velas con dos medias móviles sin nombre: una dorada y una violeta." />
        <Opciones etiqueta="Media móvil" valor={eleccion} onCambio={setEleccion} bloqueado={fin} correcta={estado === 'revelado' ? correcta : undefined}
          opciones={(['oro', 'violeta'] as ColorMedia[]).map(c => ({ valor: c, etiqueta: NOMBRE_COLOR[c], color: COLOR[c] }))} />
      </>;
    }}
  </Pregunta>;
}

const EXPLICA_REL: Record<Relacion, string> = {
  encima: 'La EMA 8 (gris) está por encima de la EMA 21 (azul): los precios más recientes están por encima del promedio de más largo plazo. El impulso es alcista.',
  debajo: 'La EMA 8 (gris) está por debajo de la EMA 21 (azul): los precios más recientes están por debajo del promedio de más largo plazo. El impulso es bajista.',
  cruce: 'Las dos medias se están cruzando: el impulso del precio está cambiando.',
};
function PreguntaLectura({ g, onSiguiente, ultima }: { g: Banco['medias']['lectura']; onSiguiente: (r: Resultado) => void; ultima: boolean }) {
  const [eleccion, setEleccion] = useState<string | null>(null);
  const rel = relacionFinal(g);
  return <Pregunta pregunta="¿Qué observas en este momento?" instruccion="Fíjate en la zona resaltada, al final de la gráfica." listo={eleccion !== null}
    comprobar={() => eleccion === rel} acierto="¡Muy bien! Leíste correctamente lo que muestran las medias."
    pista="Mira la zona resaltada: ¿qué línea está arriba, la gris o la azul?" explicacion={EXPLICA_REL[rel]} onSiguiente={onSiguiente} ultima={ultima}>
    {estado => {
      const fin = estado === 'acierto' || estado === 'revelado';
      return <>
        <div className="reto-leyenda"><span><i style={{ background: C.gris }} /> EMA 8</span><span><i style={{ background: C.azul }} /> EMA 21</span></div>
        <Grafica velas={g.velas} alto={320} resaltarUltimas={3}
          lineas={[{ puntos: serie(g.ema21), color: C.azul, grosor: 3.5 }, { puntos: serie(g.ema8), color: C.gris, grosor: 3.5 }]}
          etiqueta="Gráfica con la EMA 8 en gris y la EMA 21 en azul. Las últimas velas están resaltadas." />
        <Opciones etiqueta="Lectura de las medias" valor={eleccion} onCambio={setEleccion} bloqueado={fin} correcta={estado === 'revelado' ? rel : undefined}
          opciones={[{ valor: 'encima', etiqueta: 'La EMA 8 está por encima de la EMA 21' }, { valor: 'debajo', etiqueta: 'La EMA 8 está por debajo de la EMA 21' }, { valor: 'cruce', etiqueta: 'Las dos medias están cruzándose' }]} />
      </>;
    }}
  </Pregunta>;
}

export function RetoMedias({ banco, ...props }: PropsReto & { banco: Banco['medias'] }) {
  const items = [
    { item: 'medias-mas-rapida', el: (p: PEl) => <PreguntaColor {...p} g={banco.rapida.g} ema8Color={banco.rapida.ema8Color} buscar={8} pregunta="¿Cuál de estas dos medias responde más rápido a los cambios del precio?" /> },
    { item: 'medias-identifica-ema8', el: (p: PEl) => <PreguntaColor {...p} g={banco.identificar.g} ema8Color={banco.identificar.ema8Color} buscar={8} pregunta="Identifica las amigas del precio: ¿cuál es la EMA 8?" /> },
    { item: 'medias-identifica-ema21', el: (p: PEl) => <PreguntaColor {...p} g={banco.identificar.g} ema8Color={banco.identificar.ema8Color} buscar={21} pregunta="Y ahora: ¿cuál es la EMA 21?" /> },
    { item: 'medias-identifica-ema21-b', el: (p: PEl) => <PreguntaColor {...p} g={banco.identificar2.g} ema8Color={banco.identificar2.ema8Color} buscar={21} pregunta="En esta otra gráfica, ¿cuál es la EMA 21?" /> },
    { item: 'medias-lectura', el: (p: PEl) => <PreguntaLectura {...p} g={banco.lectura} /> },
  ];
  const { idx, responder, contador } = useSecuencia(items.length, 'medias', props);
  return <>{contador}<div key={idx}>{items[idx].el({ onSiguiente: responder(items[idx].item), ultima: idx === items.length - 1 })}</div></>;
}
type PEl = { onSiguiente: (r: Resultado) => void; ultima: boolean };
