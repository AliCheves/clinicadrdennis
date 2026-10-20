---
title: ADR-0001 — Monolito modular, no microservicios
status: aceptado
fecha: 2026-10-20
last_updated: 2026-10-20
---

# ADR-0001 — Monolito modular, no microservicios

**Estado:** Aceptado

## Contexto

El consultorio atiende unas 44 citas por semana según las respuestas del doctor y hay un solo desarrollador.

## Decisión

Un solo código base desplegable, con módulos de fronteras claras (`conversation`, `agenda`, `patients`, `reminders`, `sync`). Cada módulo es dueño de sus tablas y solo se usa por su `index.ts`.

## Consecuencias

Un despliegue, un repositorio y una base de datos. Citas, pacientes y recordatorios comparten transacciones. Si algún día hace falta, un módulo se puede extraer sin reescribirlo.

## Alternativas

Microservicios: más costo, más fallos y coordinación sin beneficio a este volumen.

## Conexiones

- [[modules-overview]]
- [[README-decisiones]]
