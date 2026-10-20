---
title: ADR-0004 — Bot determinista con botones y listas, sin IA en el MVP
status: aceptado
fecha: 2026-10-20
last_updated: 2026-10-20
---

# ADR-0004 — Bot determinista con botones y listas, sin IA en el MVP

**Estado:** Aceptado

## Contexto

Las citas médicas necesitan respuestas predecibles. El doctor pidió solo recordatorios y confirmación, sin seguimiento posconsulta.

## Decisión

El bot usa una máquina de estados con botones y listas de WhatsApp. No hay modelo de lenguaje en el MVP.

## Consecuencias

Más barato, más fácil de probar y depurar, y sin envío de datos de pacientes a un proveedor de IA. Los mensajes libres que el bot no entiende se escalan a la secretaria.

## Alternativas

Bot conversacional con IA: se revisará después con validación legal ([[security-and-privacy]]).

## Conexiones

- [[whatsapp-integration]]
- [[README-decisiones]]
