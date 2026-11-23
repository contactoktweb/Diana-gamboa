-- =====================================================================
-- Nuevo grupo de «Antes de Comprar Ese Call o Ese Put» (diciembre) con
-- prioridad para la lista de espera del grupo de noviembre.
-- Ejecutar en Supabase → SQL Editor, DESPUÉS de supabase/sala-y-recordatorios.sql.
-- Se puede ejecutar varias veces: no borra datos ni pisa cambios hechos desde la administración.
-- =====================================================================

-- Texto sobre el título, visibilidad en la lista y etapa de prioridad.
alter table public.eventos_privados add column if not exists etiqueta text not null default '';
alter table public.eventos_privados add column if not exists en_lista boolean not null default true;
alter table public.eventos_privados add column if not exists solo_lista_espera boolean not null default false;
alter table public.eventos_privados add column if not exists lista_de uuid references public.eventos_privados (id) on delete set null;
alter table public.eventos_privados add column if not exists aviso_publico_en timestamptz;
alter table public.eventos_privados add column if not exists aviso_solo_novedades boolean not null default true;

-- Quién ya recibió cada aviso (lista de espera / nuevo grupo): nadie lo recibe dos veces.
create table if not exists public.avisos_enviados (
  evento_id   uuid not null references public.eventos_privados (id) on delete cascade,
  tipo        text not null check (tipo in ('lista_espera', 'nuevo_grupo')),
  correo      text not null,
  enviado_en  timestamptz not null default now(),
  primary key (evento_id, tipo, correo)
);
alter table public.avisos_enviados enable row level security;
drop policy if exists avisos_admin on public.avisos_enviados;
create policy avisos_admin on public.avisos_enviados for select to authenticated using (public.es_admin());
revoke all on public.avisos_enviados from anon;
grant select on public.avisos_enviados to authenticated;
grant all on public.avisos_enviados to service_role;

-- El grupo de diciembre: mismo taller, mismo valor (US$99), 100 cupos.
-- Sábado 19 y domingo 20 de diciembre de 2026, 2:00 p. m. Nueva York / Colombia (EST = UTC-5).
-- Copia la descripción, las preguntas frecuentes y el aviso de riesgo del grupo de noviembre.
insert into public.eventos_privados (slug, titulo, etiqueta, subtitulo, detalles, resumen, contenido, acceso, aviso,
  fecha_tipo, fecha, fecha_fin, hora_inicio, horario, precio_centavos, cupos, inscripcion_abierta, visible,
  en_lista, solo_lista_espera, lista_de, enlace_pago, recordatorios)
select
  'call-o-put-diciembre',
  n.titulo,
  'NUEVO GRUPO · DICIEMBRE',
  'Taller práctico de opciones de nivel intermedio. Dos clases en vivo con Diana Gamboa para aprender a comparar contratos y escoger el que mejor encaja con tu lectura de la gráfica, el tiempo que esperas estar en la operación y el riesgo que estás dispuesto a asumir.',
  'USD 99 por las dos clases · 100 cupos · Incluye las grabaciones de las dos clases',
  'Nuevo grupo del taller completo: dos clases en vivo con Diana, el sábado 19 y el domingo 20 de diciembre. Incluye las grabaciones.',
  replace(replace(replace(n.contenido,
    '## Día 1 · Evaluar el contrato antes de entrar',
    E'## Sábado 19 · Qué reviso antes de comprar un contrato\n\nStrike, vencimiento, spread, liquidez y cómo responde el contrato al movimiento del activo, al paso del tiempo y a la volatilidad.'),
    '## Día 2 · Aplicar los criterios según tu operación',
    E'## Domingo 20 · De la gráfica a la cadena de opciones\n\nEjercicios para comparar contratos en casos de scalping, intradía y swing.'),
    '- Grabación de las dos clases.',
    '- Las grabaciones de las dos clases en tu portal.'),
  n.acceso,
  n.aviso,
  'exacta', '2026-12-19', '2026-12-20', '2026-12-19 14:00:00-05',
  '2:00 p. m. en Colombia y Nueva York · 11:00 a. m. en el Pacífico, ambos días · Duración por confirmar',
  9900, 100, true, true,
  false, true, n.id, 'https://buy.stripe.com/eVqaEXc9D8fA83TenIejK00', true
from public.eventos_privados n
where n.slug = 'call-o-put'
on conflict (slug) do nothing;
