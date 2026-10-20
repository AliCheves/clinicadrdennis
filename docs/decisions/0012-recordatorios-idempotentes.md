---
title: ADR-0012 — Recordatorios idempotentes
status: aceptado
fecha: 2026-10-20
last_updated: 2026-10-20
---

# ADR-0012 — Recordatorios idempotentes

**Estado:** Aceptado

## Contexto

Una tarea que se reintenta no debe enviar dos veces el mismo mensaje a un paciente.

## Decisión

Máximo un recordatorio por cita, canal y tipo, con restricción `UNIQUE (appointment_id, channel, kind)` y registro del resultado de cada envío.

## Consecuencias

Sin duplicados aunque el cron corra dos veces. Un fallo de un canal no afecta al otro.

## Alternativas

Controlar duplicados solo en el código: frágil.

## Conexiones

- [[reminders]]
- [[README-decisiones]]
