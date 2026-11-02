'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import Opciones from './Opciones';
import Resultado from './Resultado';
import { RetoMedias, RetoMovimiento, RetoNiveles, RetoTendencia, RetoVelas } from './Retos';
import { EXPERIENCIAS, RETOS, crearBanco } from '@/data/reto';
import { finalizarIntento, iniciarIntento, primerResultado, registrarRespuesta, ultimoResultado, type Intento, type Respuesta } from '@/lib/reto/registro';

type Fase = 'cargando' | 'inicio' | 'juego' | 'resultado';

/**
 * El Reto de la Gráfica: los cinco retos completos.
 * - `visitante`: página pública, sin registro; al final invita a crear la cuenta.
 * - `alumno`: dentro del portal; el resultado lleva directamente a las clases.
 * En ambos casos el resultado se guarda en este navegador, así el alumno lo encuentra
 * en su portal al registrarse desde el mismo dispositivo.
 */
export default function RetoJuego({ modo }: { modo: 'visitante' | 'alumno' }) {
  const [fase, setFase] = useState<Fase>('cargando');
  const [reto, setReto] = useState(0);
  const [intento, setIntento] = useState<Intento | null>(null);
  const [experiencia, setExperiencia] = useState<string | null>(null);
  const banco = useMemo(() => crearBanco(intento?.version ?? 0), [intento?.version]);
  const visitante = modo === 'visitante';

  useEffect(() => {
    const ultimo = ultimoResultado();
    if (ultimo) { setIntento(ultimo); setFase('resultado'); } else setFase('inicio');
  }, []);

  function comenzar() {
    setIntento(iniciarIntento(experiencia ?? ''));
    setReto(0); setFase('juego');
    window.scrollTo({ top: 0 });
  }
  function responder(r: Respuesta) {
    if (intento) registrarRespuesta(intento.id, r);
  }
  function siguienteReto() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (reto + 1 < RETOS.length) { setReto(reto + 1); return; }
    const final = intento && finalizarIntento(intento.id);
    if (final) setIntento(final);
    setFase('resultado');
  }

  if (fase === 'cargando') return <div className="reto reto-cargando" aria-busy="true" />;

  if (fase === 'inicio') return <div className="reto reto-inicio">
    <p className="eyebrow">El Reto de la Gráfica</p>
    <h1>{visitante ? '¿Qué tanto sabes leer el mercado?' : 'Descubre tu nivel'}</h1>
    <p className="lead-sm">Cinco retos visuales para descubrir cuánto sabes leer el mercado. No necesitas experiencia: aquí también se aprende intentando.</p>
    <ol className="reto-lista">{RETOS.map((r, i) => <li key={r.cat}><span>{i + 1}</span>{r.titulo}</li>)}</ol>
    <div className="reto-experiencia">
      <h2>Antes de comenzar: ¿has estudiado antes el mercado de valores?</h2>
      <Opciones etiqueta="Experiencia previa" valor={experiencia} onCambio={setExperiencia} opciones={EXPERIENCIAS.map(e => ({ valor: e, etiqueta: e }))} />
      <p className="reto-nota">Tu respuesta no cambia tu puntuación.</p>
    </div>
    <p className="reto-privacidad"><ShieldCheck size={20} aria-hidden="true" /> {visitante
      ? 'Tus respuestas nos ayudarán a identificar qué conceptos conoces y a recomendarte por dónde comenzar. Tu resultado se guarda en este dispositivo; si creas tu cuenta gratuita, lo encontrarás en tu Portal del Alumno.'
      : 'Tus respuestas nos ayudarán a identificar qué conceptos conoces y a recomendarte clases para continuar aprendiendo. También utilizaremos resultados agrupados para mejorar los contenidos de la academia.'}</p>
    <button type="button" className="btn btn-gold btn-lg" disabled={!experiencia} onClick={comenzar}>{visitante ? 'Acepto el reto' : 'Comenzar el reto'} <ArrowRight aria-hidden="true" /></button>
  </div>;

  if (fase === 'resultado' && intento) return <div className="reto"><Resultado intento={intento} primero={primerResultado()} visitante={visitante} onRepetir={() => { setExperiencia(null); setFase('inicio'); }} /></div>;

  const props = { onRespuesta: responder, onFin: siguienteReto };
  return <div className="reto reto-juego">
    <div className="reto-cabecera">
      <p className="eyebrow">El Reto de la Gráfica</p>
      <div className="reto-progreso-texto"><strong>Reto {reto + 1} de {RETOS.length}</strong><span>{RETOS[reto].titulo}</span></div>
      <div className="reto-progreso" aria-hidden="true">{RETOS.map((_, i) => <span key={i} className={i < reto ? 'hecho' : i === reto ? 'actual' : ''} />)}</div>
    </div>
    <div key={reto}>
      {reto === 0 && <RetoVelas {...props} velas={banco.velas} />}
      {reto === 1 && <RetoMovimiento {...props} ejercicios={banco.movimiento} />}
      {reto === 2 && <RetoTendencia {...props} ejercicios={banco.tendencia} />}
      {reto === 3 && <RetoNiveles {...props} ejercicios={banco.niveles} />}
      {reto === 4 && <RetoMedias {...props} banco={banco.medias} />}
    </div>
  </div>;
}
