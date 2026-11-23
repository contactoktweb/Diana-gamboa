-- =====================================================================
-- Sala de clase con Zoom dentro de la web, recordatorios automáticos
-- y pagos solo con las claves de Stripe (sin enlace de pago).
-- Ejecutar en Supabase → SQL Editor. Se puede ejecutar varias veces: no borra datos.
-- Requiere haber ejecutado antes supabase/eventos.sql.
-- =====================================================================

-- Datos de la reunión de Zoom de cada evento. Tabla aparte para que ningún alumno
-- pueda leer el número ni el código: el servidor solo se los da a quien pagó.
create table if not exists public.eventos_zoom (
  evento_id       uuid primary key references public.eventos_privados (id) on delete cascade,
  reunion         text not null check (reunion ~ '^[0-9]{9,12}$'),
  clave           text not null default '',
  actualizado_en  timestamptz not null default now()
);
alter table public.eventos_zoom enable row level security;
drop policy if exists eventos_zoom_admin on public.eventos_zoom;
create policy eventos_zoom_admin on public.eventos_zoom for all to authenticated
  using (public.es_admin()) with check (public.es_admin());
revoke all on public.eventos_zoom from anon;
grant select, insert, update, delete on public.eventos_zoom to authenticated;
grant all on public.eventos_zoom to service_role;

-- Recordatorios ya enviados (uno por evento y tipo: la víspera y cada día de clase).
-- Evita que un recordatorio se envíe dos veces.
create table if not exists public.recordatorios_enviados (
  evento_id  uuid not null references public.eventos_privados (id) on delete cascade,
  clave      text not null,
  enviados   integer not null default 0,
  fallidos   integer not null default 0,
  manual     boolean not null default false,
  creado_en  timestamptz not null default now(),
  primary key (evento_id, clave)
);
alter table public.recordatorios_enviados enable row level security;
drop policy if exists recordatorios_admin on public.recordatorios_enviados;
create policy recordatorios_admin on public.recordatorios_enviados for select to authenticated using (public.es_admin());
revoke all on public.recordatorios_enviados from anon;
grant select on public.recordatorios_enviados to authenticated;
grant all on public.recordatorios_enviados to service_role;

-- Cada evento puede apagar sus recordatorios automáticos.
alter table public.eventos_privados add column if not exists recordatorios boolean not null default true;

-- El grupo de noviembre ya no usa su enlace de pago provisional (está agotado).
update public.eventos_privados set enlace_pago = '' where slug = 'call-o-put' and enlace_pago <> '';

-- Texto de acceso del primer taller: ahora la clase se abre dentro de la web (solo si aún tiene el texto original).
update public.eventos_privados set acceso = replace(acceso,
  'Gracias por inscribirte. Antes del taller publicaremos aquí el enlace de las clases en vivo y te lo enviaremos por correo.',
  'Gracias por tu confianza. El día de cada clase pulsa «Entrar a la clase» aquí arriba: la clase se abre dentro de la web, sin instalar Zoom. Te enviaremos un recordatorio un día antes y otro el mismo día.')
where slug = 'call-o-put' and acceso like 'Gracias por inscribirte. Antes del taller publicaremos%';
