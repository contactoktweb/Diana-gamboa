import { Loader2 } from 'lucide-react';

/** Se muestra al instante al cambiar de módulo, mientras el servidor trae los datos. */
export default function Cargando() {
  return <div className="admin-cargando" role="status" aria-live="polite">
    <p className="admin-cargando-texto"><Loader2 size={20} className="girando" aria-hidden="true" /> Cargando información…</p>
    <div className="admin-cargando-esqueleto" aria-hidden="true">
      <span className="es-titulo" />
      <span className="es-linea" />
      <span className="es-bloque" />
      <span className="es-bloque" />
    </div>
  </div>;
}
