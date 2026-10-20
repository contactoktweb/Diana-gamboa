# Diana Gamboa Momentum — Proyecto final Next.js

Página profesional de educación bursátil desarrollada con **Next.js 16 (App Router)**, React 19, TypeScript, GSAP/ScrollTrigger, Lenis y Lucide.

## Ejecutar localmente

Requiere **Node.js 20.9 o superior** (recomendado Node 22), npm y acceso a internet para instalar dependencias.

```bash
npm install
npm run dev
```

- Inicio: http://localhost:3000
- Biblioteca de playlists: http://localhost:3000/playlists

Para comprobar tipos y generar una versión lista para producción:

```bash
npm run lint
npm run build
npm run start
```

## Contenido final del proyecto

- **Home `/`**: presentación de Diana, su diferenciación y objetivo, enfoque de cuatro etapas, laboratorio interactivo de lectura de gráficos con datos ilustrativos, series educativas, agenda y canales oficiales.
- **Playlists `/playlists`**: hero con fotografía, seis listas en el orden solicitado, miniaturas locales, filtros, CTA de YouTube y ruta sugerida para comenzar.
- **Introducción de carga**: monograma DG que se dibuja, contador ornamental 00–100, barra, transición turquesa, botón para saltar y adaptación a preferencias de movimiento reducido. El contador es una **animación de bienvenida**, no una medición de descarga.
- **Hero móvil corregido**: retrato correctamente encuadrado. Las tarjetas «EDUCACIÓN BURSÁTIL» y «06 LISTAS / CANAL OFICIAL» se sitúan detrás o debajo del retrato sin ocultar sus textos y sin sobresalir de la pantalla. También se corrigió la disposición del objetivo en el inicio.
- **Identidad de marca**: paleta **Luxury Emerald** (Primario `#0B3D2E`, Secundario `#1F6E52`, Acento `#C9A227`, Neutro `#F5F1E6`), blanco, fotos originales proporcionadas.
- **Motion design**: GSAP/ScrollTrigger, revelados, parallax, SVG interactivo, marquesinas, órbitas, scroll suave y respuesta al hover. Acciones clave disponibles sin hover en móvil.

## Archivos principales

- `app/page.tsx`: ruta de inicio.
- `app/playlists/page.tsx`: ruta de biblioteca.
- `components/DianaSite.tsx`: secciones del inicio.
- `components/PlaylistsSite.tsx`: biblioteca y hero de playlists.
- `components/SiteIntro.tsx`: intro de marca.
- `app/globals.css`: diseño, transiciones y media queries responsive.
- `data/playlists.ts`: título, orden, enlace y descripción de cada playlist.
- `public/`: logos, fotografías y seis miniaturas almacenadas localmente.

## Notas de entrega

Los seis enlaces facilitados por el usuario se conservan en `data/playlists.ts`, en su mismo orden. Las miniaturas en `public/playlists` son recortes de la captura del usuario: pueden sustituirse por recursos originales si se desea más definición.

No se incluyen archivos de fuentes comerciales. El CSS emplea Eastman Alt Pack cuando esté disponible legalmente y fuentes alternativas en caso contrario. No hay datos de bolsa en tiempo real; los gráficos son únicamente didácticos.

**Verificación realizada:** sintaxis de 8 archivos TypeScript/TSX, análisis de CSS con PostCSS, presencia de fotografías/logos/6 miniaturas y enlaces, previsualización estática del hero de playlists en Chromium a 320, 390, 768 y 1440 px sin desbordamiento horizontal. **No se completó `npm install` ni un build integrado de Next.js en este entorno** debido al tiempo de espera de la descarga de dependencias. Ejecutar `npm run build` tras instalar en tu equipo o entorno de despliegue.
