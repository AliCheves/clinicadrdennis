---
title: ADR-0011 — Qué hacer con el número de WhatsApp del consultorio
status: propuesto
fecha: 2026-10-20
last_updated: 2026-10-20
---

# ADR-0011 — Qué hacer con el número de WhatsApp del consultorio

**Estado:** Propuesto

## Contexto

El número es WhatsApp estándar y el doctor acepta pasarlo a WhatsApp Business solo para pacientes. Además marcó que la secretaria responde desde el mismo número de WhatsApp, y no está claro si ese número es su número personal o una línea del consultorio. Registrarlo en la API lo saca de la app, salvo que Meta ofrezca el modo coexistencia para El Salvador, que no está confirmado.

## Decisión

Pendiente de decidir. Primero pasar el número a WhatsApp Business. Luego ver si el alta ofrece coexistencia para +503. Si sí, el número sigue en la app y en la API. Si no, elegir entre un número nuevo para el bot o pasar el actual a la API y construir una bandeja de respuestas en el panel. Hasta decidir, no se registra el número real en la API.

## Consecuencias

Determina cómo responde la secretaria cuando el bot la deriva: con coexistencia puede usar la app del celular; sin ella, la bandeja del panel entra al MVP.

## Alternativas

Ninguna descartada todavía.

## Conexiones

- [[whatsapp-integration]]
- [[runbook-meta-whatsapp-setup]]
- [[README-decisiones]]
