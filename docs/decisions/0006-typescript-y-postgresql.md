---
title: ADR-0006 — TypeScript en todo el proyecto y PostgreSQL
status: aceptado
fecha: 2026-10-20
last_updated: 2026-10-20
---

# ADR-0006 — TypeScript en todo el proyecto y PostgreSQL

**Estado:** Aceptado

## Contexto

Un solo desarrollador y un panel y un backend que comparten tipos.

## Decisión

TypeScript para backend, panel y scripts. PostgreSQL gestionado en Supabase como base de datos, con migraciones versionadas en el repositorio.

## Consecuencias

Un solo lenguaje y tipos compartidos. La base de datos y el login son servicios gestionados.

## Alternativas

Otro lenguaje de servidor: sin ventaja para este tamaño.

## Conexiones

- [[supabase-schema]]
- [[README-decisiones]]
