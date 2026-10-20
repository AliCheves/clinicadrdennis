---
title: ADR-0007 — Zona horaria America/El_Salvador, fechas en UTC
status: aceptado
fecha: 2026-10-20
last_updated: 2026-10-20
---

# ADR-0007 — Zona horaria America/El_Salvador, fechas en UTC

**Estado:** Aceptado

## Contexto

El Salvador no usa horario de verano, pero Google Calendar y Meta trabajan con marcas de tiempo absolutas.

## Decisión

Toda fecha se guarda en UTC (`timestamptz`) y se muestra y calcula en `America/El_Salvador`. El horario del doctor se define en hora local.

## Consecuencias

Se evitan errores al sincronizar. Los cálculos de "hoy", "esta semana" y recordatorios parten siempre de la hora local.

## Alternativas

Guardar hora local sin zona: ambiguo.

## Conexiones

- [[supabase-schema]]
- [[reminders]]
- [[README-decisiones]]
