---
title: ADR-0010 — Todo acceso a datos de pacientes pasa por la capa de servidor
status: aceptado
fecha: 2026-10-20
last_updated: 2026-10-20
---

# ADR-0010 — Todo acceso a datos de pacientes pasa por la capa de servidor

**Estado:** Aceptado

## Contexto

El panel muestra datos de pacientes y debe haber un solo lugar donde se controlen permisos y auditoría.

## Decisión

El navegador no consulta tablas de pacientes directamente. Todo pasa por la capa de servidor con verificación de rol, y RLS actúa como segunda capa.

## Consecuencias

Un solo punto donde se verifican roles y se registra la auditoría. El patrón de doble barrera es el mismo del autódromo.

## Alternativas

Acceso directo desde el navegador con solo RLS: una sola barrera, descartado.

## Conexiones

- [[security-and-privacy]]
- [[supabase-schema]]
- [[README-decisiones]]
