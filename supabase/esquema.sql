-- =====================================================================
--  Academia Diana Gamboa · Estructura de la base de datos (Supabase)
--
--  Cómo usarlo: en Supabase → SQL Editor → New query, pegar todo este
--  archivo y pulsar «Run». Se puede ejecutar varias veces sin problema:
--  no borra datos y deja todo en su versión más reciente.
--
--  Contiene:
--   1. Perfiles de alumnos y administradores (ligados a las cuentas).
--   2. Contenido editable de la web (+ historial de cambios).
--   3. Resultados de «El Reto de la Gráfica».
--   4. Eventos de uso (secciones visitadas y descargas).
--   5. Funciones para el panel de administración.
--   6. Almacenamiento de archivos (logos, fotos y PDF).
--   7. Seguridad: cada alumno solo ve lo suyo; la administración ve todo.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. Perfiles
-- ---------------------------------------------------------------------
create table if not exists public.perfiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  nombre              text not null default '',
  correo              text not null default '',
  rol                 text not null default 'alumno' check (rol in ('alumno', 'admin')),
  acepta_terminos_en  timestamptz,
  acepta_novedades    boolean not null default false,
  pais                text,
  experiencia         text,
  intereses           text,
  creado_en           timestamptz not null default now(),
  actualizado_en      timestamptz not null default now()
);
create index if not exists perfiles_creado_en_idx on public.perfiles (creado_en);
alter table public.perfiles enable row level security;

-- ¿La persona que hace la consulta es administradora?
create or replace function public.es_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin');
$$;

-- Al crear una cuenta (correo o Google) se crea su perfil automáticamente.
create or replace function public.crear_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.perfiles (id, nombre, correo, acepta_terminos_en, acepta_novedades)
  values (
    new.id,
    coalesce(nullif(meta->>'nombre', ''), nullif(meta->>'full_name', ''), nullif(meta->>'name', ''), split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(new.email, ''),
    case when meta->>'acepta_terminos' = 'true' then now() end,
    coalesce(meta->>'acepta_novedades' = 'true', false)
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.crear_perfil();

-- Cuentas creadas antes de ejecutar este script: se les crea su perfil.
insert into public.perfiles (id, nombre, correo)
select u.id,
       coalesce(nullif(u.raw_user_meta_data->>'nombre', ''), nullif(u.raw_user_meta_data->>'full_name', ''), split_part(coalesce(u.email, ''), '@', 1)),
       coalesce(u.email, '')
from auth.users u
on conflict (id) do nothing;

-- Si el alumno cambia su correo, el perfil se actualiza.
create or replace function public.sincronizar_correo()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email is distinct from old.email then
    update public.perfiles set correo = coalesce(new.email, ''), actualizado_en = now() where id = new.id;
  end if;
  return new;
end $$;

drop trigger if exists al_cambiar_correo on auth.users;
create trigger al_cambiar_correo after update of email on auth.users
  for each row execute function public.sincronizar_correo();

drop policy if exists perfiles_leer on public.perfiles;
create policy perfiles_leer on public.perfiles for select
  using (id = auth.uid() or public.es_admin());

drop policy if exists perfiles_editar on public.perfiles;
create policy perfiles_editar on public.perfiles for update
  using (id = auth.uid() or public.es_admin())
  with check (id = auth.uid() or public.es_admin());

-- Un alumno solo puede cambiar estos datos de su perfil (nunca su rol).
revoke update on public.perfiles from anon, authenticated;
grant update (nombre, acepta_novedades, pais, experiencia, intereses, acepta_terminos_en) on public.perfiles to authenticated;

-- ---------------------------------------------------------------------
-- 2. Contenido editable de la web
--    Una fila por sección (global, inicio, sobre, portal…). Los campos que
--    no estén guardados aquí usan el texto original incluido en la web.
-- ---------------------------------------------------------------------
create table if not exists public.contenido (
  seccion          text primary key,
  datos            jsonb not null default '{}'::jsonb,
  actualizado_en   timestamptz not null default now(),
  actualizado_por  uuid references auth.users (id) on delete set null
);
alter table public.contenido enable row level security;

create table if not exists public.contenido_historial (
  id            bigint generated always as identity primary key,
  seccion       text not null,
  datos         jsonb not null,
  guardado_en   timestamptz not null default now(),
  guardado_por  uuid references auth.users (id) on delete set null
);
create index if not exists contenido_historial_idx on public.contenido_historial (seccion, guardado_en desc);
alter table public.contenido_historial enable row level security;

-- Antes de cada cambio se guarda la versión anterior (para poder restaurarla).
create or replace function public.guardar_historial()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    insert into public.contenido_historial (seccion, datos, guardado_en, guardado_por)
    values (old.seccion, old.datos, old.actualizado_en, old.actualizado_por);
  elsif tg_op = 'DELETE' then
    insert into public.contenido_historial (seccion, datos, guardado_en, guardado_por)
    values (old.seccion, old.datos, old.actualizado_en, old.actualizado_por);
    return old;
  end if;
  new.actualizado_en := now();
  new.actualizado_por := auth.uid();
  return new;
end $$;

drop trigger if exists contenido_historial_trg on public.contenido;
create trigger contenido_historial_trg before update or delete on public.contenido
  for each row execute function public.guardar_historial();

drop policy if exists contenido_leer on public.contenido;
create policy contenido_leer on public.contenido for select using (true);

drop policy if exists contenido_admin on public.contenido;
create policy contenido_admin on public.contenido for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

drop policy if exists historial_admin on public.contenido_historial;
create policy historial_admin on public.contenido_historial for select to authenticated
  using (public.es_admin());

-- ---------------------------------------------------------------------
-- 3. El Reto de la Gráfica
-- ---------------------------------------------------------------------
create table if not exists public.reto_intentos (
  id              uuid primary key,
  usuario_id      uuid references auth.users (id) on delete cascade,
  version         smallint not null default 0,
  experiencia     text,
  inicio          timestamptz not null default now(),
  fin             timestamptz,
  completo        boolean not null default false,
  puntaje         smallint,
  nivel           text,
  por_categoria   jsonb,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);
create index if not exists reto_intentos_usuario_idx on public.reto_intentos (usuario_id, inicio);
create index if not exists reto_intentos_inicio_idx on public.reto_intentos (inicio);
alter table public.reto_intentos enable row level security;

create table if not exists public.reto_respuestas (
  intento_id              uuid not null references public.reto_intentos (id) on delete cascade,
  item                    text not null,
  categoria               text not null check (categoria in ('velas', 'movimiento', 'tendencia', 'niveles', 'medias')),
  acierto_primer_intento  boolean not null,
  intentos                smallint not null,
  creado_en               timestamptz not null default now(),
  primary key (intento_id, item)
);
alter table public.reto_respuestas enable row level security;

drop policy if exists intentos_leer on public.reto_intentos;
create policy intentos_leer on public.reto_intentos for select
  using (usuario_id = auth.uid() or public.es_admin());

drop policy if exists respuestas_leer on public.reto_respuestas;
create policy respuestas_leer on public.reto_respuestas for select
  using (exists (select 1 from public.reto_intentos i where i.id = intento_id and (i.usuario_id = auth.uid() or public.es_admin())));

-- Guarda (o actualiza) un intento completo con sus respuestas. Lo usan
-- visitantes sin cuenta y alumnos; el identificador lo genera el navegador.
create or replace function public.reto_guardar(p jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_id     uuid := (p->>'id')::uuid;
  v_dueno  uuid;
begin
  if v_id is null then raise exception 'Intento sin identificador'; end if;
  select usuario_id into v_dueno from public.reto_intentos where id = v_id;
  if v_dueno is not null and v_dueno is distinct from auth.uid() then
    raise exception 'No autorizado';
  end if;

  insert into public.reto_intentos (id, usuario_id, version, experiencia, inicio, fin, completo, puntaje, nivel, por_categoria)
  values (
    v_id, auth.uid(),
    coalesce((p->>'version')::smallint, 0),
    left(p->>'experiencia', 120),
    coalesce((p->>'inicio')::timestamptz, now()),
    (p->>'fin')::timestamptz,
    coalesce((p->>'completo')::boolean, false),
    (p->>'puntaje')::smallint,
    left(p->>'nivel', 60),
    p->'porCategoria'
  )
  on conflict (id) do update set
    usuario_id     = coalesce(public.reto_intentos.usuario_id, excluded.usuario_id),
    fin            = excluded.fin,
    completo       = excluded.completo,
    puntaje        = excluded.puntaje,
    nivel          = excluded.nivel,
    por_categoria  = excluded.por_categoria,
    actualizado_en = now();

  insert into public.reto_respuestas (intento_id, item, categoria, acierto_primer_intento, intentos)
  select v_id, left(r->>'item', 80), r->>'categoria', coalesce((r->>'aciertoPrimerIntento')::boolean, false), coalesce((r->>'intentos')::smallint, 1)
  from jsonb_array_elements(coalesce(p->'respuestas', '[]'::jsonb)) as r
  limit 40
  on conflict (intento_id, item) do update set
    acierto_primer_intento = excluded.acierto_primer_intento,
    intentos               = excluded.intentos;
end $$;

-- Al registrarse, los retos hechos como visitante pasan a su cuenta.
create or replace function public.reto_vincular(ids uuid[])
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  update public.reto_intentos set usuario_id = auth.uid(), actualizado_en = now()
  where id = any (ids) and usuario_id is null;
end $$;

-- ---------------------------------------------------------------------
-- 4. Eventos de uso (para las estadísticas del panel)
-- ---------------------------------------------------------------------
create table if not exists public.eventos (
  id          bigint generated always as identity primary key,
  usuario_id  uuid references auth.users (id) on delete set null,
  tipo        text not null check (tipo in ('visita', 'descarga')),
  referencia  text not null,
  creado_en   timestamptz not null default now()
);
create index if not exists eventos_tipo_idx on public.eventos (tipo, referencia);
alter table public.eventos enable row level security;

drop policy if exists eventos_admin on public.eventos;
create policy eventos_admin on public.eventos for select to authenticated using (public.es_admin());

create or replace function public.registrar_evento(p_tipo text, p_referencia text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_tipo not in ('visita', 'descarga') or coalesce(p_referencia, '') = '' then return; end if;
  insert into public.eventos (usuario_id, tipo, referencia) values (auth.uid(), p_tipo, left(p_referencia, 120));
end $$;

-- ---------------------------------------------------------------------
-- 5. Funciones del panel de administración
-- ---------------------------------------------------------------------

-- Primer intento completo de cada persona (o de cada visitante): refleja
-- el nivel con el que llegó a la academia.
create or replace view public.reto_primeros with (security_invoker = true) as
  select distinct on (coalesce(usuario_id::text, id::text)) *
  from public.reto_intentos
  where completo
  order by coalesce(usuario_id::text, id::text), inicio;

create or replace function public.admin_resumen()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r jsonb;
begin
  if not public.es_admin() then raise exception 'No autorizado'; end if;

  select jsonb_build_object(
    'alumnos',            (select count(*) from perfiles where rol = 'alumno'),
    'alumnos_7d',         (select count(*) from perfiles where rol = 'alumno' and creado_en > now() - interval '7 days'),
    'alumnos_30d',        (select count(*) from perfiles where rol = 'alumno' and creado_en > now() - interval '30 days'),
    'novedades',          (select count(*) from perfiles where rol = 'alumno' and acepta_novedades),
    'retos_completos',    (select count(*) from reto_intentos where completo),
    'retos_abandonados',  (select count(*) from reto_intentos where not completo and actualizado_en < now() - interval '1 hour'),
    'alumnos_con_reto',   (select count(distinct usuario_id) from reto_intentos where completo and usuario_id is not null),
    'visitantes_con_reto',(select count(*) from reto_intentos where completo and usuario_id is null),
    'niveles', (
      select coalesce(jsonb_object_agg(nivel, n), '{}'::jsonb)
      from (select nivel, count(*) as n from reto_primeros group by nivel) x
    ),
    'categorias', (
      select coalesce(jsonb_object_agg(categoria, jsonb_build_object('aciertos', aciertos, 'total', total)), '{}'::jsonb)
      from (
        select r.categoria, count(*) filter (where r.acierto_primer_intento) as aciertos, count(*) as total
        from reto_respuestas r join reto_primeros p on p.id = r.intento_id
        group by r.categoria
      ) x
    ),
    'items', (
      select coalesce(jsonb_agg(jsonb_build_object('item', item, 'categoria', categoria, 'fallos', fallos, 'total', total) order by fallos::numeric / nullif(total, 0) desc, total desc), '[]'::jsonb)
      from (
        select r.item, r.categoria, count(*) filter (where not r.acierto_primer_intento) as fallos, count(*) as total
        from reto_respuestas r join reto_primeros p on p.id = r.intento_id
        group by r.item, r.categoria
      ) x
    ),
    'experiencia', (
      select coalesce(jsonb_agg(jsonb_build_object('experiencia', experiencia, 'n', n, 'promedio', promedio) order by n desc), '[]'::jsonb)
      from (select coalesce(experiencia, 'Sin respuesta') as experiencia, count(*) as n, round(avg(puntaje), 1) as promedio
            from reto_primeros group by 1) x
    ),
    'visitas', (
      select coalesce(jsonb_agg(jsonb_build_object('referencia', referencia, 'n', n) order by n desc), '[]'::jsonb)
      from (select referencia, count(*) as n from eventos where tipo = 'visita' group by referencia) x
    ),
    'descargas', (
      select coalesce(jsonb_agg(jsonb_build_object('referencia', referencia, 'n', n) order by n desc), '[]'::jsonb)
      from (select referencia, count(*) as n from eventos where tipo = 'descarga' group by referencia) x
    ),
    'registros_semana', (
      select coalesce(jsonb_agg(jsonb_build_object('semana', semana, 'n', n) order by semana), '[]'::jsonb)
      from (
        select to_char(date_trunc('week', creado_en), 'YYYY-MM-DD') as semana, count(*) as n
        from perfiles where rol = 'alumno' and creado_en > now() - interval '12 weeks'
        group by 1
      ) x
    )
  ) into r;
  return r;
end $$;

create or replace function public.admin_alumnos(
  p_busqueda text default null, p_nivel text default null, p_desde date default null, p_hasta date default null
)
returns table (
  id uuid, nombre text, correo text, rol text, creado_en timestamptz, acepta_novedades boolean,
  pais text, experiencia text, intereses text,
  primer_nivel text, primer_puntaje smallint, primer_por_categoria jsonb,
  ultimo_nivel text, ultimo_puntaje smallint, retos_completos bigint, ultimo_reto timestamptz
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.es_admin() then raise exception 'No autorizado'; end if;
  return query
  select p.id, p.nombre, p.correo, p.rol, p.creado_en, p.acepta_novedades, p.pais, p.experiencia, p.intereses,
         pri.nivel, pri.puntaje, pri.por_categoria,
         ult.nivel, ult.puntaje,
         (select count(*) from reto_intentos i where i.usuario_id = p.id and i.completo),
         ult.inicio
  from perfiles p
  left join lateral (select * from reto_intentos i where i.usuario_id = p.id and i.completo order by i.inicio asc limit 1) pri on true
  left join lateral (select * from reto_intentos i where i.usuario_id = p.id and i.completo order by i.inicio desc limit 1) ult on true
  where (p_busqueda is null or p.nombre ilike '%' || p_busqueda || '%' or p.correo ilike '%' || p_busqueda || '%')
    and (p_nivel is null or pri.nivel = p_nivel or (p_nivel = 'Sin reto' and pri.nivel is null))
    and (p_desde is null or p.creado_en >= p_desde)
    and (p_hasta is null or p.creado_en < p_hasta + 1)
  order by p.creado_en desc;
end $$;

create or replace function public.admin_reto_detalle(p_desde date default null, p_hasta date default null)
returns table (
  intento_id uuid, inicio timestamptz, completo boolean, primer_intento boolean, nombre text, correo text,
  experiencia text, puntaje smallint, nivel text, categoria text, item text, acierto_primer_intento boolean, intentos smallint
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.es_admin() then raise exception 'No autorizado'; end if;
  return query
  select i.id, i.inicio, i.completo, exists (select 1 from reto_primeros pr where pr.id = i.id),
         coalesce(p.nombre, 'Visitante'), p.correo, i.experiencia, i.puntaje, i.nivel,
         r.categoria, r.item, r.acierto_primer_intento, r.intentos
  from reto_intentos i
  left join perfiles p on p.id = i.usuario_id
  join reto_respuestas r on r.intento_id = i.id
  where (p_desde is null or i.inicio >= p_desde) and (p_hasta is null or i.inicio < p_hasta + 1)
  order by i.inicio desc, r.creado_en;
end $$;

create or replace function public.admin_cambiar_rol(p_usuario uuid, p_rol text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.es_admin() then raise exception 'No autorizado'; end if;
  if p_rol not in ('alumno', 'admin') then raise exception 'Rol no válido'; end if;
  if p_usuario = auth.uid() and p_rol <> 'admin' then raise exception 'No puedes quitarte tu propio acceso de administración'; end if;
  update perfiles set rol = p_rol, actualizado_en = now() where id = p_usuario;
end $$;

-- Elimina la cuenta de un alumno y todos sus datos (derecho de supresión).
create or replace function public.admin_eliminar_usuario(p_usuario uuid)
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if not public.es_admin() then raise exception 'No autorizado'; end if;
  if p_usuario = auth.uid() then raise exception 'No puedes eliminar tu propia cuenta desde aquí'; end if;
  delete from auth.users where id = p_usuario;
end $$;

-- El alumno puede eliminar su propia cuenta desde «Mi cuenta».
create or replace function public.eliminar_mi_cuenta()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'No autorizado'; end if;
  delete from auth.users where id = auth.uid();
end $$;

-- Convierte una cuenta ya registrada en administradora. Solo se puede usar
-- desde el SQL Editor de Supabase:  select public.hacer_admin('correo@ejemplo.com');
create or replace function public.hacer_admin(p_correo text)
returns text language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update perfiles set rol = 'admin', actualizado_en = now() where lower(correo) = lower(p_correo);
  get diagnostics n = row_count;
  if n = 0 then return 'No existe ninguna cuenta con ese correo. Regístrala primero en la web.'; end if;
  return 'Listo: ' || p_correo || ' ya es administradora.';
end $$;

-- ---------------------------------------------------------------------
-- 6. Permisos de las funciones
-- ---------------------------------------------------------------------
revoke all on function public.hacer_admin(text) from public, anon, authenticated;
revoke all on function public.crear_perfil() from public, anon, authenticated;
revoke all on function public.sincronizar_correo() from public, anon, authenticated;
revoke all on function public.guardar_historial() from public, anon, authenticated;

grant execute on function public.es_admin() to anon, authenticated;
grant execute on function public.reto_guardar(jsonb) to anon, authenticated;
grant execute on function public.reto_vincular(uuid[]) to authenticated;
grant execute on function public.registrar_evento(text, text) to anon, authenticated;
grant execute on function public.eliminar_mi_cuenta() to authenticated;
grant execute on function public.admin_resumen() to authenticated;
grant execute on function public.admin_alumnos(text, text, date, date) to authenticated;
grant execute on function public.admin_reto_detalle(date, date) to authenticated;
grant execute on function public.admin_cambiar_rol(uuid, text) to authenticated;
grant execute on function public.admin_eliminar_usuario(uuid) to authenticated;
revoke all on function public.reto_vincular(uuid[]) from anon;
revoke all on function public.eliminar_mi_cuenta() from anon;
revoke all on function public.admin_resumen() from anon;
revoke all on function public.admin_alumnos(text, text, date, date) from anon;
revoke all on function public.admin_reto_detalle(date, date) from anon;
revoke all on function public.admin_cambiar_rol(uuid, text) from anon;
revoke all on function public.admin_eliminar_usuario(uuid) from anon;

-- ---------------------------------------------------------------------
-- 7. Almacenamiento de archivos (bucket público «medios»)
--    Logos, fotos y PDF de la biblioteca. Todos pueden verlos; solo la
--    administración puede subirlos, cambiarlos o borrarlos.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('medios', 'medios', true)
on conflict (id) do update set public = true;

drop policy if exists medios_leer on storage.objects;
create policy medios_leer on storage.objects for select using (bucket_id = 'medios');

drop policy if exists medios_subir on storage.objects;
create policy medios_subir on storage.objects for insert to authenticated
  with check (bucket_id = 'medios' and public.es_admin());

drop policy if exists medios_cambiar on storage.objects;
create policy medios_cambiar on storage.objects for update to authenticated
  using (bucket_id = 'medios' and public.es_admin());

drop policy if exists medios_borrar on storage.objects;
create policy medios_borrar on storage.objects for delete to authenticated
  using (bucket_id = 'medios' and public.es_admin());

-- Fin. Siguiente paso: registrar la cuenta de Diana en la web y ejecutar
--   select public.hacer_admin('correo-de-diana@ejemplo.com');
