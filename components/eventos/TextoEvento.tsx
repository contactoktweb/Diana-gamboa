import { Fragment, type ReactNode } from 'react';

/*
 * Muestra el texto de un evento con un formato sencillo que se escribe desde la administración:
 *   ## Título de sección      ### Pregunta (subtítulo)
 *   - Punto de lista           (dos espacios antes del guion = subpunto)
 *   > Frase destacada          **negrita**      [texto del enlace](/direccion)
 * Una línea en blanco separa los párrafos.
 */

type Bloque =
  | { tipo: 'h2' | 'h3' | 'cita' | 'p'; texto: string }
  | { tipo: 'lista'; items: { texto: string; sub: string[] }[] };

function analizar(texto: string): Bloque[] {
  const bloques: Bloque[] = [];
  let parrafo: string[] = [];
  const cerrarParrafo = () => { if (parrafo.length) bloques.push({ tipo: 'p', texto: parrafo.join(' ') }); parrafo = []; };

  for (const linea of (texto ?? '').replace(/\r/g, '').split('\n')) {
    const item = linea.match(/^(\s*)[-•]\s+(.*)$/);
    if (!linea.trim()) { cerrarParrafo(); continue; }
    if (item) {
      cerrarParrafo();
      const ultimo = bloques.at(-1);
      const lista = ultimo?.tipo === 'lista' ? ultimo : (bloques.push({ tipo: 'lista', items: [] }), bloques.at(-1) as Extract<Bloque, { tipo: 'lista' }>);
      if (item[1].length >= 2 && lista.items.length) lista.items.at(-1)!.sub.push(item[2]);
      else lista.items.push({ texto: item[2], sub: [] });
      continue;
    }
    if (linea.startsWith('### ')) { cerrarParrafo(); bloques.push({ tipo: 'h3', texto: linea.slice(4) }); continue; }
    if (linea.startsWith('## ')) { cerrarParrafo(); bloques.push({ tipo: 'h2', texto: linea.slice(3) }); continue; }
    if (linea.startsWith('> ')) { cerrarParrafo(); bloques.push({ tipo: 'cita', texto: linea.slice(2) }); continue; }
    parrafo.push(linea.trim());
  }
  cerrarParrafo();
  return bloques;
}

/** Negritas y enlaces dentro de una línea. Solo se aceptan enlaces internos o https. */
function enLinea(texto: string): ReactNode {
  return texto.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g).map((parte, i) => {
    if (parte.startsWith('**') && parte.endsWith('**') && parte.length > 4) return <strong key={i}>{parte.slice(2, -2)}</strong>;
    const enlace = parte.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (enlace && (enlace[2].startsWith('/') || enlace[2].startsWith('https://'))) {
      const externo = enlace[2].startsWith('https://');
      return <a key={i} href={enlace[2]} {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{enlace[1]}</a>;
    }
    return <Fragment key={i}>{parte}</Fragment>;
  });
}

export default function TextoEvento({ texto }: { texto: string }) {
  return <>{analizar(texto).map((b, i) => {
    switch (b.tipo) {
      case 'h2': return <h2 key={i}>{enLinea(b.texto)}</h2>;
      case 'h3': return <h3 key={i}>{enLinea(b.texto)}</h3>;
      case 'cita': return <blockquote key={i}>{enLinea(b.texto)}</blockquote>;
      case 'p': return <p key={i}>{enLinea(b.texto)}</p>;
      case 'lista': return <ul key={i}>{b.items.map((it, k) => <li key={k}>{enLinea(it.texto)}
        {it.sub.length > 0 && <ul>{it.sub.map((s, j) => <li key={j}>{enLinea(s)}</li>)}</ul>}</li>)}</ul>;
    }
  })}</>;
}
