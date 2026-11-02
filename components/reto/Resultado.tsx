'use client';

import Link from 'next/link';
import { ArrowRight, CircleCheck, CircleDot, RotateCcw } from 'lucide-react';
import Insignia from './Insignia';
import { CATEGORIAS, TOTAL_PUNTOS, recomendar, type Categoria } from '@/data/reto';
import { resumir, type Intento } from '@/lib/reto/registro';

export default function Resultado({ intento, primero, onRepetir, visitante }: { intento: Intento; primero?: Intento; onRepetir: () => void; visitante?: boolean }) {
  const { puntaje, nivel, porCategoria, fuertes, debiles } = resumir(intento.respuestas);
  const recs = recomendar(debiles);
  const esRepeticion = primero && primero.id !== intento.id;
  return <div className="reto-resultado">
    <p className="eyebrow">¡Reto completado!</p>
    <div className="reto-nivel">
      <Insignia nivel={nivel.nombre} />
      <div>
        <p className="reto-nivel-etiqueta">Tu nivel actual</p>
        <h2>{nivel.nombre}</h2>
        <p className="reto-puntos"><strong>{puntaje}</strong> de {TOTAL_PUNTOS} puntos</p>
        <div className="reto-barra" role="img" aria-label={`${puntaje} de ${TOTAL_PUNTOS} puntos`}><span style={{ width: `${(puntaje / TOTAL_PUNTOS) * 100}%` }} /></div>
        <p className="reto-nivel-msg">{nivel.mensaje}</p>
      </div>
    </div>

    <div className="reto-categorias">
      {fuertes.length > 0 && <div>
        <h3>Esto es lo que ya reconoces</h3>
        <ul>{fuertes.map(c => <li key={c}><CircleCheck size={20} className="es-fuerte" aria-hidden="true" /> {CATEGORIAS[c].nombre} <small>{porCategoria[c].aciertos}/{porCategoria[c].total}</small></li>)}</ul>
      </div>}
      {debiles.length > 0 && <div>
        <h3>Esto es lo que puedes seguir practicando</h3>
        <ul>{debiles.map((c: Categoria) => <li key={c}><CircleDot size={20} className="es-practica" aria-hidden="true" /> {CATEGORIAS[c].nombre} <small>{porCategoria[c].aciertos}/{porCategoria[c].total}</small></li>)}</ul>
      </div>}
    </div>

    <div className="reto-recomendacion">
      <p className="eyebrow eyebrow-gold">Tu siguiente paso</p>
      {recs.map((r, i) => <div key={r.slug} className="reto-rec">
        <p>{i === 0 ? (visitante ? 'Te recomiendo comenzar con' : 'Te recomiendo continuar con') : 'Y después,'} <strong>{r.titulo}</strong> {r.motivo}.</p>
        {!visitante && <Link href={`/portal/${r.slug}`} className="btn btn-gold">Ir a mis clases <ArrowRight aria-hidden="true" /></Link>}
      </div>)}
      {visitante && <div className="reto-registro">
        <Link href="/registro" className="btn btn-gold btn-lg">Quiero aprender con Diana <ArrowRight aria-hidden="true" /></Link>
        <p>Crea tu cuenta gratis para comenzar tu ruta de aprendizaje. Encontrarás estas clases y tu resultado en tu Portal del Alumno.</p>
      </div>}
    </div>

    {esRepeticion && <p className="reto-primero">Tu primer resultado fue <strong>{primero.puntaje} de {TOTAL_PUNTOS} ({primero.nivel})</strong>. Lo conservamos como punto de partida para ver tu progreso.</p>}
    <p className="reto-aviso">Este resultado refleja solo los conocimientos demostrados en estos ejercicios. Es una orientación educativa, no una certificación ni una evaluación de tu capacidad para invertir.</p>
    <button type="button" className="btn btn-outline" onClick={onRepetir}><RotateCcw size={18} aria-hidden="true" /> Repetir el reto</button>
  </div>;
}
