---
title: Plantilla de incidente
status: implementado
scope: cualquier fallo, filtración o error con impacto en pacientes o en la agenda
last_updated: 2026-10-20
---

# Plantilla de incidente

Copiar a `docs/log/sesiones/AAAA-MM-DD-incidente-<tema>.md` y llenar. Sin secretos ni datos reales de pacientes.

```
# Incidente AAAA-MM-DD — <tema>

- Detectado por: 
- Hora de detección (America/El_Salvador): 
- Gravedad: baja | media | alta
- ¿Se expusieron datos personales o el DUI? no | sí → avisar al doctor el mismo día

## Qué pasó

## Impacto
(cuántos pacientes, qué citas, cuánto tiempo)

## Línea de tiempo

## Causa raíz

## Acciones inmediatas

## Acciones correctivas
(con responsable y fecha)

## Documentación actualizada
(ADR, runbook, doc del vault)
```

## Conexiones

- [[security-and-privacy]]
- [[runbook-rotar-token]]
- [[CHANGELOG]]
