'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

/**
 * Barra dorada arriba de la pantalla que aparece al instante al pulsar cualquier enlace interno,
 * hasta que la nueva página está lista. Así ningún botón parece «muerto» mientras el servidor responde.
 */
function Barra() {
  const path = usePathname();
  const query = useSearchParams();
  const [activa, setActiva] = useState(false);
  // Destino del último enlace pulsado (o atrás/adelante del navegador), por si hay que entrar «a la fuerza».
  const destinoRef = useRef<string | null>(null);
  // Página que se está mostrando ahora (ruta + consulta), para saber si «atrás» lleva a otra.
  const actualRef = useRef('');

  // Llegó la página nueva: la barra se oculta.
  useEffect(() => {
    setActiva(false);
    destinoRef.current = null;
    actualRef.current = location.pathname + location.search;
  }, [path, query]);

  useEffect(() => {
    function alPulsar(ev: MouseEvent) {
      if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      const a = (ev.target as Element | null)?.closest?.('a');
      if (!a || !a.href || a.target === '_blank' || a.hasAttribute('download')) return;
      const destino = new URL(a.href, location.href);
      if (destino.origin !== location.origin) return;
      // Mismo lugar (o solo un ancla #): no hay carga.
      if (destino.pathname === location.pathname && destino.search === location.search) return;
      destinoRef.current = destino.href;
      setActiva(true);
    }
    // Atrás / adelante del navegador: la dirección ya cambió; si la vista no llega, se recarga esa dirección.
    function alVolver() {
      if (location.pathname + location.search === actualRef.current) return; // solo cambió el ancla (#)
      destinoRef.current = location.href;
      setActiva(true);
    }
    // En fase de captura: los enlaces de Next.js cancelan el clic para navegar sin recargar.
    document.addEventListener('click', alPulsar, true);
    window.addEventListener('popstate', alVolver);
    return () => { document.removeEventListener('click', alPulsar, true); window.removeEventListener('popstate', alVolver); };
  }, []);

  // Red de seguridad: si en 8 segundos la página nueva no llegó (por ejemplo, la pestaña quedó con una
  // versión anterior de la web tras publicar cambios), se entra con una carga completa, como al recargar.
  useEffect(() => {
    if (!activa) return;
    const t = setTimeout(() => {
      const destino = destinoRef.current;
      if (destino) window.location.assign(destino); else setActiva(false);
    }, 8000);
    return () => clearTimeout(t);
  }, [activa]);

  return <div className={`barra-navegacion ${activa ? 'is-activa' : ''}`} role="progressbar" aria-hidden={!activa} aria-label="Cargando la página" />;
}

export default function BarraNavegacion() {
  return <Suspense fallback={null}><Barra /></Suspense>;
}
