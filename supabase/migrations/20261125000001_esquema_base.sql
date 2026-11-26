-- Fase 0.5 — Esquema base.
-- Fuente: docs/architecture/infrastructure/supabase-schema.md y docs/plans/fase-0-5-auditoria.md §1.
-- Ninguna tabla guarda información clínica (ADR-0009). Fechas en UTC con timestamptz (ADR-0007).

create extension if not exists pgcrypto with schema extensions;

-- Tipos ----------------------------------------------------------------------

create type public.staff_role as enum ('doctor', 'secretaria');
create type public.appointment_status as enum ('programada', 'confirmada', 'cancelada', 'completada', 'no_asistio');
create type public.appointment_source as enum ('bot', 'calendario_manual', 'panel');
create type public.reminder_channel as enum ('whatsapp', 'email');
create type public.reminder_kind as enum ('dos_dias', 'mismo_dia');
create type public.reminder_status as enum ('pendiente', 'enviado', 'fallido', 'omitido');
create type public.handoff_status as enum ('abierto', 'en_curso', 'resuelto');

-- Utilidades -----------------------------------------------------------------

create function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Personal con acceso al panel -------------------------------------------------

create table public.staff_users (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique not null references auth.users (id) on delete cascade,
  full_name     text not null,
  phone_e164    text check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  role          public.staff_role not null,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Pacientes. El teléfono NO es único: un teléfono puede tener varios pacientes.
create table public.patients (
  id                    uuid primary key default gen_random_uuid(),
  full_name             text not null check (length(trim(full_name)) > 0),
  phone_e164            text not null check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  birth_date            date check (birth_date <= current_date),
  email                 text,
  dui_encrypted         bytea,          -- AES-256-GCM, clave fuera de la BD (src/lib/crypto)
  dui_hash              bytea unique,   -- HMAC-SHA256 del DUI, solo para detectar duplicados
  consent_at            timestamptz,
  consent_text_version  text,
  source                text not null default 'bot'
                        check (source in ('bot', 'panel', 'importacion', 'semilla')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  check ((dui_encrypted is null) = (dui_hash is null))
);
create index patients_phone_idx on public.patients (phone_e164);
create index patients_name_idx on public.patients (lower(full_name));
create trigger patients_updated_at before update on public.patients
  for each row execute function public.set_updated_at();

-- Tipos de cita: la duración vive aquí, no en el código.
create table public.appointment_types (
  id            smallint primary key,
  code          text unique not null,
  name          text not null,
  duration_min  smallint not null default 30 check (duration_min > 0),
  active        boolean not null default true
);

-- Horario semanal, en hora local de El Salvador. weekday: 0 = domingo.
create table public.availability_rules (
  id             uuid primary key default gen_random_uuid(),
  weekday        smallint not null check (weekday between 0 and 6),
  start_time     time not null,
  end_time       time not null,
  slot_step_min  smallint not null default 30 check (slot_step_min > 0),
  slot_capacity  smallint not null default 1 check (slot_capacity > 0),
  valid_from     date not null default current_date,
  valid_to       date,
  check (end_time > start_time),
  check (valid_to is null or valid_to >= valid_from)
);

-- Vacaciones, congresos, imprevistos o días extra.
create table public.availability_exceptions (
  id          uuid primary key default gen_random_uuid(),
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  kind        text not null check (kind in ('bloqueo', 'extra')),
  reason      text,
  created_by  uuid references public.staff_users (id),
  check (ends_at > starts_at)
);

-- Citas: espejo del evento de Google Calendar (ADR-0003).
create table public.appointments (
  id               uuid primary key default gen_random_uuid(),
  patient_id       uuid references public.patients (id),   -- null = evento de Calendar sin vincular
  type_id          smallint references public.appointment_types (id),
  starts_at        timestamptz not null,
  ends_at          timestamptz not null,
  status           public.appointment_status not null default 'programada',
  source           public.appointment_source not null,
  google_event_id  text unique,
  google_etag      text,
  calendar_title   text,           -- título original del evento, para la pantalla "sin vincular"
  confirmed_at     timestamptz,
  cancelled_at     timestamptz,
  cancel_reason    text,
  note             text,           -- solo operativa; nunca información clínica
  created_by       uuid references public.staff_users (id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index appointments_upcoming_idx on public.appointments (starts_at)
  where status in ('programada', 'confirmada');
create index appointments_starts_idx on public.appointments (starts_at);
create index appointments_patient_idx on public.appointments (patient_id, starts_at desc);
create index appointments_unlinked_idx on public.appointments (starts_at) where patient_id is null;
create trigger appointments_updated_at before update on public.appointments
  for each row execute function public.set_updated_at();

-- Conversaciones del bot y bandeja de la secretaria (ADR-0011, opción C).
create table public.conversations (
  id               uuid primary key default gen_random_uuid(),
  wa_phone         text unique not null,
  patient_id       uuid references public.patients (id),
  state            text not null default 'inicio',
  context          jsonb not null default '{}',
  last_inbound_at  timestamptz,      -- ventana de 24 h de WhatsApp
  needs_human      boolean not null default false,
  updated_at       timestamptz not null default now()
);

create table public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations (id),
  direction        text not null check (direction in ('in', 'out')),
  wa_message_id    text unique,      -- idempotencia del webhook
  kind             text not null check (kind in ('texto', 'boton', 'lista', 'plantilla')),
  body             text,
  sent_by          uuid references public.staff_users (id),  -- null = bot o paciente
  delivery_status  text,
  created_at       timestamptz not null default now(),
  check (sent_by is null or direction = 'out')
);
create index messages_conversation_idx on public.messages (conversation_id, created_at);

-- Casos que el bot no resolvió.
create table public.handoff_requests (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations (id),
  reason           text not null,
  status           public.handoff_status not null default 'abierto',
  assigned_to      uuid references public.staff_users (id),
  resolution_note  text,             -- operativa; nunca información clínica
  created_at       timestamptz not null default now(),
  resolved_at      timestamptz,
  check ((status = 'resuelto') = (resolved_at is not null))
);
create index handoff_open_idx on public.handoff_requests (created_at) where status <> 'resuelto';

-- Recordatorios: 2 días antes y el mismo día (ADR-0012).
create table public.reminders (
  id                   uuid primary key default gen_random_uuid(),
  appointment_id       uuid not null references public.appointments (id) on delete cascade,
  channel              public.reminder_channel not null,
  kind                 public.reminder_kind not null,
  scheduled_for        timestamptz not null,
  status               public.reminder_status not null default 'pendiente',
  provider_message_id  text,
  sent_at              timestamptz,
  error                text,
  unique (appointment_id, channel, kind)
);
create index reminders_due_idx on public.reminders (scheduled_for) where status = 'pendiente';

-- Estado de la sincronización con Google Calendar.
create table public.calendar_sync_state (
  calendar_id         text primary key,
  sync_token          text,
  channel_id          text,
  channel_expires_at  timestamptz,
  last_synced_at      timestamptz
);

-- Quién vio o cambió qué. Solo se inserta con public.log_audit() (ver migración de RLS).
create table public.audit_log (
  id         bigint generated always as identity primary key,
  actor_id   uuid,              -- auth.uid() de quien actuó
  action     text not null,
  entity     text not null,
  entity_id  text,
  detail     jsonb,
  at         timestamptz not null default now()
);
create index audit_log_entity_idx on public.audit_log (entity, entity_id, at desc);

-- Configuración del consultorio (respuestas del doctor; no son datos de pacientes) ---

insert into public.appointment_types (id, code, name, duration_min) values
  (1, 'primera_vez', 'Primera vez', 30),
  (2, 'control', 'Control', 30);

-- slot_capacity = 1 provisional: 35 espacios por semana frente a ~44 pacientes reportados.
-- Pendiente de confirmar con el doctor (decisión D6 de la auditoría de Fase 0.5).
insert into public.availability_rules (weekday, start_time, end_time, slot_step_min, slot_capacity, valid_from) values
  (1, '13:00', '17:30', 30, 1, '2026-01-01'),
  (3, '15:00', '17:30', 30, 1, '2026-01-01'),
  (4, '15:00', '17:30', 30, 1, '2026-01-01'),
  (5, '13:00', '17:30', 30, 1, '2026-01-01'),
  (6, '08:00', '11:30', 30, 1, '2026-01-01');
