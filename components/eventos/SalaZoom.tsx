'use client';

import { useRef } from 'react';
import { Maximize2 } from 'lucide-react';

/** La sala de Zoom dentro de la web (marco aislado para que Zoom no afecte el diseño de la página). */
export default function SalaZoom({ slug, token }: { slug: string; token?: string }) {
  const marco = useRef<HTMLIFrameElement>(null);
  return <div className="sala-zoom">
    <iframe ref={marco} src={`/zoom/sala.html?evento=${encodeURIComponent(slug)}${token ? `&t=${encodeURIComponent(token)}` : ''}`} title="Sala de clase"
      allow="camera; microphone; display-capture; fullscreen; autoplay; clipboard-write" allowFullScreen />
    <button type="button" className="btn btn-outline btn-sm sala-completa" onClick={() => marco.current?.requestFullscreen?.()}>
      <Maximize2 size={16} aria-hidden="true" /> Pantalla completa
    </button>
  </div>;
}
