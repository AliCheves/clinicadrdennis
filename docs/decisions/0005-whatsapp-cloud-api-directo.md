---
title: ADR-0005 — WhatsApp Cloud API de Meta directo, con cuentas a nombre del doctor
status: aceptado
fecha: 2026-10-20
last_updated: 2026-10-20
---

# ADR-0005 — WhatsApp Cloud API de Meta directo, con cuentas a nombre del doctor

**Estado:** Aceptado

## Contexto

Un proveedor intermediario es más rápido de arrancar pero más caro. El doctor pidió que las cuentas queden a su nombre.

## Decisión

Se usa la API de WhatsApp Cloud de Meta directamente. El portafolio de negocio, la app y la cuenta de WhatsApp Business son del doctor; Alí entra como administrador.

## Consecuencias

Hace falta verificación de Meta Business y plantillas aprobadas, que toman días. No hay costo de intermediario.

## Alternativas

Twilio u otro proveedor.

## Conexiones

- [[whatsapp-integration]]
- [[environments-and-accounts]]
- [[README-decisiones]]
