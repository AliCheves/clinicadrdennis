---
title: ADR-0008 — Un solo doctor y un solo consultorio
status: aceptado
fecha: 2026-10-20
last_updated: 2026-10-20
---

# ADR-0008 — Un solo doctor y un solo consultorio

**Estado:** Aceptado

## Contexto

El doctor confirmó que atiende en un solo consultorio.

## Decisión

El MVP no soporta varios doctores ni varias sedes. `staff_users` distingue solo doctor y secretaria.

## Consecuencias

Menos complejidad. Ampliarlo después exigirá una migración y revisar disponibilidad y roles.

## Alternativas

Diseño multi-clínica desde el inicio: sin necesidad hoy.

## Conexiones

- [[supabase-schema]]
- [[README-decisiones]]
