# Diana Gamboa — Academia

Sitio de la academia de educación bursátil de Diana Gamboa. **Next.js 16 (App Router)**, React 19, TypeScript y Lucide.

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
| `/` | Inicio: bienvenida, qué encontrarás, sobre Diana, invitación, prevención de estafas |
| `/registro`, `/ingresar`, `/recuperar` | Registro e inicio de sesión (**vista previa: aún no conectados**) |
| `/portal` | Portal del Alumno: ruta gratuita de 6 tarjetas + Salón y Cursos |
| `/portal/[seccion]` | Cada sección: videos de YouTube, laboratorio (01), programación de lives (05), recursos (06) |
| `/terminos`, `/privacidad` | Páginas legales (texto pendiente) |
| `/playlists` | Redirige a `/portal` |

## Dónde editar

- `data/academia.ts`: series, asignación a cada sección, horarios (hora de Nueva York), recursos, membresía y cursos.
- `app/globals.css`: paleta y tipografía oficiales en `:root`.
- `components/Brand.tsx` y `public/brand/`: logotipo oficial (versión color y negativo) y patrón de velas.

## Identidad de marca

Según el manual *Diana Gamboa Definitivo*:

- **Colores:** `#0F4131` verde profundo, `#176244` verde, `#CBA52F` dorado, `#000000` y `#FFFFFF`.
- **Tipografía:** Century Gothic (regular y negrita) para títulos y textos, y Meshitara Sans (la del logotipo) para etiquetas en mayúsculas. Los archivos están en `app/fonts/` en formato WOFF2 y se cargan con `next/font/local` en `app/layout.tsx`, así que se ven igual en cualquier dispositivo.
- **Logo:** versión bicolor (DG verde + velas doradas) sobre fondos claros y versión negativa (DG blanco + velas doradas) sobre fondos verdes.

Los horarios se escriben en hora de Nueva York y se muestran para EE. UU., Colombia, México y la hora local del visitante, respetando el horario de verano.

Contenido educativo. No constituye asesoría financiera.
