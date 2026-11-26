---
title: ADR-0011 — Qué hacer con el número de WhatsApp del consultorio
status: aceptado
fecha: 2026-10-20
last_updated: 2026-11-25
---

# ADR-0011 — Qué hacer con el número de WhatsApp del consultorio

**Estado:** Aceptado el 2026-11-25 por Alí (opción C)

## Contexto

El doctor pidió que la secretaria responda desde el mismo número de WhatsApp cuando el bot no resuelve ([[respuestas-doctor-cuestionario]], pregunta 9). Registrar un número en la WhatsApp Cloud API lo saca de la app del celular, salvo que se use coexistencia.

Hechos confirmados por Alí el 2026-11-25:

- El número del consultorio, el de [[fase-0-cimientos]] § Datos del consultorio observados, será el de WhatsApp Business. **No es el número personal del doctor.**
- Ya está en la app **WhatsApp Business** desde octubre de 2026 (aparece como negocio al verlo desde otra cuenta) y **se usa a diario con pacientes**.

La documentación de Meta sobre coexistencia ("Onboard WhatsApp Business app users") exige:

1. El número en la app WhatsApp Business, versión 2.24.17 o superior.
2. Alta mediante Embedded Signup, implementada por un Solution Partner o Tech Provider.
3. Un webhook ya funcionando.
4. Que el número no esté agregado a ningún portafolio de negocio, página de Facebook ni bandeja de Meta Business Suite.

El MCP de WhatsApp Business no admite coexistencia ni migración: registrar el número con él lo saca de la app y no se puede deshacer desde ahí.

## Decisión

**Opción C:**

- El número del consultorio pasa **solo a la Cloud API**, sin coexistencia.
- La secretaria responde a los pacientes desde una **bandeja de respuestas en el panel web**.

Momento del registro:

- El número **no se registra en la API** hasta que estén listos y probados el webhook (Fase 1) y la bandeja del panel.
- Hasta ese día sigue funcionando en la app WhatsApp Business del teléfono.
- El corte se planifica con el doctor y la secretaria: fecha y hora, aviso, respaldo de chats y qué hacer con las conversaciones abiertas.
- El registro lo autoriza Alí en ese momento (`AGENTS.md`, regla 8).

## Consecuencias

- **La bandeja de respuestas entra al MVP.** Es parte del módulo `conversation` y del panel de la secretaria: ver conversaciones, responder dentro de la ventana de 24 horas y usar plantillas fuera de ella.
- El día del corte el número deja de funcionar en el celular:
  - Los chats del teléfono no pasan a la API.
  - Las llamadas de voz y video, las listas de difusión y las etiquetas de la app dejan de estar disponibles en ese número.
- Mientras no exista el bot, todo sigue igual que hoy.
- Las pruebas de desarrollo usan el número de pruebas de Meta o teléfonos de Alí, nunca este número ni pacientes reales.
- Hasta el corte no se conecta el número a Meta Business Suite ni a ningún portafolio fuera de este flujo.

## Alternativas

- **A. Coexistencia con Alí como Tech Provider.** El número seguiría también en el celular. Descartada por ahora: exige la ruta de socio de Meta, con verificación y revisión de la app, y Embedded Signup propio.
- **B. Coexistencia mediante un BSP.** Descartada: intermediario con costo, contra [[0005-whatsapp-cloud-api-directo]].
- **Número nuevo solo para el bot.** No elegida: los pacientes ya conocen este número.

Se puede reabrir con un ADR nuevo si la bandeja resulta insuficiente.

## Conexiones

- [[0005-whatsapp-cloud-api-directo]]
- [[fase-0-cimientos]]
- [[whatsapp-integration]]
- [[modules-overview]]
- [[runbook-meta-whatsapp-setup]]
- [[respuestas-doctor-cuestionario]]
- [[README-decisiones]]
