---
title: Módulos del monolito
status: planificado
scope: src/modules/
last_updated: 2026-10-20
verified_commit: n/a
---

# Módulos del monolito

El sistema es un monolito modular ([[0001-monolito-modular]]): un solo código base con módulos de fronteras claras. Cada módulo es dueño de sus tablas y solo se usa a través de su `index.ts`.

---

## Responsabilidades

| Módulo | Qué hace | Tablas propias | Estado |
|---|---|---|---|
| `conversation` | Recibe el webhook de WhatsApp, lleva la máquina de estados del chat, envía mensajes, crea casos pendientes | `conversations`, `messages`, `handoff_requests` | planificado |
| `agenda` | Reglas de disponibilidad, cálculo de huecos, reservar, reprogramar, cancelar | `appointment_types`, `availability_rules`, `availability_exceptions`, `appointments` | planificado |
| `patients` | Pacientes, consentimiento, cifrado y búsqueda por DUI | `patients` | planificado |
| `reminders` | Programa y envía recordatorios por WhatsApp y correo, con idempotencia | `reminders` | planificado |
| `sync` | Sincronización en dos vías con Google Calendar | `calendar_sync_state` | planificado |
| (transversal) | Personal del panel y auditoría | `staff_users`, `audit_log` | planificado |

## Fronteras

- Un módulo no importa archivos internos de otro; solo su `index.ts`.
- Solo `agenda` escribe en `appointments`. `conversation` y el panel piden cambios a `agenda`.
- Solo `patients` lee o escribe el DUI. Ver [[security-and-privacy]].
- Solo `sync` habla con Google Calendar. Solo `conversation` y `reminders` hablan con WhatsApp, a través de `src/lib/whatsapp/`.

## Dependencias permitidas

```
conversation ──► agenda ──► sync
      │             │
      └──► patients └──► patients
reminders ──► agenda
reminders ──► conversation (solo para enviar plantillas)
```

## Notas

- Desde la Fase 0 cada módulo tiene su puerta `src/modules/<módulo>/index.ts`, vacía (`export {};`). Todavía no hay lógica.
- Cuando un módulo se implemente, cada uno recibe su propio documento con el esquema de [[CONVENTIONS]] y esta tabla se actualiza.

## Conexiones

- [[INDEX]]
- [[supabase-schema]]
- [[whatsapp-integration]]
- [[google-calendar-sync]]
- [[reminders]]
- [[security-and-privacy]]
- [[0001-monolito-modular]]
