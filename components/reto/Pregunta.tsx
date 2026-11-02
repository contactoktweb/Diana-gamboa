'use client';

import { useState } from 'react';
import { ArrowRight, Check, Lightbulb, RotateCcw } from 'lucide-react';

export const MAX_INTENTOS = 3;
export type Estado = 'respondiendo' | 'error' | 'acierto' | 'revelado';
export interface Resultado { aciertoPrimerIntento: boolean; intentos: number }

interface Props {
  pregunta: string;
  instruccion?: string;
  /** Contenido interactivo; recibe el estado para mostrar la solución al final. */
  children: (estado: Estado) => React.ReactNode;
  listo: boolean;
  comprobar: () => boolean;
  textoBoton?: string;
  acierto: string;
  pista: string;
  explicacion: string;
  onSiguiente: (r: Resultado) => void;
  ultima?: boolean;
}

/**
 * Una pregunta del reto. El primer intento es el que puntúa; después del error se
 * muestra una pista y se puede volver a intentar. Al tercer error se revela la respuesta.
 */
export default function Pregunta({ pregunta, instruccion, children, listo, comprobar, textoBoton = 'Comprobar respuesta', acierto, pista, explicacion, onSiguiente, ultima }: Props) {
  const [intentos, setIntentos] = useState(0);
  const [estado, setEstado] = useState<Estado>('respondiendo');
  const terminado = estado === 'acierto' || estado === 'revelado';

  function verificar() {
    const n = intentos + 1;
    setIntentos(n);
    if (comprobar()) setEstado('acierto');
    else setEstado(n >= MAX_INTENTOS ? 'revelado' : 'error');
  }

  return <div className="reto-pregunta">
    <div className="reto-enunciado">
      <h2>{pregunta}</h2>
      {instruccion && <p>{instruccion}</p>}
    </div>
    <div className="reto-lienzo">{children(estado)}</div>
    <div className="reto-pie" aria-live="polite">
      {estado === 'acierto' && <div className="reto-feedback es-acierto"><Check size={22} aria-hidden="true" /><div><strong>{acierto}</strong><p>{explicacion}</p></div></div>}
      {estado === 'error' && <div className="reto-feedback es-error"><RotateCcw size={22} aria-hidden="true" /><div><strong>Todavía no.</strong><p>{pista}</p></div></div>}
      {estado === 'revelado' && <div className="reto-feedback es-revelado"><Lightbulb size={22} aria-hidden="true" /><div><strong>Mira la respuesta en la gráfica.</strong><p>{explicacion}</p></div></div>}
      {terminado
        ? <button type="button" className="btn btn-gold btn-lg reto-accion" onClick={() => onSiguiente({ aciertoPrimerIntento: estado === 'acierto' && intentos === 1, intentos })}>{ultima ? 'Continuar' : 'Siguiente'} <ArrowRight aria-hidden="true" /></button>
        : <button type="button" className="btn btn-gold btn-lg reto-accion" disabled={!listo} onClick={verificar}>{estado === 'error' ? 'Comprobar de nuevo' : textoBoton} <ArrowRight aria-hidden="true" /></button>}
    </div>
  </div>;
}
