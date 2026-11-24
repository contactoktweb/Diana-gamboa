'use client';

import { useEffect, useRef } from 'react';
import { Bold, Heading2, Heading3, Link2, List, Pilcrow, Quote, RemoveFormatting } from 'lucide-react';
import { analizar } from '@/components/eventos/TextoEvento';

/*
 * Editor visual (como en Word) para los textos de los eventos.
 * Por dentro guarda el mismo formato sencillo de siempre (## título, ### pregunta, - lista, > frase,
 * **negrita**, [texto](enlace)), así que los textos ya escritos se abren igual y la página pública no cambia.
 */

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Negritas y enlaces del formato → HTML del editor. */
function enLineaHtml(texto: string) {
  return texto.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g).map(parte => {
    if (parte.startsWith('**') && parte.endsWith('**') && parte.length > 4) return `<strong>${esc(parte.slice(2, -2))}</strong>`;
    const enlace = parte.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (enlace) return `<a href="${esc(enlace[2])}">${esc(enlace[1])}</a>`;
    return esc(parte);
  }).join('');
}

/** Formato guardado → HTML para editar. */
function aHtml(texto: string) {
  const html = analizar(texto).map(b => {
    switch (b.tipo) {
      case 'h2': return `<h2>${enLineaHtml(b.texto)}</h2>`;
      case 'h3': return `<h3>${enLineaHtml(b.texto)}</h3>`;
      case 'cita': return `<blockquote>${enLineaHtml(b.texto)}</blockquote>`;
      case 'p': return `<p>${enLineaHtml(b.texto)}</p>`;
      case 'lista': return `<ul>${b.items.map(it => `<li>${enLineaHtml(it.texto)}${it.sub.length ? `<ul>${it.sub.map(s => `<li>${enLineaHtml(s)}</li>`).join('')}</ul>` : ''}</li>`).join('')}</ul>`;
    }
  }).join('');
  return html || '<p><br></p>';
}

/** Texto en línea (negritas y enlaces) de un nodo → formato. */
function enLinea(nodo: Node): string {
  let salida = '';
  nodo.childNodes.forEach(n => {
    if (n.nodeType === Node.TEXT_NODE) { salida += n.textContent ?? ''; return; }
    if (!(n instanceof HTMLElement)) return;
    const tag = n.tagName;
    if (tag === 'UL' || tag === 'OL') return; // sublistas: se tratan aparte
    if (tag === 'BR') { salida += ' '; return; }
    const dentro = enLinea(n);
    if ((tag === 'STRONG' || tag === 'B') && dentro.trim()) salida += `**${dentro.trim()}**`;
    else if (tag === 'A' && n.getAttribute('href')) salida += `[${dentro.trim() || n.getAttribute('href')}](${n.getAttribute('href')})`;
    else salida += dentro;
  });
  return salida.replace(/ /g, ' ').replace(/\s+/g, ' ');
}

/** Elementos de una lista → líneas «- » (y «  - » para los subpuntos). */
function lista(ul: Element, nivel: number): string[] {
  const lineas: string[] = [];
  const sangria = nivel > 0 ? '  ' : '';
  ul.childNodes.forEach(n => {
    if (!(n instanceof HTMLElement)) return;
    if (n.tagName === 'LI') {
      const t = enLinea(n).trim();
      if (t) lineas.push(`${sangria}- ${t}`);
      n.querySelectorAll(':scope > ul, :scope > ol').forEach(sub => lineas.push(...lista(sub, 1)));
    } else if (n.tagName === 'UL' || n.tagName === 'OL') lineas.push(...lista(n, 1));
  });
  return lineas;
}

/** HTML del editor → formato guardado. */
function aTexto(raiz: HTMLElement) {
  const bloques: string[] = [];
  const parrafo = (t: string) => { const limpio = t.trim(); if (limpio) bloques.push(limpio); };
  raiz.childNodes.forEach(n => {
    if (n.nodeType === Node.TEXT_NODE) { parrafo(n.textContent ?? ''); return; }
    if (!(n instanceof HTMLElement)) return;
    const t = () => enLinea(n).trim();
    switch (n.tagName) {
      case 'H1': case 'H2': if (t()) bloques.push(`## ${t()}`); break;
      case 'H3': case 'H4': if (t()) bloques.push(`### ${t()}`); break;
      case 'BLOCKQUOTE': if (t()) bloques.push(`> ${t()}`); break;
      case 'UL': case 'OL': { const l = lista(n, 0); if (l.length) bloques.push(l.join('\n')); break; }
      default: {
        // Un párrafo que el navegador llenó con listas o títulos: se procesa por dentro.
        if (n.querySelector(':scope > ul, :scope > ol, :scope > h2, :scope > h3, :scope > blockquote, :scope > p, :scope > div')) {
          const dentro = aTexto(n);
          if (dentro) bloques.push(dentro);
          break;
        }
        // Párrafos; un salto de línea dentro de un párrafo crea otro párrafo.
        const partes = n.innerHTML.split(/<br\s*\/?>/i);
        if (partes.length > 1) partes.forEach(h => { const d = document.createElement('div'); d.innerHTML = h; parrafo(enLinea(d)); });
        else parrafo(t());
      }
    }
  });
  return bloques.join('\n\n');
}

export default function EditorTexto({ valor, onChange, placeholder, alto = 320 }: {
  valor: string; onChange: (texto: string) => void; placeholder?: string; alto?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const ultimo = useRef<string | null>(null);

  // Carga el texto guardado (y cuando cambia desde fuera, no mientras se escribe).
  useEffect(() => {
    if (ref.current && valor !== ultimo.current) { ref.current.innerHTML = aHtml(valor); ultimo.current = valor; }
  }, [valor]);

  function actualizar() {
    if (!ref.current) return;
    const texto = aTexto(ref.current);
    ultimo.current = texto;
    onChange(texto);
  }

  function aplicar(comando: string, valorComando?: string) {
    ref.current?.focus();
    document.execCommand(comando, false, valorComando);
    actualizar();
  }

  function bloque(tag: 'h2' | 'h3' | 'p' | 'blockquote') {
    // Si ya tiene ese formato, vuelve a párrafo normal.
    const sel = window.getSelection();
    const actual = sel?.anchorNode && (sel.anchorNode instanceof Element ? sel.anchorNode : sel.anchorNode.parentElement)?.closest('h2,h3,blockquote,p,li');
    aplicar('formatBlock', actual?.tagName.toLowerCase() === tag && tag !== 'p' ? 'p' : tag);
  }

  function enlace() {
    const url = prompt('Pega el enlace (por ejemplo https://… o /portal/eventos):')?.trim();
    if (!url) return;
    if (!url.startsWith('https://') && !url.startsWith('/')) { alert('El enlace debe empezar por https:// o por /'); return; }
    if (window.getSelection()?.isCollapsed) aplicar('insertHTML', `<a href="${esc(url)}">${esc(url)}</a>`);
    else aplicar('createLink', url);
  }

  const boton = (titulo: string, icono: React.ReactNode, accion: () => void, texto?: string) =>
    <button type="button" title={titulo} aria-label={titulo} onMouseDown={e => e.preventDefault()} onClick={accion}>{icono}{texto && <span>{texto}</span>}</button>;

  return <div className="editor-visual">
    <div className="editor-visual-barra" role="toolbar" aria-label="Formato del texto">
      {boton('Texto normal', <Pilcrow size={16} aria-hidden="true" />, () => bloque('p'), 'Normal')}
      {boton('Título de sección', <Heading2 size={16} aria-hidden="true" />, () => bloque('h2'), 'Título')}
      {boton('Pregunta o subtítulo', <Heading3 size={16} aria-hidden="true" />, () => bloque('h3'), 'Pregunta')}
      {boton('Lista con puntos (Tab = subpunto)', <List size={16} aria-hidden="true" />, () => aplicar('insertUnorderedList'), 'Lista')}
      {boton('Frase destacada', <Quote size={16} aria-hidden="true" />, () => bloque('blockquote'), 'Destacar')}
      {boton('Negrita', <Bold size={16} aria-hidden="true" />, () => aplicar('bold'))}
      {boton('Enlace', <Link2 size={16} aria-hidden="true" />, enlace)}
      {boton('Quitar negrita y enlaces de lo seleccionado', <RemoveFormatting size={16} aria-hidden="true" />, () => { aplicar('removeFormat'); aplicar('unlink'); })}
    </div>
    <div ref={ref} className="editor-visual-area evento-texto" contentEditable suppressContentEditableWarning
      role="textbox" aria-multiline="true" data-placeholder={placeholder} style={{ minHeight: alto }}
      onInput={actualizar} onBlur={actualizar}
      onKeyDown={e => {
        // Tab dentro de una lista: subpunto (Mayús + Tab: vuelve al nivel anterior).
        const nodo = window.getSelection()?.anchorNode;
        const el = nodo instanceof Element ? nodo : nodo?.parentElement;
        if (e.key === 'Tab' && el?.closest('li')) {
          e.preventDefault();
          aplicar(e.shiftKey ? 'outdent' : 'indent');
        }
      }}
      onPaste={e => {
        // Se pega solo el texto, sin colores ni tipos de letra de otras páginas.
        e.preventDefault();
        document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
        actualizar();
      }} />
  </div>;
}
