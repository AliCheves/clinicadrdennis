---
title: ADR-0014 — Construir el panel base antes que el bot
status: propuesto
fecha: 2026-10-20
last_updated: 2026-10-20
---

# ADR-0014 — Construir el panel base antes que el bot

**Estado:** Propuesto

## Contexto

Alí pidió tener el panel "ya". El bot depende de trámites de Meta que toman días, mientras que el panel no.

## Decisión

La Fase 0.5 construye el esquema y el panel con datos ficticios, sin WhatsApp ni Calendar. El resto de las fases conserva su orden.

## Consecuencias

Se avanza mientras Meta verifica el negocio y se aprueban las plantillas. El panel se conecta a datos reales en fases posteriores. Hay que mantener los datos ficticios fuera de producción.

## Alternativas

Seguir el orden original (bot primero): deja días sin avance visible.

## Conexiones

- [[README-planes]]
- [[modules-overview]]
- [[README-decisiones]]
