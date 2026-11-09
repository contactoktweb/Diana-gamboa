'use client';

import { useEffect, useState } from 'react';
import { leerNombre, primerNombre } from '@/lib/alumno';

/** Saludo con el nombre del alumno (de su cuenta o, en modo demostración, del navegador). */
export default function PortalGreeting({ nombre }: { nombre?: string }) {
  const [name, setName] = useState(nombre ? primerNombre(nombre) : '');
  useEffect(() => { if (!nombre) setName(leerNombre()); }, [nombre]);
  return <>{name ? `¡Hola, ${name}!` : '¡Hola!'}</>;
}
