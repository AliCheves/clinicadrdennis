---
title: Fase 0.5 — Esquema y panel base
status: planificado
scope: supabase/migrations/, src/modules/, src/app/(auth), src/app/(panel)
last_updated: 2026-10-20
---

# Fase 0.5 — Esquema y panel base

Construye la base de datos, la seguridad de acceso y un panel funcional para el doctor y la secretaria con datos ficticios. Todavía sin WhatsApp ni Calendar: el panel se conecta a datos reales en fases posteriores.

## Alcance

1. Migraciones del esquema de [[supabase-schema]], con semillas de tipos de cita y horario del doctor.
2. RLS con funciones `is_doctor()` e `is_secretary()` y pruebas por rol.
3. Cifrado del DUI (AES-256-GCM) y HMAC, con pruebas unitarias.
4. Login con Supabase Auth, tabla `staff_users` y verificación de rol en el servidor. Autenticación en dos pasos si el plan lo permite.
5. Panel:
   - Doctor: "Esta semana" (pacientes por día y estado) y agenda semanal.
   - Secretaria: agenda semanal, casos pendientes, eventos sin vincular y búsqueda de pacientes.
   - Ambos: DUI siempre enmascarado salvo para el doctor con registro de auditoría.
6. Datos ficticios con prefijo "Paciente de Prueba", solo en local.
7. Pruebas por rol contra Supabase local.

## Decisiones que se resuelven en la auditoría

- [[0002-runtime-del-backend]] (API aparte o Next.js único con cron).
- Capacidad por franja: 35 espacios por semana frente a 44 pacientes ([[respuestas-doctor-cuestionario]]).

## Fuera de alcance

- WhatsApp, Google Calendar, correo, recordatorios.
- Expediente clínico.

## Definición de hecho

- Migraciones aplicadas en local desde cero con un solo comando.
- Pruebas de RLS: la secretaria no ve el DUI en claro; un usuario sin rol no ve nada.
- Cada pantalla del panel carga con datos ficticios y respeta el rol.
- Docs de esquema y panel actualizados; [[supabase-schema]] pasa a `en-curso` con `verified_commit`.
- Entrada en [[CHANGELOG]].

## Conexiones

- [[README-planes]]
- [[01-fase-0-5-esquema-y-panel]]
- [[supabase-schema]]
- [[security-and-privacy]]
- [[modules-overview]]
