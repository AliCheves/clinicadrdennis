---
title: Registro de decisiones (ADR)
status: en-curso
scope: docs/decisions/
last_updated: 2026-10-20
---

# Registro de decisiones (ADR)

Una decisión por archivo. Un ADR aceptado no se edita para cambiar de opinión: se crea uno nuevo que lo reemplaza y el viejo pasa a `Reemplazado`. Los estados son `Propuesto`, `Aceptado`, `Reemplazado` y `Rechazado`.

## Plantilla

```
---
title: ADR-NNNN — Título
status: propuesto | aceptado | reemplazado | rechazado
fecha: AAAA-MM-DD
last_updated: AAAA-MM-DD
---
# ADR-NNNN — Título
**Estado:** ...
## Contexto
## Decisión
## Consecuencias
## Alternativas
## Conexiones
```

## Decisiones

| ADR | Decisión | Estado |
|---|---|---|
| [[0001-monolito-modular]] | Monolito modular, no microservicios | Aceptado |
| [[0002-runtime-del-backend]] | Runtime del backend para webhook y recordatorios | Propuesto |
| [[0003-calendar-fuente-de-verdad]] | Google Calendar es la verdad sobre la ocupación | Aceptado |
| [[0004-bot-determinista-sin-ia]] | Bot determinista con botones y listas, sin IA en el MVP | Aceptado |
| [[0005-whatsapp-cloud-api-directo]] | WhatsApp Cloud API de Meta directo, con cuentas a nombre del doctor | Aceptado |
| [[0006-typescript-y-postgresql]] | TypeScript en todo el proyecto y PostgreSQL | Aceptado |
| [[0007-zona-horaria-y-fechas]] | Zona horaria America/El_Salvador, fechas en UTC | Aceptado |
| [[0008-un-doctor-un-consultorio]] | Un solo doctor y un solo consultorio | Aceptado |
| [[0009-datos-sensibles]] | DUI cifrado y nada clínico en el chat | Aceptado |
| [[0010-acceso-a-datos-solo-por-servidor]] | Todo acceso a datos de pacientes pasa por la capa de servidor | Aceptado |
| [[0011-numero-whatsapp-coexistencia]] | Qué hacer con el número de WhatsApp del consultorio | Propuesto |
| [[0012-recordatorios-idempotentes]] | Recordatorios idempotentes | Aceptado |
| [[0013-documentacion-como-vault]] | Documentación como vault de Obsidian, en español | Aceptado |
| [[0014-panel-base-antes-del-bot]] | Construir el panel base antes que el bot | Propuesto |

Las decisiones 0001 a 0012 salen de la propuesta de proyecto del 2026-10-10; se registraron como ADR el 2026-10-20.

## Decisiones abiertas

- [[0002-runtime-del-backend]]: se decide en la auditoría de la Fase 0.5.
- [[0011-numero-whatsapp-coexistencia]]: se decide en el alta real del número, con el doctor.
- [[0014-panel-base-antes-del-bot]]: pendiente de confirmar por Alí.

## Conexiones

- [[INDEX]]
- [[CONVENTIONS]]
