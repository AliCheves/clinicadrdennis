-- Fase 0.5 — Acceso por rol (RLS) y protección del DUI.
-- Diseño: docs/plans/fase-0-5-auditoria.md §2. RLS es la segunda barrera; la primera es la
-- capa de servidor con requireRole() (ADR-0010).

-- Funciones de rol ---------------------------------------------------------------
-- SECURITY DEFINER para leer staff_users sin recursión de políticas.

create function public.current_staff_role() returns public.staff_role
language sql stable security definer
set search_path = ''
as $$
  select role from public.staff_users
  where auth_user_id = auth.uid() and active
$$;

create function public.is_staff() returns boolean
language sql stable security definer
set search_path = ''
as $$ select public.current_staff_role() is not null $$;

create function public.is_doctor() returns boolean
language sql stable security definer
set search_path = ''
as $$ select public.current_staff_role() = 'doctor' $$;

create function public.is_secretary() returns boolean
language sql stable security definer
set search_path = ''
as $$ select public.current_staff_role() = 'secretaria' $$;

revoke all on function public.current_staff_role() from public, anon;
revoke all on function public.is_staff() from public, anon;
revoke all on function public.is_doctor() from public, anon;
revoke all on function public.is_secretary() from public, anon;
grant execute on function public.current_staff_role(), public.is_staff(), public.is_doctor(), public.is_secretary()
  to authenticated;

-- Sin acceso anónimo a ninguna tabla --------------------------------------------

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;

-- RLS en todas las tablas ---------------------------------------------------------

alter table public.staff_users enable row level security;
alter table public.patients enable row level security;
alter table public.appointment_types enable row level security;
alter table public.availability_rules enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.appointments enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.handoff_requests enable row level security;
alter table public.reminders enable row level security;
alter table public.calendar_sync_state enable row level security;
alter table public.audit_log enable row level security;

-- staff_users: todo el personal lee (para asignar casos); solo el doctor crea y edita.
create policy staff_select on public.staff_users for select to authenticated using (public.is_staff());
create policy staff_insert on public.staff_users for insert to authenticated with check (public.is_doctor());
create policy staff_update on public.staff_users for update to authenticated
  using (public.is_doctor()) with check (public.is_doctor());

-- patients: doctor y secretaria leen, crean y editan. Nadie borra.
create policy patients_select on public.patients for select to authenticated using (public.is_staff());
create policy patients_insert on public.patients for insert to authenticated with check (public.is_staff());
create policy patients_update on public.patients for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- El DUI cifrado no se puede leer con SELECT por nadie del lado del cliente: solo con
-- public.doctor_get_dui(), que deja registro de auditoría. Se revoca el SELECT de tabla y se
-- concede por columna todo lo demás.
revoke select on public.patients from authenticated;
grant select (id, full_name, phone_e164, birth_date, email, dui_hash, consent_at, consent_text_version,
              source, created_at, updated_at)
  on public.patients to authenticated;
revoke delete on public.patients from authenticated;

-- Configuración de agenda: el personal lee; el doctor edita.
create policy types_select on public.appointment_types for select to authenticated using (public.is_staff());
create policy types_write on public.appointment_types for all to authenticated
  using (public.is_doctor()) with check (public.is_doctor());
create policy rules_select on public.availability_rules for select to authenticated using (public.is_staff());
create policy rules_write on public.availability_rules for all to authenticated
  using (public.is_doctor()) with check (public.is_doctor());
create policy exceptions_select on public.availability_exceptions for select to authenticated using (public.is_staff());
create policy exceptions_write on public.availability_exceptions for all to authenticated
  using (public.is_doctor()) with check (public.is_doctor());

-- appointments: el personal lee, crea y edita. No se borra: se cancela.
create policy appointments_select on public.appointments for select to authenticated using (public.is_staff());
create policy appointments_insert on public.appointments for insert to authenticated with check (public.is_staff());
create policy appointments_update on public.appointments for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
revoke delete on public.appointments from authenticated;

-- Conversaciones, mensajes y casos: el personal lee, crea y edita.
create policy conversations_select on public.conversations for select to authenticated using (public.is_staff());
create policy conversations_insert on public.conversations for insert to authenticated with check (public.is_staff());
create policy conversations_update on public.conversations for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy messages_select on public.messages for select to authenticated using (public.is_staff());
create policy messages_insert on public.messages for insert to authenticated with check (public.is_staff());
create policy handoff_select on public.handoff_requests for select to authenticated using (public.is_staff());
create policy handoff_insert on public.handoff_requests for insert to authenticated with check (public.is_staff());
create policy handoff_update on public.handoff_requests for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
revoke delete on public.conversations, public.messages, public.handoff_requests from authenticated;
revoke update on public.messages from authenticated;

-- reminders: el personal solo lee; escribe el servidor con la clave de servicio.
create policy reminders_select on public.reminders for select to authenticated using (public.is_staff());
revoke insert, update, delete on public.reminders from authenticated;

-- calendar_sync_state: sin acceso para usuarios; solo la clave de servicio.
revoke all on public.calendar_sync_state from authenticated;

-- audit_log: solo el doctor lee. Nadie inserta, edita ni borra directamente.
create policy audit_select on public.audit_log for select to authenticated using (public.is_doctor());
revoke insert, update, delete, truncate on public.audit_log from authenticated;

-- Auditoría ----------------------------------------------------------------------

-- Registra una acción del usuario actual. actor_id siempre es auth.uid(): no se puede suplantar.
create function public.log_audit(p_action text, p_entity text, p_entity_id text, p_detail jsonb default null)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if not public.is_staff() then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  insert into public.audit_log (actor_id, action, entity, entity_id, detail)
  values (auth.uid(), p_action, p_entity, p_entity_id, p_detail);
end;
$$;
revoke all on function public.log_audit(text, text, text, jsonb) from public, anon;
grant execute on function public.log_audit(text, text, text, jsonb) to authenticated;

-- Devuelve el DUI cifrado de un paciente solo al doctor, y deja la auditoría en la misma
-- transacción. El descifrado ocurre en el servidor con PII_ENCRYPTION_KEY, que no está en la BD.
create function public.doctor_get_dui(p_patient_id uuid) returns bytea
language plpgsql security definer
set search_path = ''
as $$
declare
  v_dui bytea;
begin
  if not public.is_doctor() then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  select dui_encrypted into v_dui from public.patients where id = p_patient_id;
  insert into public.audit_log (actor_id, action, entity, entity_id, detail)
  values (auth.uid(), 'dui_revelado', 'patients', p_patient_id::text, null);
  return v_dui;
end;
$$;
revoke all on function public.doctor_get_dui(uuid) from public, anon;
grant execute on function public.doctor_get_dui(uuid) to authenticated;
