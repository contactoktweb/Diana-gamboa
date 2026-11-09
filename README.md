# Diana Gamboa — Academia

Sitio de la academia de Diana Gamboa · El idioma del mercado. **Next.js 16 (App Router)**, React 19, TypeScript, Lucide y **Supabase** (cuentas, base de datos, archivos).

> **Para conectar Supabase sigue [`docs/PUESTA-EN-MARCHA.md`](docs/PUESTA-EN-MARCHA.md).** Sin las variables de entorno, la web funciona en modo de demostración con el contenido original.
>
> **Manual de uso de la administración:** dentro de la web, en `/admin/manual`.

> Concepto: la página de inicio es la **puerta** y el Portal del Alumno es la **casa**.

## Ejecutar localmente

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm lint       # comprobación de tipos
pnpm build
```

## Rutas

| Ruta | Contenido |
|---|---|
| `/` | Inicio: presentación, qué vas a aprender, sobre Diana, los seis espacios, invitación, prevención de estafas |
| `/sobre-diana` | Historia completa de Diana |
| `/registro`, `/ingresar`, `/recuperar`, `/nueva-clave` | Registro (correo o Google), inicio de sesión y recuperación de contraseña con Supabase Auth |
| `/auth/callback`, `/auth/confirmar` | Llegada desde Google y desde los enlaces de los correos |
| `/portal/cuenta` | Mi cuenta: nombre, novedades, preguntas opcionales y eliminación de la cuenta |
| `/admin` | Administración (solo cuentas administradoras): resumen, contenido, alumnos, correos y manual |
| `/portal` | Portal del Alumno (requiere sesión): ruta de aprendizaje, Reto, regalo de bienvenida, Salón y Cursos |
| `/portal/[seccion]` | Series 01–04 con videos de YouTube (laboratorio en la 01), lives (05) y biblioteca (06) |
| `/portal/salon` | Información del Salón Diana Gamboa |
| `/reto` | El Reto de la Gráfica completo para visitantes, sin registro; al final invita a crear la cuenta |
| `/portal/reto` | El Reto de la Gráfica completo: 5 retos, 20 respuestas, nivel y recomendación |
| `/terminos`, `/privacidad` | Páginas legales (editables desde la administración) |
| `/playlists` | Redirige a `/portal` |

## Dónde editar

**Textos, imágenes, enlaces, series, videos, PDF, Salón y Cursos se editan desde la administración** (`/admin/contenido`), sin tocar código. Los cambios se publican al instante.

- `lib/contenido/predeterminado.ts`: contenido original (lo que se muestra si no se ha editado nada).
- `lib/contenido/esquema.ts`: campos de los formularios de la administración.
- `supabase/esquema.sql`: estructura y seguridad de la base de datos.
- `app/globals.css`: paleta y tipografía oficiales en `:root`.

## Identidad de marca

Según el manual *Diana Gamboa Definitivo*:

- **Colores:** `#0F4131` verde profundo, `#176244` verde, `#CBA52F` dorado, `#000000` y `#FFFFFF`.
- **Tipografía:** Century Gothic (regular y negrita) para títulos y textos, y Meshitara Sans (la del logotipo) para etiquetas en mayúsculas. Los archivos están en `app/fonts/` en formato WOFF2 y se cargan con `next/font/local` en `app/layout.tsx`, así que se ven igual en cualquier dispositivo.
- **Logo:** versión bicolor (DG verde + velas doradas) sobre fondos claros y versión negativa (DG blanco + velas doradas) sobre fondos verdes.

El contenido de esta academia es exclusivamente educativo y no constituye asesoría financiera ni recomendaciones personalizadas de inversión.

## El Reto de la Gráfica

- `data/reto.ts`: banco de ejercicios (dos versiones de cada reto), niveles, categorías y recomendaciones.
- `lib/reto/grafica.ts`: velas ilustrativas, EMA calculada sobre los cierres y puntos de giro.
- `lib/reto/registro.ts`: intentos y respuestas. Se guardan en el navegador y en Supabase (función `reto_guardar`), también para visitantes sin cuenta; al registrarse se vinculan a la cuenta.
- `components/reto/`: juego, gráfica interactiva, preguntas, resultado e insignias.

Reglas: puntúa solo el primer intento de cada pregunta (máximo 20); tras un error hay pista y nuevos intentos, y al tercero se muestra la respuesta. El primer resultado completo se conserva como punto de partida y al repetir se usa la otra versión de los ejercicios.
