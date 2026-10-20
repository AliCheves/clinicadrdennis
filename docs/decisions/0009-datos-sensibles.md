---
title: ADR-0009 — DUI cifrado y nada clínico en el chat
status: aceptado
fecha: 2026-10-20
last_updated: 2026-10-20
---

# ADR-0009 — DUI cifrado y nada clínico en el chat

**Estado:** Aceptado

## Contexto

El doctor pidió recoger nombre, DUI, contacto y correo. El DUI es un dato personal sensible y las conversaciones de WhatsApp no son un lugar seguro para datos clínicos.

## Decisión

El DUI se guarda cifrado con AES-256-GCM, con la clave fuera de la base de datos, y se acompaña de un HMAC para detectar duplicados. Ningún dato clínico circula por WhatsApp, correos, notas de cita ni logs.

## Consecuencias

El DUI solo lo ve el doctor, con auditoría. Se necesita consentimiento explícito. La validación legal sigue pendiente ([[security-and-privacy]]).

## Alternativas

Guardar el DUI en claro: descartado.

## Conexiones

- [[security-and-privacy]]
- [[supabase-schema]]
- [[README-decisiones]]
