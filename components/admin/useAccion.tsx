'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export type ResultadoAccion = { ok: true; aviso?: string } | { ok: false; error: string };

/**
 * Ejecuta una acción del servidor y guarda su resultado junto a la clave del botón que la lanzó,
 * para mostrar «Enviando…» y el mensaje justo al lado de ese botón. Si la conexión o el servidor fallan,
 * también se muestra el error (nunca queda en silencio).
 */
export function useAccion() {
  const router = useRouter();
  const [activa, setActiva] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ clave: string; ok: boolean; texto: string } | null>(null);
  const [pendiente, iniciar] = useTransition();

  function ejecutar(clave: string, accion: () => Promise<ResultadoAccion>) {
    setMensaje(null);
    setActiva(clave);
    iniciar(async () => {
      try {
        const r = await accion();
        setMensaje({ clave, ok: r.ok, texto: r.ok ? r.aviso ?? 'Listo.' : r.error });
        router.refresh();
      } catch (e) {
        console.error(e);
        setMensaje({ clave, ok: false, texto: 'No se pudo completar: se perdió la conexión o el servidor tardó demasiado. Revisa en Resend → Emails si alcanzó a salir antes de volver a intentarlo.' });
      } finally {
        setActiva(null);
      }
    });
  }

  const enCurso = (clave: string) => pendiente && activa === clave;
  const aviso = (clave: string) => mensaje?.clave === clave
    ? <p className={`${mensaje.ok ? 'auth-ok' : 'auth-error'} accion-aviso`} role={mensaje.ok ? 'status' : 'alert'}>{mensaje.texto}</p>
    : null;
  return { ejecutar, enCurso, aviso, ocupado: pendiente };
}
