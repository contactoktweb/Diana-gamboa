import { Loader2 } from 'lucide-react';

/** Se muestra al instante al cambiar de página dentro del portal, mientras el servidor trae los datos. */
export default function Cargando() {
  return <section className="portal-cargando" role="status" aria-live="polite"><div className="wrap">
    <p className="admin-cargando-texto"><Loader2 size={20} className="girando" aria-hidden="true" /> Cargando…</p>
    <div className="admin-cargando-esqueleto" aria-hidden="true">
      <span className="es-titulo" />
      <span className="es-linea" />
      <span className="es-bloque" />
    </div>
  </div></section>;
}
