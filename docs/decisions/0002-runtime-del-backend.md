---
title: ADR-0002 — Runtime del backend para webhook y recordatorios
status: aceptado
fecha: 2026-10-20
last_updated: 2026-11-25
---

# ADR-0002 — Runtime del backend para webhook y recordatorios

**Estado:** Aceptado el 2026-11-25 (opción B, decisión D1 de [[fase-0-5-auditoria]])

## Contexto

La propuesta publicada planteaba Fastify con un proceso worker (pg-boss) en Railway o Render, más un panel en Next.js. Alí ya trabaja con Next.js, Supabase y Vercel en el autódromo.

## Decisión

**Opción B: una sola aplicación Next.js.**

- El webhook de WhatsApp y los endpoints de cron son Route Handlers.
- El webhook responde 200 de inmediato y procesa después.
- `pg_cron` + `pg_net` de Supabase llaman a los endpoints protegidos con `CRON_SECRET` cada 5 a 15 minutos.
- Los recordatorios son idempotentes por [[0012-recordatorios-idempotentes]].
- El hosting de producción necesita un plan que permita uso comercial, por ejemplo Vercel Pro (unos US$20 al mes) u otro host compatible con Next.js.

Se implementa en la Fase 1. La comparación completa está en [[fase-0-5-auditoria]] §4.

Planteamiento original: Opción A: API en Fastify con worker y cola pg-boss, panel aparte. Opción B (recomendada para evaluar primero): una sola aplicación Next.js (App Router) con el webhook y los endpoints de cron como Route Handlers, y un programador externo (por ejemplo `pg_cron` de Supabase llamando a un endpoint protegido con `CRON_SECRET`).

## Consecuencias

Con B hay un solo despliegue y se reutilizan las convenciones del autódromo. Con A hay más piezas pero procesamiento en segundo plano más flexible. En ambos casos sigue siendo un monolito modular ([[0001-monolito-modular]]). La Fase 0 no depende de esta decisión porque la landing y el panel son Next.js en ambos casos.

## Alternativas

Descartada: A (API Fastify + worker pg-boss + panel aparte). Más piezas que operar para un solo desarrollador y unas 44 citas por semana.

Evaluar tiempos de respuesta del webhook, límites del plan de hosting y costo mensual antes de elegir. Un plan gratuito de hosting puede no permitir uso comercial ni tareas programadas frecuentes: verificarlo.

## Conexiones

- [[reminders]]
- [[whatsapp-integration]]
- [[README-decisiones]]
