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
- `app/globals.css`: colores y fuentes en `:root` (listo para los códigos definitivos de marca).
- `components/Brand.tsx`: logotipo provisional en texto; reemplazar por el logo final.

Los horarios se escriben en hora de Nueva York y se muestran para EE. UU., Colombia, México y la hora local del visitante, respetando el horario de verano.

Contenido educativo. No constituye asesoría financiera.
