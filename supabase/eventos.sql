-- =====================================================================
-- Eventos privados con cupos y pago con Stripe.
-- Solo los usuarios con sesión iniciada ven los eventos visibles.
-- Se puede ejecutar varias veces: no borra datos.
-- =====================================================================
create table if not exists public.eventos_privados (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text not null unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  titulo               text not null,
  subtitulo            text not null default '',
  detalles             text not null default '',
  resumen              text not null default '',
  contenido            text not null default '',
  acceso               text not null default '',
  aviso                text not null default '',
  fecha_tipo           text not null default 'aproximada' check (fecha_tipo in ('exacta', 'aproximada')),
  fecha                date,
  fecha_periodo        text check (fecha_periodo in ('inicio', 'mediados', 'finales')),
  fecha_mes            smallint check (fecha_mes between 1 and 12),
  fecha_anio           smallint check (fecha_anio between 2024 and 2100),
  horario              text not null default '',
  precio_centavos      integer not null default 0 check (precio_centavos >= 0),
  cupos                integer not null default 50 check (cupos between 1 and 10000),
  inscripcion_abierta  boolean not null default true,
  visible              boolean not null default true,
  creado_en            timestamptz not null default now(),
  actualizado_en       timestamptz not null default now()
);
alter table public.eventos_privados enable row level security;

-- Estados: pendiente (pagando, aparta el cupo un tiempo), pagada, preinscrita (sin Stripe activo),
-- espera (lista de espera), cancelada, reembolsada.
create table if not exists public.inscripciones (
  id                 uuid primary key default gen_random_uuid(),
  evento_id          uuid not null references public.eventos_privados (id) on delete cascade,
  usuario_id         uuid references auth.users (id) on delete set null,
  nombre             text not null default '',
  correo             text not null default '',
  estado             text not null,
  expira_en          timestamptz,
  monto_centavos     integer,
  stripe_session_id  text unique,
  stripe_pago_id     text,
  creado_en          timestamptz not null default now(),
  pagado_en          timestamptz,
  actualizado_en     timestamptz not null default now()
);
-- Columnas y estados añadidos después (pago por enlace con comprobante en verificación).
alter table public.inscripciones add column if not exists comprobante text;
alter table public.inscripciones add column if not exists telefono text;
alter table public.inscripciones add column if not exists correo_pago text;
alter table public.eventos_privados add column if not exists enlace_pago text not null default '';
-- Último día (eventos de varios días) y hora de inicio exacta (se muestra en la hora local de cada alumno).
alter table public.eventos_privados add column if not exists fecha_fin date;
alter table public.eventos_privados add column if not exists hora_inicio timestamptz;
alter table public.inscripciones drop constraint if exists inscripciones_estado_check;
alter table public.inscripciones add constraint inscripciones_estado_check
  check (estado in ('pendiente', 'verificacion', 'pagada', 'preinscrita', 'espera', 'cancelada', 'reembolsada'));
create index if not exists inscripciones_evento_idx on public.inscripciones (evento_id, estado);
-- Una sola inscripción activa por persona y evento.
drop index if exists public.inscripciones_activa_idx;
create unique index inscripciones_activa_idx on public.inscripciones (evento_id, usuario_id)
  where estado in ('pendiente', 'verificacion', 'pagada', 'preinscrita', 'espera');
alter table public.inscripciones enable row level security;

drop policy if exists eventos_leer on public.eventos_privados;
create policy eventos_leer on public.eventos_privados for select to authenticated using (visible or public.es_admin());
drop policy if exists eventos_admin on public.eventos_privados;
create policy eventos_admin on public.eventos_privados for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- Cada persona ve solo sus inscripciones; la administración, todas. Las escribe el servidor.
drop policy if exists inscripciones_leer on public.inscripciones;
create policy inscripciones_leer on public.inscripciones for select to authenticated
  using (usuario_id = auth.uid() or public.es_admin());

grant select, insert, update, delete on public.eventos_privados to authenticated;
grant select on public.inscripciones to authenticated;
revoke all on public.eventos_privados, public.inscripciones from anon;
grant all on public.eventos_privados, public.inscripciones to service_role;

-- ¿Quedan cupos? Responde sí o no, sin revelar cuántos.
create or replace function public.evento_hay_cupo(p_evento uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select e.inscripcion_abierta and (
    select count(*) from public.inscripciones i
    where i.evento_id = e.id and (i.estado in ('pagada', 'verificacion') or (i.estado = 'pendiente' and i.expira_en > now()))
  ) < e.cupos
  from public.eventos_privados e where e.id = p_evento and e.visible;
$$;

-- Aparta un cupo mientras la persona paga. Bloquea el evento para que dos personas
-- no se queden a la vez con el último cupo. Solo la usa el servidor.
create or replace function public.reservar_cupo(p_evento uuid, p_usuario uuid, p_nombre text, p_correo text, p_minutos integer default 30)
returns table (resultado text, inscripcion uuid)
language plpgsql security definer set search_path = public as $$
declare
  v_evento  public.eventos_privados%rowtype;
  v_usados  integer;
  v_id      uuid;
begin
  select * into v_evento from public.eventos_privados where id = p_evento for update;
  if not found or not v_evento.visible then return query select 'no_existe'::text, null::uuid; return; end if;
  if exists (select 1 from public.inscripciones where evento_id = p_evento and usuario_id = p_usuario and estado in ('pagada', 'verificacion')) then
    return query select 'ya_inscrito'::text, null::uuid; return;
  end if;
  if not v_evento.inscripcion_abierta then return query select 'cerrado'::text, null::uuid; return; end if;
  -- Un intento de pago anterior sin terminar, la preinscripción o la lista de espera se reemplazan.
  update public.inscripciones set estado = 'cancelada', actualizado_en = now()
  where evento_id = p_evento and usuario_id = p_usuario and estado in ('pendiente', 'preinscrita', 'espera');
  select count(*) into v_usados from public.inscripciones
  where evento_id = p_evento and (estado in ('pagada', 'verificacion') or (estado = 'pendiente' and expira_en > now()));
  if v_usados >= v_evento.cupos then return query select 'agotado'::text, null::uuid; return; end if;
  insert into public.inscripciones (evento_id, usuario_id, nombre, correo, estado, expira_en, monto_centavos)
  values (p_evento, p_usuario, left(p_nombre, 120), lower(left(p_correo, 200)), 'pendiente', now() + make_interval(mins => p_minutos), v_evento.precio_centavos)
  returning id into v_id;
  return query select 'ok'::text, v_id;
end $$;

-- Marca una inscripción como pagada. Devuelve true solo la primera vez (para enviar los correos una vez).
create or replace function public.confirmar_pago(p_inscripcion uuid, p_session text, p_pago text, p_monto integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_ok boolean;
begin
  update public.inscripciones
  set estado = 'pagada', pagado_en = now(), stripe_session_id = coalesce(p_session, stripe_session_id),
      stripe_pago_id = coalesce(p_pago, stripe_pago_id), monto_centavos = coalesce(p_monto, monto_centavos), actualizado_en = now()
  where id = p_inscripcion and estado <> 'pagada'
  returning true into v_ok;
  return coalesce(v_ok, false);
end $$;

revoke all on function public.reservar_cupo(uuid, uuid, text, text, integer) from public, anon, authenticated;
revoke all on function public.confirmar_pago(uuid, text, text, integer) from public, anon, authenticated;
grant execute on function public.reservar_cupo(uuid, uuid, text, text, integer) to service_role;
grant execute on function public.confirmar_pago(uuid, text, text, integer) to service_role;
grant execute on function public.evento_hay_cupo(uuid) to authenticated;
revoke all on function public.evento_hay_cupo(uuid) from public, anon;

-- ---------------------------------------------------------------------
-- Primer evento: «Antes de Comprar Ese Call o Ese Put». Si ya existe, no se toca.
-- ---------------------------------------------------------------------
insert into public.eventos_privados (slug, titulo, subtitulo, detalles, resumen, contenido, acceso, aviso,
  fecha_tipo, fecha_periodo, fecha_mes, fecha_anio, horario, precio_centavos, cupos, inscripcion_abierta, visible)
values (
  'call-o-put',
  'Antes de Comprar Ese Call o Ese Put',
  'Taller práctico en vivo para escoger mejor tu contrato de opciones.',
  'Nivel intermedio · 2 clases en vivo con Diana Gamboa · Solo 50 cupos',
  'Taller práctico en vivo, de nivel intermedio, para aprender a comparar contratos de opciones y justificar por qué escoges uno y no otro.',
  $txt$## Por qué este taller

Muchos de ustedes me han pedido que hable de opciones. Este taller es para quienes ya operan opciones y quieren escoger mejor su contrato.

Saber hacia dónde puede ir el precio es solo una parte. También importa el contrato que escoges: el strike, el vencimiento, cuánto pagas por entrar y salir, y cómo reacciona ese contrato al movimiento, al tiempo y a la volatilidad.

Dos contratos sobre la misma lectura pueden comportarse de forma muy distinta. En este taller vas a aprender a compararlos y a justificar por qué escoges uno y no otro.

## Para quién es

Este taller no es desde cero. Es para ti si:

- Ya sabes comprar y vender opciones en tu plataforma.
- Conoces qué es un call, un put, el strike y el vencimiento.
- Quieres mejorar la forma en que escoges tus contratos.
- Operas, o quieres operar, opciones en scalping, intradía o swing.

No es para ti si nunca has operado opciones o si buscas señales para copiar.

## Lo que vas a lograr

Al terminar, vas a poder comparar contratos y justificar tu selección según tres cosas: el movimiento que esperas, el tiempo previsto de tu operación y el riesgo que estás dispuesto a asumir.

## Día 1 · Evaluar el contrato antes de entrar

- **El strike:** qué cambia entre un contrato dentro, en o fuera del dinero, y cómo se relaciona con tu lectura de la gráfica.
- **El vencimiento:** cuánto tiempo le das a tu lectura para cumplirse.
- **El spread y la liquidez:** bid y ask, volumen y open interest. Cuánto te cuesta entrar y salir de un contrato.
- **La sensibilidad del contrato:**
  - **Al movimiento del activo:** el delta, una estimación de cuánto podría cambiar el precio de la opción cuando se mueve el activo.
  - **Al tiempo:** el theta, una estimación de cuánto valor podría perder la opción con cada día que pasa.
  - **A la volatilidad:** por qué el precio de una opción puede cambiar cuando cambia la volatilidad implícita, aunque el activo no se mueva mucho.

## Día 2 · Aplicar los criterios según tu operación

Con casos prácticos, comparamos qué contrato tiene más sentido según el tiempo que esperas estar en la operación:

- **Scalping:** movimientos de minutos.
- **Intradía:** movimientos dentro de una misma sesión.
- **Swing:** movimientos de varios días.

No es un curso de tres estrategias completas. Es un taller para aprender a escoger el contrato que encaja con la operación que ya tienes en mente.

## Cómo son las clases

- Dos clases en vivo, conmigo. La plataforma se confirmará antes del taller.
- Trabajamos con capturas de cadenas de opciones y casos preparados de sesiones anteriores del mercado. Las clases no dependen de que el mercado esté abierto: no habrá cotizaciones en tiempo real ni operaciones reales durante el taller.
- Ejercicios de comparación: te voy a pedir que escojas un contrato y expliques por qué.
- Espacio para tus preguntas en cada clase.
- Grabación de las dos clases. El tiempo de acceso se confirmará antes del taller.
- Hoja de chequeo para revisar antes de cada compra.

## Quién te enseña

Soy Diana Gamboa, analista del mercado de valores y educadora. En mi canal Diana Gamboa Momentum enseño a leer el mercado con seguridad y criterio propio. Opero opciones, y en este taller te comparto lo que reviso antes de escoger un contrato.

> Yo no adivino el mercado. Lo leo.

## Preguntas frecuentes

### ¿Necesito saber opciones para tomar este taller?
Sí. Es de nivel intermedio. Necesitas saber comprar y vender opciones en tu plataforma, y conocer qué es un call, un put, el strike y el vencimiento. No vamos a explicar esos temas desde cero.

### ¿Vamos a operar en vivo durante las clases?
No. Trabajamos con capturas de cadenas de opciones y casos preparados de sesiones anteriores. No habrá cotizaciones en tiempo real ni operaciones reales.

### ¿Me vas a dar señales o entradas?
No. Te enseño a evaluar y comparar contratos para que tomes tus propias decisiones con criterio.

### ¿Y si no puedo estar en vivo?
Vas a recibir la grabación de las dos clases en tu portal. El tiempo de acceso se confirmará antes del taller.

### ¿Dónde serán las clases?
La plataforma se confirmará antes del taller. Después de inscribirte, el acceso aparece en tu portal y te llega por correo.

### ¿Hay reembolso?
Sí. Puedes pedir el reembolso total hasta 48 horas antes del inicio de la primera clase. Si cambiamos la fecha del taller y no puedes asistir, también te devolvemos el valor completo. Consulta la [política de reembolsos](/reembolsos).

### ¿Esto es asesoría financiera?
No. Es un taller educativo. No es una recomendación de inversión.$txt$,
  $txt$Gracias por inscribirte. Antes del taller publicaremos aquí el enlace de las clases en vivo y te lo enviaremos por correo.

Después de cada clase encontrarás aquí la grabación y la hoja de chequeo.$txt$,
  $txt$Este taller es educativo y no es una recomendación de inversión ni asesoría financiera. Operar opciones tiene alto riesgo y puedes perder el 100% de lo que pagas por un contrato. Los casos que veremos son de sesiones anteriores y se usan solo con fines educativos. Los resultados pasados no garantizan resultados futuros. Cada persona es responsable de sus propias decisiones.$txt$,
  'aproximada', 'finales', 11, 2026,
  'Día 1 y Día 2: fechas por confirmar · Horario por confirmar (hora del Pacífico / hora del Este) · Duración por confirmar',
  9900, 50, true, true
)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- Pago por enlace de Stripe (provisional): la persona avisa que pagó, puede subir
-- su comprobante y la compra queda «en verificación» (aparta el cupo) hasta que
-- la administración la aprueba.
-- ---------------------------------------------------------------------
drop function if exists public.registrar_verificacion(uuid, uuid, text, text, text);
create or replace function public.registrar_verificacion(p_evento uuid, p_usuario uuid, p_nombre text, p_correo text, p_comprobante text,
  p_telefono text default null, p_correo_pago text default null)
returns table (resultado text, inscripcion uuid)
language plpgsql security definer set search_path = public as $$
declare
  v_evento  public.eventos_privados%rowtype;
  v_usados  integer;
  v_id      uuid;
begin
  select * into v_evento from public.eventos_privados where id = p_evento for update;
  if not found or not v_evento.visible then return query select 'no_existe'::text, null::uuid; return; end if;
  if exists (select 1 from public.inscripciones where evento_id = p_evento and usuario_id = p_usuario and estado in ('pagada', 'verificacion')) then
    return query select 'ya_inscrito'::text, null::uuid; return;
  end if;
  update public.inscripciones set estado = 'cancelada', actualizado_en = now()
  where evento_id = p_evento and usuario_id = p_usuario and estado in ('pendiente', 'preinscrita', 'espera');
  select count(*) into v_usados from public.inscripciones
  where evento_id = p_evento and (estado in ('pagada', 'verificacion') or (estado = 'pendiente' and expira_en > now()));
  if v_usados >= v_evento.cupos then return query select 'agotado'::text, null::uuid; return; end if;
  insert into public.inscripciones (evento_id, usuario_id, nombre, correo, estado, monto_centavos, comprobante, telefono, correo_pago)
  values (p_evento, p_usuario, left(p_nombre, 120), lower(left(p_correo, 200)), 'verificacion', v_evento.precio_centavos, nullif(p_comprobante, ''),
          nullif(left(p_telefono, 30), ''), nullif(lower(left(p_correo_pago, 200)), ''))
  returning id into v_id;
  return query select 'ok'::text, v_id;
end $$;
revoke all on function public.registrar_verificacion(uuid, uuid, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.registrar_verificacion(uuid, uuid, text, text, text, text, text) to service_role;

-- Comprobantes: espacio privado. Solo el servidor los guarda y la administración los ve con enlaces temporales.
insert into storage.buckets (id, name, public) values ('comprobantes', 'comprobantes', false)
on conflict (id) do update set public = false;

-- Enlace de pago provisional del primer evento (solo si aún no tiene uno).
update public.eventos_privados set enlace_pago = 'https://buy.stripe.com/eVqaEXc9D8fA83TenIejK00'
where slug = 'call-o-put' and enlace_pago = '';

-- Valor del taller: US$99.00 (igual al enlace de pago de Stripe).
update public.eventos_privados set precio_centavos = 9900, visible = true
where slug = 'call-o-put' and precio_centavos = 9899;

-- Fechas del taller: sábado 28 y domingo 29 de noviembre de 2026, 2:00 p. m. hora de Nueva York (Este, EST = UTC-5).
-- Solo si aún tiene la fecha aproximada original (no pisa cambios hechos desde la administración).
update public.eventos_privados set
  fecha_tipo = 'exacta', fecha = '2026-11-28', fecha_fin = '2026-11-29',
  fecha_periodo = null, fecha_mes = null, fecha_anio = null,
  hora_inicio = '2026-11-28 14:00:00-05',
  horario = '2:00 p. m. hora de Nueva York (hora del Este) · Duración por confirmar'
where slug = 'call-o-put' and fecha_tipo = 'aproximada';
