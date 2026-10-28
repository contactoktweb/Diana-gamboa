/* Datos del alumno guardados en el navegador hasta conectar el sistema de cuentas. */
const KEY = 'dg-nombre';

export function leerNombre() {
  try { return localStorage.getItem(KEY) ?? ''; } catch { return ''; }
}

export function guardarNombre(nombre: string) {
  try { if (nombre) localStorage.setItem(KEY, nombre); } catch {}
}

export function borrarAlumno() {
  try { localStorage.removeItem(KEY); } catch {}
}

/** Primer nombre con mayúscula inicial: «maría josé» → «María». */
export function primerNombre(texto: string) {
  const p = texto.trim().split(/\s+/)[0] ?? '';
  return p ? p[0].toLocaleUpperCase('es') + p.slice(1).toLocaleLowerCase('es') : '';
}

/** Nombre aproximado a partir del correo: «maria.lopez@…» → «Maria». */
export function nombreDesdeCorreo(correo: string) {
  return primerNombre((correo.split('@')[0] ?? '').replace(/[._\-+0-9]+/g, ' '));
}
