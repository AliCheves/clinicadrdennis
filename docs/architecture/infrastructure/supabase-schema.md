---
title: Esquema de base de datos
status: planificado
scope: supabase/migrations/ (aún no existe)
last_updated: 2026-10-20
verified_commit: n/a
---

# Esquema de base de datos

PostgreSQL gestionado en Supabase. Doce tablas: personal del panel, pacientes, tipos de cita, reglas y excepciones de disponibilidad, citas, conversaciones y mensajes, casos pendientes, recordatorios, estado de sincronización con Google Calendar y auditoría. La lista "pacientes de la semana" del doctor es una consulta sobre `appointments`.

Este archivo parte del esquema de la propuesta de proyecto del 2026-10-10. Cuando exista la primera migración, este documento pasa a `en-curso` y la migración manda: si difieren, se corrige este archivo.

---

## Responsabilidades

- Guardar la verdad sobre pacientes, citas, conversaciones y recordatorios.
- Guardar el espejo de los eventos de Google Calendar, que es la verdad sobre la ocupación ([[0003-calendar-fuente-de-verdad]]).
- Aplicar RLS como segunda capa de acceso ([[0010-acceso-a-datos-solo-por-servidor]]).

## Fronteras

- Ninguna tabla guarda información clínica ([[0009-datos-sensibles]]). `appointments.note` es solo operativa.
- El DUI solo existe cifrado (`dui_encrypted`) y como HMAC (`dui_hash`).
- Las migraciones son solo hacia adelante ([[agents]] § Las migraciones son un despliegue).

## Datos

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE staff_role AS ENUM ('doctor', 'secretaria');
CREATE TYPE appointment_status AS ENUM ('programada', 'confirmada', 'cancelada', 'completada', 'no_asistio');
CREATE TYPE appointment_source AS ENUM ('bot', 'calendario_manual', 'panel');
CREATE TYPE reminder_channel AS ENUM ('whatsapp', 'email');
CREATE TYPE reminder_kind AS ENUM ('dos_dias', 'mismo_dia');
CREATE TYPE reminder_status AS ENUM ('pendiente', 'enviado', 'fallido', 'omitido');
CREATE TYPE handoff_status AS ENUM ('abierto', 'en_curso', 'resuelto');

-- Personal con acceso al panel
CREATE TABLE staff_users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  uuid UNIQUE NOT NULL,            -- id en Supabase Auth
  full_name     text NOT NULL,
  phone_e164    text,                            -- para avisos de WhatsApp a la secretaria
  role          staff_role NOT NULL,
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Pacientes (el telefono NO es unico: un telefono puede tener varios pacientes)
CREATE TABLE patients (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name             text NOT NULL,
  phone_e164            text NOT NULL,           -- +503XXXXXXXX
  birth_date            date,
  email                 text,
  dui_encrypted         bytea,                   -- AES-256-GCM, clave fuera de la BD
  dui_hash              bytea UNIQUE,            -- HMAC del DUI, solo para detectar duplicados
  consent_at            timestamptz,
  consent_text_version  text,
  source                text NOT NULL DEFAULT 'bot',  -- bot | importacion | panel
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX patients_phone_idx ON patients (phone_e164);

-- Tipos de cita: la duracion vive aqui, no en el codigo
CREATE TABLE appointment_types (
  id            smallint PRIMARY KEY,
  code          text UNIQUE NOT NULL,            -- primera_vez | control
  name          text NOT NULL,
  duration_min  smallint NOT NULL DEFAULT 30,
  active        boolean NOT NULL DEFAULT true
);

-- Horario semanal de atencion
CREATE TABLE availability_rules (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday        smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),  -- 0 = domingo
  start_time     time NOT NULL,
  end_time       time NOT NULL,
  slot_step_min  smallint NOT NULL DEFAULT 30,
  slot_capacity  smallint NOT NULL DEFAULT 1,    -- >1 si el doctor sobrecupa
  valid_from     date NOT NULL DEFAULT current_date,
  valid_to       date,
  CHECK (end_time > start_time)
);

-- Vacaciones, congresos, imprevistos o dias extra
CREATE TABLE availability_exceptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  starts_at   timestamptz NOT NULL,
  ends_at     timestamptz NOT NULL,
  kind        text NOT NULL CHECK (kind IN ('bloqueo', 'extra')),
  reason      text,
  created_by  uuid REFERENCES staff_users(id),
  CHECK (ends_at > starts_at)
);

-- Citas: espejo del evento de Google Calendar
CREATE TABLE appointments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    uuid REFERENCES patients(id),    -- NULL = evento del calendario sin vincular
  type_id       smallint REFERENCES appointment_types(id),
  starts_at     timestamptz NOT NULL,
  ends_at       timestamptz NOT NULL,
  status        appointment_status NOT NULL DEFAULT 'programada',
  source        appointment_source NOT NULL,
  google_event_id  text UNIQUE,
  google_etag      text,
  confirmed_at  timestamptz,
  cancelled_at  timestamptz,
  cancel_reason text,
  note          text,                            -- nunca informacion clinica
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
CREATE INDEX appointments_upcoming_idx ON appointments (starts_at)
  WHERE status IN ('programada', 'confirmada');
CREATE INDEX appointments_patient_idx ON appointments (patient_id, starts_at DESC);

-- Conversaciones del bot
CREATE TABLE conversations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_phone         text UNIQUE NOT NULL,
  patient_id       uuid REFERENCES patients(id),
  state            text NOT NULL DEFAULT 'inicio',
  context          jsonb NOT NULL DEFAULT '{}',
  last_inbound_at  timestamptz,                  -- ventana de 24 h de WhatsApp
  needs_human      boolean NOT NULL DEFAULT false,
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE messages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  uuid NOT NULL REFERENCES conversations(id),
  direction        text NOT NULL CHECK (direction IN ('in', 'out')),
  wa_message_id    text UNIQUE,                  -- idempotencia del webhook
  kind             text NOT NULL,                -- texto | boton | lista | plantilla
  body             text,
  delivery_status  text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Casos que el bot no resolvio: alimentan el panel de la secretaria
CREATE TABLE handoff_requests (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  uuid NOT NULL REFERENCES conversations(id),
  reason           text NOT NULL,
  status           handoff_status NOT NULL DEFAULT 'abierto',
  assigned_to      uuid REFERENCES staff_users(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  resolved_at      timestamptz
);

-- Recordatorios: 2 dias antes y el mismo dia, por WhatsApp y correo
CREATE TABLE reminders (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id       uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  channel              reminder_channel NOT NULL,
  kind                 reminder_kind NOT NULL,
  scheduled_for        timestamptz NOT NULL,
  status               reminder_status NOT NULL DEFAULT 'pendiente',
  provider_message_id  text,
  sent_at              timestamptz,
  error                text,
  UNIQUE (appointment_id, channel, kind)
);
CREATE INDEX reminders_due_idx ON reminders (scheduled_for) WHERE status = 'pendiente';

-- Estado de la sincronizacion con Google Calendar
CREATE TABLE calendar_sync_state (
  calendar_id        text PRIMARY KEY,
  sync_token         text,
  channel_id         text,
  channel_expires_at timestamptz,
  last_synced_at     timestamptz
);

-- Quien vio o cambio que (especialmente datos del paciente)
CREATE TABLE audit_log (
  id         bigserial PRIMARY KEY,
  actor_id   uuid,
  action     text NOT NULL,
  entity     text NOT NULL,
  entity_id  text,
  detail     jsonb,
  at         timestamptz NOT NULL DEFAULT now()
);
```

### Consulta base de "pacientes de la semana"

Las fechas de inicio y fin de la semana se calculan en hora de El Salvador y se pasan en UTC.

```sql
SELECT a.starts_at, p.full_name, t.name AS tipo, a.status
FROM appointments a
JOIN appointment_types t ON t.id = a.type_id
LEFT JOIN patients p ON p.id = a.patient_id
WHERE a.starts_at >= :inicio_semana AND a.starts_at < :fin_semana
  AND a.status <> 'cancelada'
ORDER BY a.starts_at;
```

### Semillas iniciales propuestas

Salen de las respuestas del doctor ([[respuestas-doctor-cuestionario]]). `weekday` usa 0 = domingo. El martes no hay consulta.

| Tabla | Filas |
|---|---|
| `appointment_types` | `1 primera_vez 30 min`, `2 control 30 min` |
| `availability_rules` | lunes (1) 13:00–17:30; miércoles (3) 15:00–17:30; jueves (4) 15:00–17:30; viernes (5) 13:00–17:30; sábado (6) 08:00–11:30; todas con `slot_step_min = 30` |

Pendiente: `slot_capacity` y la duración real de los controles, porque 35 espacios por semana no alcanzan para los 44 pacientes que el doctor reporta ([[respuestas-doctor-cuestionario]]).

## Plan de RLS

- RLS activo en todas las tablas.
- Funciones auxiliares `SECURITY DEFINER`: `is_doctor()` e `is_secretary()`, leyendo `staff_users` (mismo patrón que `is_admin()` en el autódromo, para evitar recursión).
- `staff_users`: lectura propia; el doctor administra.
- `patients`, `appointments`, `conversations`, `messages`, `handoff_requests`, `reminders`: lectura y escritura para doctor y secretaria. El navegador no consulta estas tablas directamente: pasa por la capa de servidor ([[0010-acceso-a-datos-solo-por-servidor]]).
- `audit_log`: solo inserción desde el servidor; lectura solo para el doctor.
- El webhook y el cron usan la clave de servicio, de forma acotada y documentada.

## Errores y casos borde

- Dos pacientes distintos con el mismo teléfono: se permite; el bot pregunta para quién es la cita.
- Evento de Calendar sin paciente vinculado: `patient_id` nulo y aparece en el panel.
- Mismo mensaje de WhatsApp entregado dos veces: la restricción `UNIQUE` de `messages.wa_message_id` lo descarta.

## Pruebas

Por definir en la auditoría de Fase 0.5: pruebas de RLS contra Supabase local con usuarios ficticios de cada rol.

## Notas

- La retención de `messages` propuesta es de 90 días; falta validación legal ([[security-and-privacy]]).
- Respecto a la propuesta de proyecto del 2026-10-10 se añadieron `patients.birth_date` y `staff_users.phone_e164`, porque el doctor pidió fecha de nacimiento y aviso por WhatsApp a la secretaria ([[respuestas-doctor-cuestionario]]).

## Conexiones

- [[INDEX]]
- [[modules-overview]]
- [[security-and-privacy]]
- [[google-calendar-sync]]
- [[reminders]]
- [[0003-calendar-fuente-de-verdad]]
- [[0007-zona-horaria-y-fechas]]
- [[0009-datos-sensibles]]
- [[0010-acceso-a-datos-solo-por-servidor]]
- [[respuestas-doctor-cuestionario]]
