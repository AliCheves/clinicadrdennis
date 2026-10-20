---
title: Prompts de Claude Code por fase
status: en-curso
scope: docs/prompts/
last_updated: 2026-10-20
---

# Prompts de Claude Code por fase

Cada fase se entrega a Claude Code con un prompt que obliga a tres tiempos: auditar sin cambiar nada, esperar "aprobado", implementar. Es el mismo patrón de las auditorías del autódromo.

## Cómo usarlos

1. Abrir el repositorio en Claude Code.
2. Pegar el contenido del prompt de la fase.
3. Leer `docs/plans/<fase>-auditoria.md`, responder las decisiones y escribir "aprobado".
4. Revisar el reporte final, la bitácora y los docs actualizados antes de fusionar el PR.

## Prompts

| Prompt | Fase | Estado |
|---|---|---|
| [[00-fase-0-cimientos]] | Cimientos: repo, landing, entorno local, CI | Listo |
| [[01-fase-0-5-esquema-y-panel]] | Esquema, RLS, cifrado y panel base con datos ficticios | Listo |
| 02 a 05 | Agendar, recordatorios, piloto, expediente | Se redactan al llegar a cada fase, con el mismo molde |

## Molde para un prompt nuevo

1. Contexto de una línea y regla de la compuerta.
2. Lista de lectura previa.
3. Parte A: auditoría de solo lectura, con su entregable, sus preguntas y su cierre "Esperando aprobación".
4. Parte B: implementación en rama, con pasos pequeños y verificación después de cada uno.
5. Reglas de la fase (qué no tocar).
6. Documentación y bitácora al terminar.
7. Reporte final.

## Conexiones

- [[README-planes]]
- [[CONVENTIONS]]
- [[agents]]
