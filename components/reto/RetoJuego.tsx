'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import Opciones from './Opciones';
import Resultado from './Resultado';
import { RetoMedias, RetoMovimiento, RetoNiveles, RetoTendencia, RetoVelas } from './Retos';
import { EXPERIENCIAS, RETOS, crearBanco } from '@/data/reto';
import { finalizarIntento, iniciarIntento, primerResultado, registrarRespuesta, ultimoResultado, type Intento, type Respuesta } from '@/lib/reto/registro';

type Fase = 'cargando' | 'inicio' | 'juego' | 'resultado' | 'fin-demo';

/**
 * El Reto de la Gráfica.
 * - `demo`: visitantes; solo los primeros ejercicios de velas, sin guardar nada.
 * - `completo`: alumnos; los cinco retos, con resultados guardados.
 */
export default function RetoJuego({ modo }: { modo: 'demo' | 'completo' }) {
  const [fase, setFase] = useState<Fase>('cargando');
  const [reto, setReto] = useState(0);
  const [intento, setIntento] = useState<Intento | null>(null);
  const [respuestasDemo, setRespuestasDemo] = useState<Respuesta[]>([]);
  const [experiencia, setExperiencia] = useState<string | null>(null);
  const banco = useMemo(() => crearBanco(intento?.version ?? 0), [intento?.version]);

  useEffect(() => {
    const ultimo = modo === 'completo' ? ultimoResultado() : undefined;
    if (ultimo) { setIntento(ultimo); setFase('resultado'); } else setFase('inicio');
  }, [modo]);

  function comenzar() {
    if (modo === 'completo') setIntento(iniciarIntento(experiencia ?? ''));
    setReto(0); setRespuestasDemo([]); setFase('juego');
    window.scrollTo({ top: 0 });
  }
  function responder(r: Respuesta) {
    if (modo === 'demo') { setRespuestasDemo(prev => [...prev, r]); return; }
    if (intento) registrarRespuesta(intento.id, r);
  }
  function siguienteReto() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (modo === 'demo') { setFase('fin-demo'); return; }
    if (reto + 1 < RETOS.length) { setReto(reto + 1); return; }
    const final = intento && finalizarIntento(intento.id);
    if (final) setIntento(final);
    setFase('resultado');
  }

  if (fase === 'cargando') return <div className="reto reto-cargando" aria-busy="true" />;

  if (fase === 'inicio') return <div className="reto reto-inicio">
    <p className="eyebrow">El Reto de la Gráfica</p>
    <h1>{modo === 'demo' ? '¿Qué tanto sabes leer el mercado?' : 'Descubre tu nivel'}</h1>
    <p className="lead-sm">{modo === 'demo'
      ? 'Prueba un pequeño reto: te mostraré dos velas y tú me dirás dónde abrieron, dónde cerraron y hasta dónde llegó el precio.'
      : 'Cinco retos visuales para descubrir cuánto sabes leer el mercado. No necesitas experiencia: aquí también se aprende intentando.'}</p>
    {modo === 'completo' && <>
      <ol className="reto-lista">{RETOS.map((r, i) => <li key={r.cat}><span>{i + 1}</span>{r.titulo}</li>)}</ol>
      <div className="reto-experiencia">
        <h2>Antes de comenzar: ¿has estudiado antes el mercado de valores?</h2>
        <Opciones etiqueta="Experiencia previa" valor={experiencia} onCambio={setExperiencia} opciones={EXPERIENCIAS.map(e => ({ valor: e, etiqueta: e }))} />
        <p className="reto-nota">Tu respuesta no cambia tu puntuación.</p>
      </div>
      <p className="reto-privacidad"><ShieldCheck size={20} aria-hidden="true" /> Tus respuestas nos ayudarán a identificar qué conceptos conoces y a recomendarte clases para continuar aprendiendo. También utilizaremos resultados agrupados para mejorar los contenidos de la academia.</p>
    </>}
    <button type="button" className="btn btn-gold btn-lg" disabled={modo === 'completo' && !experiencia} onClick={comenzar}>{modo === 'demo' ? 'Acepto el reto' : 'Comenzar el reto'} <ArrowRight aria-hidden="true" /></button>
  </div>;

  if (fase === 'fin-demo') {
    const aciertos = respuestasDemo.filter(r => r.aciertoPrimerIntento).length;
    return <div className="reto reto-inicio">
      <p className="eyebrow">¡Primer reto superado!</p>
      <h1>Acertaste {aciertos} de {respuestasDemo.length} al primer intento</h1>
      <p className="lead-sm">Esto fue solo una muestra. En el reto completo encontrarás cinco retos sobre velas, movimiento del precio, líneas de tendencia, niveles y medias móviles, y al final recibirás tu nivel y una recomendación de por dónde comenzar.</p>
      <Link href="/registro" className="btn btn-gold btn-lg">Quiero aprender con Diana <ArrowRight aria-hidden="true" /></Link>
      <p className="cta-note">Crea tu cuenta gratis para hacer el reto completo y guardar tus resultados.</p>
    </div>;
  }

  if (fase === 'resultado' && intento) return <div className="reto"><Resultado intento={intento} primero={primerResultado()} onRepetir={() => { setExperiencia(null); setFase('inicio'); }} /></div>;

  const props = { onRespuesta: responder, onFin: siguienteReto };
  const total = modo === 'demo' ? 1 : RETOS.length;
  return <div className="reto reto-juego">
    <div className="reto-cabecera">
      <p className="eyebrow">El Reto de la Gráfica</p>
      <div className="reto-progreso-texto"><strong>Reto {reto + 1} de {total}</strong><span>{RETOS[reto].titulo}</span></div>
      <div className="reto-progreso" aria-hidden="true">{Array.from({ length: total }, (_, i) => <span key={i} className={i < reto ? 'hecho' : i === reto ? 'actual' : ''} />)}</div>
    </div>
    <div key={reto}>
      {reto === 0 && <RetoVelas {...props} velas={banco.velas} limite={modo === 'demo' ? 4 : undefined} />}
      {reto === 1 && <RetoMovimiento {...props} ejercicios={banco.movimiento} />}
      {reto === 2 && <RetoTendencia {...props} ejercicios={banco.tendencia} />}
      {reto === 3 && <RetoNiveles {...props} ejercicios={banco.niveles} />}
      {reto === 4 && <RetoMedias {...props} banco={banco.medias} />}
    </div>
  </div>;
}

