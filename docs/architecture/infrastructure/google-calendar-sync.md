---
title: Sincronización con Google Calendar
status: planificado
scope: src/lib/google/, src/modules/sync/, src/app/api/google/
last_updated: 2026-10-20
verified_commit: n/a
---

# Sincronización con Google Calendar

El bot y la secretaria escriben en la misma agenda. Google Calendar es la verdad sobre la ocupación ([[0003-calendar-fuente-de-verdad]]); PostgreSQL guarda un espejo de las citas y todo lo demás. Este documento define cómo se mantienen de acuerdo.

---

## Responsabilidades

- Crear, mover y cancelar eventos cuando el bot o el panel cambian una cita.
- Leer los cambios que la secretaria hace a mano y reflejarlos en `appointments`.
- Calcular la disponibilidad real: horario del día menos eventos ocupados menos bloqueos.

## Fronteras

- Solo este módulo habla con Google Calendar.
- Solo `agenda` escribe en `appointments`; `sync` le entrega los cambios a través de su interfaz.

## Datos

- Tablas: `appointments` (`google_event_id`, `google_etag`) y `calendar_sync_state` ([[supabase-schema]]).
- Variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID`.
- Cada evento creado por el sistema lleva el id de la cita en sus propiedades extendidas privadas, para reencontrarlo. <!-- verify: extendedProperties.private en la API de Calendar -->

## Interfaz

- Sincronización incremental con `syncToken`. Si Google responde que el token ya no es válido (HTTP 410), se hace una sincronización completa. <!-- verify: comportamiento 410 en la documentación de eventos.list -->
- Avisos push (`events.watch`) hacia un endpoint propio, con renovación del canal antes de que venza.
- Respaldo: sondeo cada 5 minutos si el aviso push falla.

## Flujos

### Reservar desde el bot

1. Tomar un bloqueo por franja (restricción en base de datos o bloqueo asesor de Postgres).
2. Revisar de nuevo en Calendar que la franja siga libre.
3. Crear el evento con el id de la cita.
4. Insertar la cita con `google_event_id`.
5. Programar recordatorios ([[reminders]]).
6. Si el paso 3 o 4 falla, deshacer lo anterior y avisar al paciente.

### Cita hecha a mano por la secretaria

1. Formato fijo del título: `Nombre · Teléfono · Tipo`. Ejemplo ficticio: `Paciente de Prueba · 7000-0000 · Control`.
2. `sync` detecta el evento nuevo y lo interpreta.
3. Si puede vincular paciente y tipo, crea la cita y los recordatorios.
4. Si no puede, crea la cita con `patient_id` nulo y aparece en el panel como "sin vincular"; no recibe recordatorios hasta que alguien la complete.

### Cambio o cancelación hecha en Calendar

`sync` compara `google_etag` y actualiza la cita; si el evento se movió o se canceló, avisa al módulo de recordatorios para ajustar o marcar `omitido`.

## Errores y casos borde

- Conflicto: si Calendar y la base difieren, gana Calendar para la ocupación.
- Doble reserva: el bloqueo por franja más la segunda revisión en Calendar evitan que bot y secretaria agenden a la vez.
- Falla de Google: el bot pasa a modo solo consulta y se alerta a Alí.
- Token revocado: la sincronización se detiene y se alerta; ver [[runbook-rotar-token]].

## Pruebas

- Con un calendario de pruebas y eventos ficticios.
- Casos: reserva simultánea, evento sin teléfono, evento movido, evento cancelado, sync token vencido.

## Notas

- Falta confirmar con el doctor: con qué cuenta de Google está el calendario, quién es el dueño y que lo comparta con edición a la secretaria y a Alí.
- Los datos anteriores del consultorio están en papel; no está confirmado que exista un Excel. Si hay datos que importar, se planea en una fase posterior.

## Conexiones

- [[INDEX]]
- [[modules-overview]]
- [[supabase-schema]]
- [[reminders]]
- [[environments-and-accounts]]
- [[0003-calendar-fuente-de-verdad]]
