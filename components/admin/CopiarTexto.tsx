'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CopiarTexto({ texto, etiqueta, pequeno }: { texto: string; etiqueta: string; pequeno?: boolean }) {
  const [copiado, setCopiado] = useState(false);
  async function copiar() {
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }
  return <button type="button" className={`btn btn-outline btn-sm ${pequeno ? 'btn-mini' : ''}`} onClick={copiar}>
    {copiado ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />} {copiado ? 'Copiado' : etiqueta}
  </button>;
}
