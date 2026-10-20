---
title: Recordatorios
status: planificado
scope: src/modules/reminders/, src/app/api/cron/
last_updated: 2026-10-20
verified_commit: n/a
---

# Recordatorios

El doctor pidió recordar la cita dos días antes y el mismo día de la consulta, por WhatsApp y por correo electrónico cuando el paciente tiene ([[respuestas-doctor-cuestionario]]). Cada recordatorio se envía una sola vez ([[0012-recordatorios-idempotentes]]).

---

## Responsabilidades

- Crear los recordatorios de una cita al agendarla o al vincularla.
- Enviar los que ya vencieron, por canal, con el texto de la plantilla.
- Cancelar u omitir los de citas canceladas o movidas.

## Fronteras

- No decide si una cita existe ni si está libre; eso es de `agenda`.
- No envía por su cuenta: usa `src/lib/whatsapp/` y `src/lib/email/`.

## Datos

- Tabla `reminders` con `UNIQUE (appointment_id, channel, kind)` ([[supabase-schema]]).
- Variables: `CRON_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.

## Interfaz

- Un endpoint interno de cron, protegido con `CRON_SECRET`, que cada pocos minutos toma los recordatorios `pendiente` con `scheduled_for` vencido. Quién lo invoca depende de [[0002-runtime-del-backend]].

## Flujos

1. Al crear o vincular la cita: calcular `scheduled_for` para `dos_dias` y `mismo_dia`, uno por canal disponible (el correo solo si hay `email`).
2. El cron toma los vencidos y los marca de forma atómica antes de enviar, para que dos ejecuciones no envíen el mismo.
3. Enviar. Guardar `provider_message_id` y `sent_at`, o `error` y estado `fallido`.
4. Si el paciente pulsa Confirmar o Cancelar, el módulo `conversation` actualiza la cita a través de `agenda`.
5. Si la cita se cancela o se mueve, los pendientes pasan a `omitido` y se crean los nuevos.

## Errores y casos borde

- Falla de WhatsApp: ese canal queda `fallido`; el de correo continúa.
- Cita agendada con menos de dos días de anticipación: no se crea el de `dos_dias`.
- Fuera de la ventana de 24 h solo se usan plantillas aprobadas ([[whatsapp-integration]]).
- Hora de envío del recordatorio del mismo día, sobre todo el sábado (atiende desde las 8:00): pendiente de definir con el doctor. Un envío a las 7:00 es muy temprano.

## Pruebas

- Con citas ficticias y un reloj simulado: vencimiento, doble ejecución del cron, cita cancelada, paciente sin correo.

## Notas

- Todo `scheduled_for` se guarda en UTC y se calcula en hora de El Salvador ([[0007-zona-horaria-y-fechas]]).

## Conexiones

- [[INDEX]]
- [[modules-overview]]
- [[supabase-schema]]
- [[whatsapp-integration]]
- [[google-calendar-sync]]
- [[0002-runtime-del-backend]]
- [[0007-zona-horaria-y-fechas]]
- [[0012-recordatorios-idempotentes]]
