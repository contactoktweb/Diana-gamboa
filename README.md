# Diana Gamboa — Academia

Sitio de la academia de Diana Gamboa · El idioma del mercado. **Next.js 16 (App Router)**, React 19, TypeScript y Lucide.

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
| `/registro`, `/ingresar`, `/recuperar` | Registro e inicio de sesión (**aún no conectados a un sistema de cuentas**) |
| `/portal` | Portal del Alumno: ruta gratuita de 6 tarjetas + Salón y Cursos |
| `/portal/[seccion]` | Series 01–04 con videos de YouTube (laboratorio en la 01), lives (05) y biblioteca (06) |
| `/portal/salon` | Información del Salón Diana Gamboa |
| `/reto` | El Reto de la Gráfica completo para visitantes, sin registro; al final invita a crear la cuenta |
| `/portal/reto` | El Reto de la Gráfica completo: 5 retos, 20 respuestas, nivel y recomendación |
| `/terminos`, `/privacidad` | Páginas legales (texto pendiente) |
| `/playlists` | Redirige a `/portal` |

## Dónde editar

- `data/academia.ts`: series y enlaces de YouTube, recursos descargables, enlace de la membresía del Salón.
  - **Publicar un PDF:** copiarlo en `public/recursos/` y añadir su ruta en `file` del recurso. El botón pasa de «Próximamente» a «Descargar PDF». El primer recurso es también el regalo de bienvenida.
  - **Abrir el Salón:** poner el enlace oficial en `SALON_URL`.
- `app/globals.css`: paleta y tipografía oficiales en `:root`.
- `components/Brand.tsx` y `public/brand/`: logotipo oficial (versión color y negativo) y patrón de velas.

## Identidad de marca

Según el manual *Diana Gamboa Definitivo*:

- **Colores:** `#0F4131` verde profundo, `#176244` verde, `#CBA52F` dorado, `#000000` y `#FFFFFF`.
- **Tipografía:** Century Gothic (regular y negrita) para títulos y textos, y Meshitara Sans (la del logotipo) para etiquetas en mayúsculas. Los archivos están en `app/fonts/` en formato WOFF2 y se cargan con `next/font/local` en `app/layout.tsx`, así que se ven igual en cualquier dispositivo.
- **Logo:** versión bicolor (DG verde + velas doradas) sobre fondos claros y versión negativa (DG blanco + velas doradas) sobre fondos verdes.

El contenido de esta academia es exclusivamente educativo y no constituye asesoría financiera ni recomendaciones personalizadas de inversión.

## El Reto de la Gráfica

- `data/reto.ts`: banco de ejercicios (dos versiones de cada reto), niveles, categorías y recomendaciones.
- `lib/reto/grafica.ts`: velas ilustrativas, EMA calculada sobre los cierres y puntos de giro.
- `lib/reto/registro.ts`: intentos y respuestas. **Hoy se guardan en el navegador del alumno**; el formato (un intento con sus respuestas por categoría, intentos por pregunta, experiencia declarada, inicio/fin y si se completó) es el que tendrá la base de datos.
- `components/reto/`: juego, gráfica interactiva, preguntas, resultado e insignias.

Reglas: puntúa solo el primer intento de cada pregunta (máximo 20); tras un error hay pista y nuevos intentos, y al tercero se muestra la respuesta. El primer resultado completo se conserva como punto de partida y al repetir se usa la otra versión de los ejercicios.
