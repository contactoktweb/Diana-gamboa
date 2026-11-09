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

Vercel → proyecto → **Settings → Environment Variables** (en *Production*, *Preview* y *Development*):

| Variable | Dónde se obtiene |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → *Project URL* |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys → *Publishable key* (`sb_publishable_…`). En proyectos antiguos: `NEXT_PUBLIC_SUPABASE_ANON_KEY` con la clave *anon public* |
| `NEXT_PUBLIC_SITE_URL` | La dirección pública de la web, por ejemplo `https://diana-gamboa.vercel.app` |

No hace falta la clave secreta (*service role*): la seguridad está en la base de datos.
Después de guardar las variables, haz un nuevo despliegue (**Deployments → Redeploy**).

Para trabajar en local, copia `.env.example` como `.env.local` y complétalo.

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

## 5. Correos en español

Supabase → **Authentication → Email Templates**. Para cada plantilla (*Confirm signup*, *Reset Password*,
*Change Email Address*, *Magic Link*) copia el asunto y el contenido desde la administración de la web:
**Administración → Correos → Correos automáticos** (botones «Copiar asunto» y «Copiar el contenido»).

**Recomendado — correo propio:** el servidor de correo incluido en Supabase tiene un límite bajo de envíos
por hora y puede terminar en spam. Para producción, configura un SMTP propio en
**Project Settings → Authentication → SMTP Settings** (por ejemplo Resend, Brevo o el correo del dominio),
con remitente `Academia Diana Gamboa <hola@tudominio.com>`.

## 6. Continuar con Google

1. En [Google Cloud Console](https://console.cloud.google.com/) → *APIs y servicios → Credenciales* →
   **Crear credenciales → ID de cliente de OAuth** (tipo *Aplicación web*).
2. En *URI de redireccionamiento autorizados* pega la dirección que muestra Supabase en
   **Authentication → Sign In / Providers → Google** (termina en `/auth/v1/callback`).
3. Copia el *ID de cliente* y el *Secreto* en ese mismo apartado de Supabase y actívalo.
4. En la *pantalla de consentimiento* de Google pon el nombre «Academia Diana Gamboa» y el logo.

Mientras Google no esté activado, el botón muestra el mensaje «El acceso con Google aún no está activado».

## 7. Crear la cuenta de administración

1. Diana se registra en la web como cualquier alumno (`/registro`) y confirma su correo.
2. En Supabase → **SQL Editor** ejecuta:

   ```sql
   select public.hacer_admin('correo-de-diana@ejemplo.com');
   ```

3. Al iniciar sesión entrará directamente a `/admin`. Desde **Administración → Alumnos** puede dar acceso
   a otras personas.

## 8. Comprobación final

- [ ] Registro con correo: llega el correo en español y el enlace lleva al Portal.
- [ ] Inicio de sesión y «¿Olvidaste tu contraseña?».
- [ ] Continuar con Google.
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
| Plantillas de correo | `lib/correos.ts` |

- **Contenido editable:** cada sección se guarda en la tabla `contenido` (una fila por sección). Lo no guardado
  usa el texto original de `predeterminado.ts`. Para añadir un campo nuevo: añádelo en `predeterminado.ts`, en
  `esquema.ts` (formulario) y úsalo en la página.
- **Publicación al instante:** las páginas públicas se sirven en caché; al guardar, la acción del servidor
  invalida la etiqueta `contenido` y la ruta raíz, y la siguiente visita ya muestra el cambio.
- **Seguridad:** RLS en todas las tablas. Los alumnos solo leen lo suyo; la administración usa funciones
  `admin_*` que comprueban `es_admin()`. Un alumno no puede cambiar su propio rol.
- **Reto:** se guarda con la función `reto_guardar` (también para visitantes sin cuenta) y se vincula a la
  cuenta con `reto_vincular` al registrarse en el mismo navegador.
