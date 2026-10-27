'use client';

import { useEffect, useState } from 'react';

/* Mientras no exista el sistema de cuentas, el nombre se lee del registro guardado en este navegador. */
export default function PortalGreeting() {
  const [name, setName] = useState('');
  useEffect(() => { try { setName(localStorage.getItem('dg-nombre') ?? ''); } catch {} }, []);
  return <>{name ? `¡Hola, ${name}!` : '¡Hola!'}</>;
}
