/** Traduce los mensajes de error de Supabase a un español claro para el alumno. */
export function traducirError(mensaje?: string) {
  const m = (mensaje ?? '').toLowerCase();
  if (m.includes('invalid login credentials')) return 'El correo o la contraseña no son correctos.';
  if (m.includes('email not confirmed')) return 'Aún no has confirmado tu correo. Revisa tu bandeja de entrada (y la carpeta de spam).';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Este correo ya está registrado. Inicia sesión o recupera tu contraseña.';
  if (m.includes('password should be') || m.includes('weak password')) return 'La contraseña es muy débil. Usa al menos 8 caracteres combinando letras y números.';
  if (m.includes('same password') || m.includes('different from the old')) return 'La nueva contraseña debe ser distinta de la anterior.';
  if (m.includes('rate limit') || m.includes('too many') || m.includes('security purposes')) return 'Has hecho varios intentos seguidos. Espera un minuto y vuelve a intentarlo.';
  if (m.includes('invalid email') || m.includes('unable to validate email')) return 'Revisa que el correo esté bien escrito.';
  if (m.includes('provider is not enabled')) return 'El acceso con Google aún no está activado. Usa tu correo y contraseña.';
  if (m.includes('expired') || m.includes('invalid') && m.includes('link')) return 'El enlace ya no es válido o caducó. Solicita uno nuevo.';
  if (m.includes('fetch') || m.includes('network')) return 'No pudimos conectar. Revisa tu conexión a internet e inténtalo de nuevo.';
  return 'Algo no salió bien. Inténtalo de nuevo en unos segundos.';
}
