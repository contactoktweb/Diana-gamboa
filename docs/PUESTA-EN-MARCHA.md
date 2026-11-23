# Puesta en marcha con Supabase

Guía para conectar la academia a Supabase (cuentas reales, administración, resultados del Reto).
Se hace **una sola vez**. Mientras no se haga, la web funciona en **modo de demostración**: se ve igual,
pero no hay cuentas reales y la administración no guarda cambios.

---

## 1. Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) → **New project**.
2. Nombre: `diana-gamboa`. Región: la más cercana a los alumnos (por ejemplo, *East US*).
3. Guarda la contraseña de la base de datos en un lugar seguro.

## 2. Crear la estructura de la base de datos

**Opción A — sin terminal (recomendada):**

1. Supabase → **SQL Editor** → **New query**.
2. Copia y pega todo el archivo [`supabase/esquema.sql`](../supabase/esquema.sql) y pulsa **Run**.
3. Debe terminar con «Success. No rows returned».

**Opción B — con terminal:**

```bash
SUPABASE_DB_URL="postgresql://postgres:CONTRASEÑA@db.xxxx.supabase.co:5432/postgres" \
  ./scripts/configurar-base-de-datos.sh
```

El script se puede ejecutar varias veces: no borra datos.

Qué crea: perfiles de alumnos, contenido editable con historial, resultados del Reto, estadísticas de uso,
funciones del panel, el espacio de archivos `medios` (logos, fotos y PDF) y todas las reglas de seguridad.

## 3. Variables de entorno en Vercel

Vercel → proyecto → **Settings → Environment Variables** (en *Production* y *Preview*). Ver también `.env.example`.

| Variable | Dónde se obtiene | ¿Secreta? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → *Project URL* | No |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys → *Publishable key* (`sb_publishable_…`) | No |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys → *Secret keys* (`sb_secret_…`) | **Sí** |
| `RESEND_API_KEY` | Resend → API Keys → *Create API Key* (permiso «Sending access») | **Sí** |
| `CORREO_REMITENTE` | Un remitente de un dominio verificado en Resend, p. ej. `Academia Diana Gamboa <hola@dianagamboa.com>` | No |
| `NEXT_PUBLIC_SITE_URL` | La dirección pública de la web | No |

Las claves secretas solo van en Vercel: nunca en el código, en GitHub ni en mensajes.
Después de guardar las variables, haz un nuevo despliegue (**Deployments → Redeploy**).

## 4. Configurar el acceso (Authentication)

Supabase → **Authentication → URL Configuration**:

- **Site URL:** la dirección de la web (`https://diana-gamboa.vercel.app` o el dominio propio).
- **Redirect URLs:** añade
  - `https://TU-DOMINIO/auth/callback`
  - `https://TU-DOMINIO/auth/confirmar`
  - `http://localhost:3000/**` (solo para pruebas en local)

Supabase → **Authentication → Sign In / Providers → Email**:

- **Confirm email:** activado (el alumno confirma su correo antes de entrar).
- Longitud mínima de contraseña: 8.

## 5. Correos con Resend

Con `RESEND_API_KEY` y `SUPABASE_SECRET_KEY` configuradas, la web envía sus propios correos con el diseño
de la academia (las plantillas están en `lib/correo/plantillas.ts` y se pueden ver en
**Administración → Correos**):

| Correo | Cuándo se envía |
|---|---|
| Confirmación de correo | Al registrarse |
| Recuperación de contraseña | Al pulsar «¿Olvidaste tu contraseña?» |
| Contraseña provisional | Cuando la administradora crea un alumno (Administración → Alumnos → Crear alumno) |
| Invitación de administración | Para que Diana cree su contraseña (ver paso 7) |

**Dominio en Resend (obligatorio para enviar a cualquier persona):** Resend → **Domains → Add Domain**,
añade los registros DNS que indica y espera a que aparezca *Verified*. Sin un dominio verificado, Resend solo
entrega correos a la dirección de la propia cuenta de Resend. Después pon el remitente en `CORREO_REMITENTE`.

Sin Resend configurado, la web sigue funcionando: los correos de registro y recuperación los envía Supabase
con su diseño básico.

## 6. Acceso con Google

Desactivado por ahora: el botón «Continuar con Google» no se muestra.

## 7. Cuenta de administración (Diana)

La única cuenta administradora es **dianapersonalinfo@gmail.com** (se puede cambiar con la variable `ADMIN_CORREO`).

1. Con las variables del paso 3 configuradas y la web desplegada, abre en el navegador:
   `https://TU-DOMINIO/api/invitar-administradora`
2. La página confirma «Invitación enviada». Diana recibe el correo **«Crea tu contraseña de administración»**,
   crea su contraseña y entra directamente a `/admin`.

El enlace solo escribe a esa dirección, no reenvía más de una vez cada 10 minutos y deja a Diana como única
administradora. Si su cuenta ya está activa, indica que use «¿Olvidaste tu contraseña?».

Alternativa sin Resend: Diana se registra en `/registro` y se ejecuta en el SQL Editor
`select public.hacer_admin('dianapersonalinfo@gmail.com');`.

## 8. Comprobación final

- [ ] Registro con correo: llega el correo en español y el enlace lleva al Portal.
- [ ] Inicio de sesión y «¿Olvidaste tu contraseña?».
- [ ] `/portal` sin sesión lleva a «Iniciar sesión».
- [ ] Hacer el Reto como visitante, registrarse y ver el nivel en el Portal.
- [ ] En la administración: cambiar un texto, guardar y verlo publicado al instante.
- [ ] Subir una imagen y un PDF.
- [ ] Descargar la lista de alumnos en Excel.

---

## Referencia técnica

| Pieza | Archivo |
|---|---|
| Estructura de la base de datos | `supabase/esquema.sql` |
| Conexión con Supabase | `lib/supabase/` |
| Contenido original y formularios de edición | `lib/contenido/predeterminado.ts`, `lib/contenido/esquema.ts` |
| Renovación de la sesión | `proxy.ts` |
| Administración | `app/admin/` |
| Plantillas de correo (Resend) | `lib/correo/plantillas.ts` |

- **Contenido editable:** cada sección se guarda en la tabla `contenido` (una fila por sección). Lo no guardado
  usa el texto original de `predeterminado.ts`. Para añadir un campo nuevo: añádelo en `predeterminado.ts`, en
  `esquema.ts` (formulario) y úsalo en la página.
- **Publicación al instante:** las páginas públicas se sirven en caché; al guardar, la acción del servidor
  invalida la etiqueta `contenido` y la ruta raíz, y la siguiente visita ya muestra el cambio.
- **Seguridad:** RLS en todas las tablas. Los alumnos solo leen lo suyo; la administración usa funciones
  `admin_*` que comprueban `es_admin()`. Un alumno no puede cambiar su propio rol.
- **Reto:** se guarda con la función `reto_guardar` (también para visitantes sin cuenta) y se vincula a la
  cuenta con `reto_vincular` al registrarse en el mismo navegador.

## Eventos privados y pagos con Stripe

1. **Base de datos:** ejecuta en el SQL Editor de Supabase, en este orden, [`supabase/eventos.sql`](../supabase/eventos.sql)
   y [`supabase/sala-y-recordatorios.sql`](../supabase/sala-y-recordatorios.sql). Se pueden ejecutar varias veces.
2. **Clave de Stripe:** Stripe → Developers → API keys → *Secret key*. Súbela a Vercel como `STRIPE_SECRET_KEY`.
3. **Avisos de pago (webhook):** Stripe → Developers → Webhooks → *Add destination*:
   - Dirección: `https://www.dianagamboa.com/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`, `charge.refunded`
   - Copia el *Signing secret* (`whsec_…`) y súbelo a Vercel como `STRIPE_WEBHOOK_SECRET`.
4. Vuelve a desplegar en Vercel.

El pago se hace solo con las claves (ya no hay enlace de pago): el alumno pulsa «Reserva tu lugar», paga en Stripe
y vuelve inscrito. Recibe el correo «Gracias por tu confianza» y Diana el aviso «Nuevo cupo comprado».
Sin claves de Stripe, los alumnos solo pueden preinscribirse.
Recomendado: probar primero con las claves de prueba de Stripe (`sk_test_…`) y la tarjeta `4242 4242 4242 4242`.

**Página pública:** cada evento visible tiene una página para compartir sin cuenta: `/eventos/<dirección>`
(por ejemplo `/eventos/call-o-put`; el atajo `/taller` lleva ahí). La compra y el acceso siguen dentro del portal.

## Sala de clase con Zoom (dentro de la web)

1. **Zoom Pro** en la cuenta de Diana.
2. **App del Meeting SDK:** [marketplace.zoom.us](https://marketplace.zoom.us) → *Develop* → *Build App* → **General App**.
   En *Features → Embed* activa **Meeting SDK**. En *App Credentials* copia el *Client ID* y el *Client Secret*
   y súbelos a Vercel como `ZOOM_SDK_CLIENT_ID` y `ZOOM_SDK_CLIENT_SECRET`. Con esto los alumnos entran a la clase
   desde su portal sin salir de la web.
3. **Opcional, para que Diana inicie la clase desde la web y cree la reunión con un botón:** otra app **Server-to-Server OAuth**
   con los permisos `user:read:zak:admin` y `meeting:write:meeting:admin`. Sube a Vercel `ZOOM_ACCOUNT_ID`,
   `ZOOM_CLIENT_ID` y `ZOOM_CLIENT_SECRET` y actívala (*Activate your app*). Sin ella, Diana inicia la reunión en la
   aplicación de Zoom y los alumnos igual entran desde la web.
4. Vuelve a desplegar. En **Administración → Eventos → (evento) → Sala de clase**, crea la reunión o pega su ID y código.
   La reunión debe tener la **sala de espera** activada.

## Recordatorios automáticos

- Vercel ejecuta cada día a las 8:00 a. m. de Nueva York (13:00 UTC) la tarea de [`vercel.json`](../vercel.json).
- Sube a Vercel la variable `CRON_SECRET` (una clave larga inventada, por ejemplo de 32 letras y números). Sin ella la tarea no hace nada.
- Se envían a los inscritos con pago aprobado: un día antes del primer día y la mañana de cada día de clase,
  con la hora en cada país y el botón «Entrar a la clase». Cada uno sale una sola vez.
- En la administración del evento se ven los recordatorios, se pueden probar (te llegan a ti) y enviar a mano.
  La bienvenida («gracias por tu confianza») se envía a mano desde ahí.
- Cuidado con el límite de Resend: el plan gratuito permite 100 correos al día.

## Nuevo grupo con prioridad para la lista de espera

1. Ejecuta [`supabase/grupo-diciembre.sql`](../supabase/grupo-diciembre.sql) (después de `sala-y-recordatorios.sql`). Crea el grupo
   `call-o-put-diciembre` (19 y 20 de diciembre, US$99, 100 cupos), oculto de la lista de Eventos y con prioridad para la
   lista de espera del grupo de noviembre.
2. Prueba la reserva y el pago con tu cuenta de administradora (siempre puede comprar).
3. En **Administración → Eventos → (grupo) → Lanzamiento del grupo**: «Probar» y luego **«Enviar a la lista de espera»**.
4. Cuando Diana confirme el anuncio público: **«Abrir a todos y avisar»**. El grupo aparece en Eventos y se envía
   «Nuevo grupo disponible» a los demás alumnos (no a la lista de espera ni a quienes ya tienen cupo). Si son muchos, la
   tarea diaria sigue enviando a los que falten (variable opcional `LIMITE_AVISOS_DIA`, por defecto 90 por día).
5. Mientras no estén las claves de Stripe, el pago usa el **enlace de pago** del evento con «Ya pagué» y verificación,
   como en noviembre. Con las claves, el pago es automático y el enlace no se usa.
