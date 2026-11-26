-- =====================================================================
-- Rol «moderador»: entra a las clases como coanfitrión en Zoom (sin pagar el evento
-- y sin acceso a la administración). Se puede ejecutar varias veces.
-- =====================================================================
alter table public.perfiles drop constraint if exists perfiles_rol_check;
alter table public.perfiles add constraint perfiles_rol_check check (rol in ('alumno', 'admin', 'moderador'));

create or replace function public.admin_cambiar_rol(p_usuario uuid, p_rol text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.es_admin() then raise exception 'No autorizado'; end if;
  if p_rol not in ('alumno', 'admin', 'moderador') then raise exception 'Rol no válido'; end if;
  if p_usuario = auth.uid() and p_rol <> 'admin' then raise exception 'No puedes quitarte tu propio acceso de administración'; end if;
  update perfiles set rol = p_rol, actualizado_en = now() where id = p_usuario;
end $$;

-- Moderador de las clases (debe tener su cuenta creada en la web con este correo).
update public.perfiles set rol = 'moderador', actualizado_en = now()
where lower(correo) = 'alberto.heredia1302@gmail.com';
