---
title: ADR-0003 — Google Calendar es la verdad sobre la ocupación
status: aceptado
fecha: 2026-10-20
last_updated: 2026-10-20
---

# ADR-0003 — Google Calendar es la verdad sobre la ocupación

**Estado:** Aceptado

## Contexto

El doctor usa Google Calendar desde hace unos 15 días y la secretaria agenda a mano allí. Pidió un modo mixto, siempre por Calendar.

## Decisión

Calendar manda sobre qué horas están ocupadas. PostgreSQL guarda pacientes, conversaciones, recordatorios y un espejo de las citas. El bot crea eventos en Calendar y lee los que crea la secretaria.

## Consecuencias

Hace falta sincronización en dos vías con avisos push y sondeo de respaldo, y un formato fijo de título para citas manuales. Si Calendar falla, el bot pasa a solo consulta.

## Alternativas

Base de datos como única verdad: obligaría a la secretaria a cambiar de herramienta, contra lo que pidió el doctor.

## Conexiones

- [[google-calendar-sync]]
- [[supabase-schema]]
- [[README-decisiones]]
