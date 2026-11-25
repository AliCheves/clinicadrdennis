---
title: ADR-0011 — Qué hacer con el número de WhatsApp del consultorio
status: propuesto
fecha: 2026-10-20
last_updated: 2026-11-25
---

# ADR-0011 — Qué hacer con el número de WhatsApp del consultorio

**Estado:** Propuesto

## Contexto

**Actualización 2026-11-25.** Alí confirmó que el número del consultorio, el de [[fase-0-cimientos]] § Datos del consultorio observados, será el de WhatsApp Business y **no es el número personal del doctor**. Hoy está activo en la app de WhatsApp en un teléfono.

La documentación de Meta ("Onboard WhatsApp Business app users", conocida como coexistencia) exige:

1. El número en la app **WhatsApp Business** (v2.24.17 o superior), no en WhatsApp estándar.
2. Alta mediante **Embedded Signup**, implementada por un **Solution Partner o Tech Provider**.
3. Un webhook ya funcionando.

Con coexistencia, los chats 1 a 1 se sincronizan entre la app y la API, con hasta 6 meses de historial. Se desactivan las listas de difusión, los mensajes temporales y la ubicación en vivo. Los dispositivos vinculados se desvinculan, y WhatsApp para Windows no es compatible. El límite es de 20 mensajes por segundo.

El MCP de WhatsApp Business no admite coexistencia ni migración: registrar el número con él lo sacaría de la app. La documentación consultada no menciona restricciones por país; falta confirmarlo para +503 al intentarlo.

Texto original:

El número es WhatsApp estándar y el doctor acepta pasarlo a WhatsApp Business solo para pacientes. Además marcó que la secretaria responde desde el mismo número de WhatsApp, y no está claro si ese número es su número personal o una línea del consultorio. Registrarlo en la API lo saca de la app, salvo que Meta ofrezca el modo coexistencia para El Salvador, que no está confirmado.

## Decisión

Pendiente de decidir; parcialmente resuelta el 2026-11-25.

- El número del consultorio es el elegido.
- No se registra en la API hasta tener el webhook de la Fase 1.
- Mientras tanto se pasa a la app WhatsApp Business en el teléfono, respaldando antes los chats.
- En la Fase 1 se elige entre:
  - **(a)** que Alí se haga Tech Provider de Meta para su propia app;
  - **(b)** un BSP que ofrezca coexistencia, lo que contradice en parte [[0005-whatsapp-cloud-api-directo]];
  - **(c)** sin coexistencia, con la bandeja de respuestas en el panel.

Texto original: Primero pasar el número a WhatsApp Business. Luego ver si el alta ofrece coexistencia para +503. Si sí, el número sigue en la app y en la API. Si no, elegir entre un número nuevo para el bot o pasar el actual a la API y construir una bandeja de respuestas en el panel. Hasta decidir, no se registra el número real en la API.

## Consecuencias

Determina cómo responde la secretaria cuando el bot la deriva: con coexistencia puede usar la app del celular; sin ella, la bandeja del panel entra al MVP.

## Alternativas

Ninguna descartada todavía.

## Conexiones

- [[0005-whatsapp-cloud-api-directo]]
- [[fase-0-cimientos]]
- [[whatsapp-integration]]
- [[runbook-meta-whatsapp-setup]]
- [[README-decisiones]]
