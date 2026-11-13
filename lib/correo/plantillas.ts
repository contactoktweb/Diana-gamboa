/**
 * Correos de la academia (los envía Resend), con el estilo de la web: verde profundo,
 * dorado, fondo marfil y la tipografía de la marca (con alternativas para el correo).
 */

const esc = (s: string) => s.replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]!));

interface Marco {
  sitio: string;
  previa: string;
  etiqueta: string;
  titulo: string;
  parrafos: string[];
  boton?: { texto: string; enlace: string };
  destacado?: { titulo: string; valor: string; nota?: string };
  nota: string;
}

/** Estructura común de todos los correos. */
export function marco({ sitio, previa, etiqueta, titulo, parrafos, boton, destacado, nota }: Marco) {
  const fuente = "'Century Gothic','CenturyGothic','Avenir Next','Trebuchet MS',Arial,sans-serif";
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(titulo)}</title></head>
<body style="margin:0;padding:0;background:#F6F4EE;font-family:${fuente};color:#0E1F19">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(previa)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F4EE;padding:32px 12px">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:24px;overflow:hidden;border:1px solid #DDE3DF">
    <tr><td style="background:#0F4131;padding:30px 32px 26px;text-align:center">
      <img src="${sitio}/brand/logo-dg-light.png" alt="Diana Gamboa" width="128" style="display:inline-block;width:128px;height:auto;border:0">
      <div style="margin-top:14px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#CBA52F">El idioma del mercado</div>
    </td></tr>
    <tr><td style="height:4px;background:#CBA52F;font-size:0;line-height:0">&nbsp;</td></tr>
    <tr><td style="padding:38px 34px 10px">
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#176244;margin-bottom:12px">${esc(etiqueta)}</div>
      <h1 style="margin:0 0 18px;font-size:26px;line-height:1.25;font-weight:bold;color:#0F4131">${esc(titulo)}</h1>
      ${parrafos.map(p => `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#4A5952">${p}</p>`).join('\n      ')}
      ${destacado ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 22px;background:#EEF4F1;border-radius:16px;border-left:4px solid #CBA52F">
        <tr><td style="padding:18px 20px">
          <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#176244">${esc(destacado.titulo)}</div>
          <div style="margin-top:8px;font-family:'Courier New',monospace;font-size:24px;font-weight:bold;letter-spacing:2px;color:#0F4131">${esc(destacado.valor)}</div>
          ${destacado.nota ? `<div style="margin-top:8px;font-size:13px;color:#4A5952">${esc(destacado.nota)}</div>` : ''}
        </td></tr></table>` : ''}
      ${boton ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:10px auto 26px"><tr><td style="border-radius:999px;background:#0F4131;border:1px solid #CBA52F">
        <a href="${boton.enlace}" style="display:inline-block;padding:16px 34px;font-size:16px;font-weight:bold;color:#FFFFFF;text-decoration:none;border-radius:999px">${esc(boton.texto)} &rarr;</a>
      </td></tr></table>
      <p style="margin:0 0 18px;font-size:12px;line-height:1.6;color:#6B746F">Si el botón no funciona, copia este enlace en tu navegador:<br><a href="${boton.enlace}" style="color:#176244;word-break:break-all">${esc(boton.enlace)}</a></p>` : ''}
      <p style="margin:0 0 26px;font-size:13px;line-height:1.6;color:#6B746F">${nota}</p>
    </td></tr>
    <tr><td style="padding:22px 34px 28px;background:#FAFBFA;border-top:1px solid #EEF1EF;font-size:12px;line-height:1.7;color:#6B746F">
      <strong style="color:#0F4131">Academia Diana Gamboa</strong> · El idioma del mercado<br>
      Contenido educativo. No constituye asesoría financiera.<br>
      Diana Gamboa nunca te pedirá dinero, contraseñas ni acceso a tus cuentas de inversión.
    </td></tr>
  </table>
  <p style="margin:18px 0 0;font-size:11px;color:#8A938E">«Aprende a leer. Aprende a analizar. Aprende a decidir.»</p>
  <p style="margin:10px 0 0;font-size:10px;letter-spacing:.5px;color:#A9B0AC">Desarrollado con <span style="color:#CBA52F">&#9829;</span> por K&amp;T</p>
</td></tr></table>
</body></html>`;
}

/** Versión en texto plano (para los programas de correo que no muestran HTML). */
function textoPlano(titulo: string, parrafos: string[], extra: string[]) {
  return [titulo, '', ...parrafos.map(p => p.replace(/<[^>]+>/g, '')), '', ...extra, '', 'Academia Diana Gamboa · El idioma del mercado', 'Contenido educativo. No constituye asesoría financiera.'].join('\n');
}

export function correoConfirmacion({ sitio, nombre, enlace }: { sitio: string; nombre: string; enlace: string }) {
  const titulo = `¡Bienvenido a tu academia, ${nombre}!`;
  const parrafos = ['Gracias por registrarte. Solo falta un paso: confirma tu correo para entrar a tu <strong>Portal del Alumno</strong> y descubrir tu ruta de aprendizaje.', 'Allí encontrarás tus clases organizadas, los lives y la biblioteca de recursos para comenzar desde cero.'];
  return {
    asunto: 'Confirma tu correo · Academia Diana Gamboa',
    html: marco({ sitio, previa: 'Confirma tu correo y entra a tu Portal del Alumno.', etiqueta: 'Confirma tu cuenta', titulo, parrafos, boton: { texto: 'Confirmar mi correo', enlace }, nota: 'El enlace caduca en 24 horas. Si no creaste esta cuenta, puedes ignorar este correo.' }),
    texto: textoPlano(titulo, parrafos, [`Confirma tu correo aquí: ${enlace}`]),
  };
}

export function correoRecuperacion({ sitio, nombre, enlace }: { sitio: string; nombre: string; enlace: string }) {
  const titulo = 'Recupera tu contraseña';
  const parrafos = [`Hola${nombre ? `, ${esc(nombre)}` : ''}. Recibimos una solicitud para cambiar la contraseña de tu cuenta.`, 'Pulsa el botón para crear una nueva. Después entrarás directamente a tu Portal del Alumno.'];
  return {
    asunto: 'Crea una nueva contraseña · Academia Diana Gamboa',
    html: marco({ sitio, previa: 'Crea una nueva contraseña para tu cuenta.', etiqueta: 'Recuperar contraseña', titulo, parrafos, boton: { texto: 'Crear nueva contraseña', enlace }, nota: 'El enlace caduca en 1 hora. Si no lo pediste tú, ignora este correo: tu contraseña no cambiará.' }),
    texto: textoPlano(titulo, parrafos, [`Crea tu nueva contraseña aquí: ${enlace}`]),
  };
}

export function correoProvisional({ sitio, nombre, correo, clave }: { sitio: string; nombre: string; correo: string; clave: string }) {
  const titulo = `${nombre}, ya tienes tu cuenta`;
  const enlace = `${sitio}/ingresar`;
  const parrafos = ['Diana Gamboa creó tu cuenta en la academia. Para entrar usa tu correo y la contraseña provisional que aparece abajo.', `Tu correo de acceso es <strong>${esc(correo)}</strong>. La primera vez que entres te pediremos que crees tu propia contraseña.`];
  return {
    asunto: 'Tu contraseña provisional · Academia Diana Gamboa',
    html: marco({ sitio, previa: 'Tu cuenta está lista. Entra con tu contraseña provisional.', etiqueta: 'Tu cuenta está lista', titulo, parrafos,
      destacado: { titulo: 'Contraseña provisional', valor: clave, nota: 'Cámbiala al entrar por primera vez.' },
      boton: { texto: 'Entrar a mi portal', enlace }, nota: 'Por tu seguridad, no compartas esta contraseña con nadie.' }),
    texto: textoPlano(titulo, parrafos, [`Contraseña provisional: ${clave}`, `Entra aquí: ${enlace}`]),
  };
}

export function correoInvitacionAdmin({ sitio, nombre, enlace }: { sitio: string; nombre: string; enlace: string }) {
  const titulo = `${nombre}, tu academia está lista`;
  const parrafos = ['Ya puedes administrar la <strong>Academia Diana Gamboa</strong>: editar los textos y fotos de la web, publicar videos y recursos, y consultar a tus alumnos registrados.', 'Pulsa el botón para crear tu contraseña. Después entrarás directamente a la zona de administración, donde también encontrarás el manual de uso.'];
  return {
    asunto: 'Crea tu contraseña de administración · Academia Diana Gamboa',
    html: marco({ sitio, previa: 'Crea tu contraseña y entra a la administración de la academia.', etiqueta: 'Acceso de administración', titulo, parrafos, boton: { texto: 'Crear mi contraseña', enlace }, nota: 'El enlace caduca en 24 horas. Si caduca, pide uno nuevo con «¿Olvidaste tu contraseña?» en la pantalla de inicio de sesión.' }),
    texto: textoPlano(titulo, parrafos, [`Crea tu contraseña aquí: ${enlace}`]),
  };
}

export function correoBienvenida({ sitio, nombre }: { sitio: string; nombre: string }) {
  const titulo = `¡Bienvenido a tu academia, ${nombre}!`;
  const enlace = `${sitio}/portal`;
  const parrafos = ['Tu cuenta ya está lista. En tu <strong>Portal del Alumno</strong> encontrarás tus clases organizadas, los lives y la biblioteca de recursos para comenzar desde cero.', 'Te recomendamos empezar por el <strong>Reto de la Gráfica</strong>: en pocos minutos descubrirás tu nivel y la ruta de aprendizaje ideal para ti.'];
  return {
    asunto: 'Bienvenido a la Academia Diana Gamboa',
    html: marco({ sitio, previa: 'Tu cuenta está lista. Entra a tu Portal del Alumno.', etiqueta: 'Tu cuenta está lista', titulo, parrafos, boton: { texto: 'Entrar a mi portal', enlace }, nota: 'Entra siempre con tu correo y la contraseña que creaste. Si la olvidas, usa «¿Olvidaste tu contraseña?».' }),
    texto: textoPlano(titulo, parrafos, [`Entra a tu portal: ${enlace}`]),
  };
}

/** Aviso para la administradora: alguien compró un cupo. */
export function correoNuevoCupo({ sitio, evento, nombre, correo, monto, ocupados, cupos, enlace, porVerificar = false, telefono, correoPago }: { sitio: string; evento: string; nombre: string; correo: string; monto: string; ocupados: number; cupos: number; enlace: string; porVerificar?: boolean; telefono?: string | null; correoPago?: string | null }) {
  if (porVerificar) return correoPorVerificar({ sitio, evento, nombre, correo, monto, ocupados, cupos, enlace, telefono, correoPago });
  const titulo = 'Nuevo cupo comprado';
  const parrafos = [`<strong>${esc(nombre || correo)}</strong> (${esc(correo)}) compró un cupo para <strong>${esc(evento)}</strong>.`, `Pago recibido: <strong>${esc(monto)}</strong>. Cupos ocupados: <strong>${ocupados} de ${cupos}</strong>.`];
  return {
    asunto: `Nuevo cupo comprado · ${evento}`,
    html: marco({ sitio, previa: `${nombre || correo} compró un cupo.`, etiqueta: 'Nueva inscripción', titulo, parrafos, boton: { texto: 'Ver inscritos', enlace }, nota: 'El pago se procesó con Stripe. Puedes ver el detalle del pago en tu panel de Stripe.' }),
    texto: textoPlano(titulo, parrafos, [`Ver inscritos: ${enlace}`]),
  };
}

/** Agradecimiento para la persona que pagó su cupo. */
export function correoGraciasEvento({ sitio, nombre, evento, fecha, horario, enlace }: { sitio: string; nombre: string; evento: string; fecha: string; horario: string; enlace: string }) {
  const titulo = `¡Gracias por tu participación${nombre ? `, ${nombre}` : ''}!`;
  const parrafos = [`Tu pago fue aprobado y ya tienes tu cupo en <strong>${esc(evento)}</strong>.`, `<strong>Fecha:</strong> ${esc(fecha)}${horario ? `<br><strong>Horario:</strong> ${esc(horario)}` : ''}`, 'En tu portal encontrarás toda la información del evento. Antes de la primera clase publicaremos allí el enlace de acceso y te avisaremos por correo.'];
  return {
    asunto: `Tu cupo está confirmado · ${evento}`,
    html: marco({ sitio, previa: 'Tu pago fue aprobado. Ya tienes tu cupo.', etiqueta: 'Inscripción confirmada', titulo, parrafos, boton: { texto: 'Ver el evento en mi portal', enlace }, nota: `Si necesitas pedir un reembolso, revisa la política en ${sitio}/reembolsos.` }),
    texto: textoPlano(titulo, parrafos, [`Ver el evento: ${enlace}`]),
  };
}

/** Aviso para la administradora: alguien dice que pagó con el enlace y espera verificación. */
function correoPorVerificar({ sitio, evento, nombre, correo, monto, ocupados, cupos, enlace, telefono, correoPago }: { sitio: string; evento: string; nombre: string; correo: string; monto: string; ocupados: number; cupos: number; enlace: string; telefono?: string | null; correoPago?: string | null }) {
  const titulo = 'Nuevo cupo comprado: por verificar';
  const datos = [`<strong>Correo de su cuenta:</strong> ${esc(correo)}`, correoPago ? `<strong>Correo que usó en Stripe:</strong> ${esc(correoPago)}` : '', telefono ? `<strong>Teléfono / WhatsApp:</strong> ${esc(telefono)}` : ''].filter(Boolean).join('<br>');
  const parrafos = [`<strong>${esc(nombre || correo)}</strong> avisó que pagó <strong>${esc(monto)}</strong> por <strong>${esc(evento)}</strong>.`, datos, 'Revisa el pago en tu panel de Stripe (y el comprobante, si lo subió) y apruébalo en la administración. Mientras tanto, su cupo queda apartado.', `Cupos ocupados (pagados y por verificar): <strong>${ocupados} de ${cupos}</strong>.`];
  return {
    asunto: `Nuevo cupo por verificar · ${evento}`,
    html: marco({ sitio, previa: `${nombre || correo} pagó y espera verificación.`, etiqueta: 'Compra por verificar', titulo, parrafos, boton: { texto: 'Verificar la compra', enlace }, nota: 'Al aprobarla, la persona recibe su correo de confirmación. Si el pago no aparece en Stripe, recházala y el cupo se libera.' }),
    texto: textoPlano(titulo, parrafos, [`Verificar: ${enlace}`]),
  };
}
