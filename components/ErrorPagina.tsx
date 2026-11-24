'use client';

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

/** Error al cargar una página: si es por una versión anterior de la web, recarga sola; si no, ofrece reintentar. */
export default function ErrorPagina({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const versionVieja = /ChunkLoadError|Loading chunk|dynamically imported module|Failed to fetch|server action/i.test(`${error?.name} ${error?.message}`);
  useEffect(() => {
    console.error(error);
    // Una sola recarga automática por minuto, para no entrar en un ciclo.
    if (!versionVieja) return;
    try {
      const ultima = Number(sessionStorage.getItem('recarga-auto') ?? 0);
      if (Date.now() - ultima < 60000) return;
      sessionStorage.setItem('recarga-auto', String(Date.now()));
    } catch {}
    window.location.reload();
  }, [error, versionVieja]);
  return <section className="wrap error-pagina" role="alert">
    <h1>No se pudo cargar esta página</h1>
    <p>Puede ser un problema momentáneo de conexión. Inténtalo de nuevo.</p>
    <div className="admin-botones">
      <button type="button" className="btn btn-green btn-sm" onClick={() => reset()}><RefreshCw size={16} aria-hidden="true" /> Reintentar</button>
      <button type="button" className="btn btn-outline btn-sm" onClick={() => window.location.reload()}>Recargar la página</button>
    </div>
  </section>;
}
