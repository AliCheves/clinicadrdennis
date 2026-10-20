---
title: ADR-0002 — Runtime del backend para webhook y recordatorios
status: propuesto
fecha: 2026-10-20
last_updated: 2026-10-20
---

# ADR-0002 — Runtime del backend para webhook y recordatorios

**Estado:** Propuesto

## Contexto

La propuesta publicada planteaba Fastify con un proceso worker (pg-boss) en Railway o Render, más un panel en Next.js. Alí ya trabaja con Next.js, Supabase y Vercel en el autódromo.

## Decisión

Pendiente de decidir en la auditoría de la Fase 0.5. Opción A: API en Fastify con worker y cola pg-boss, panel aparte. Opción B (recomendada para evaluar primero): una sola aplicación Next.js (App Router) con el webhook y los endpoints de cron como Route Handlers, y un programador externo (por ejemplo `pg_cron` de Supabase llamando a un endpoint protegido con `CRON_SECRET`).

## Consecuencias

Con B hay un solo despliegue y se reutilizan las convenciones del autódromo. Con A hay más piezas pero procesamiento en segundo plano más flexible. En ambos casos sigue siendo un monolito modular ([[0001-monolito-modular]]). La Fase 0 no depende de esta decisión porque la landing y el panel son Next.js en ambos casos.

## Alternativas

Evaluar tiempos de respuesta del webhook, límites del plan de hosting y costo mensual antes de elegir. Un plan gratuito de hosting puede no permitir uso comercial ni tareas programadas frecuentes: verificarlo.

## Conexiones

- [[reminders]]
- [[whatsapp-integration]]
- [[README-decisiones]]
