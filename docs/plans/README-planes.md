---
title: Planes y auditorías por fase
status: en-curso
scope: docs/plans/
last_updated: 2026-10-20
---

# Planes y auditorías por fase

Cada fase tiene tres piezas, igual que en el autódromo (auditoría de solo lectura antes de implementar):

1. **Plan** (`<fase>.md`): el contrato. Qué entra, qué no, cuándo está hecho.
2. **Auditoría** (`<fase>-auditoria.md`): la entrega de solo lectura de Claude Code antes de implementar. Termina con las decisiones que Alí debe tomar. Queda como registro histórico y no se vuelve a editar.
3. **Prompt** (`docs/prompts/NN-<fase>.md`): lo que se pega en Claude Code. Obliga a auditar, esperar "aprobado" e implementar.

## Fases

| Fase | Qué entrega | Plan | Estado |
|---|---|---|---|
| 0 — Cimientos | Repositorio, vault, landing pública, Supabase local, CI | [[fase-0-cimientos]] | En curso |
| 0.5 — Esquema y panel base | Migraciones, RLS, cifrado del DUI, login y panel con datos ficticios | [[fase-0-5-esquema-y-panel]] | Planificada |
| 1 — Agendar | Bot de agendar, consultar y cancelar; sincronización con Calendar | Por redactar | Planificada |
| 2 — Recordatorios | Plantillas aprobadas, recordatorios a 2 días y el mismo día, confirmación | Por redactar | Planificada |
| 3 — Piloto | Pacientes reales con el consultorio, ajustes, capacitación | Por redactar | Planificada |
| 4 — Expediente clínico | Expediente y resumen para aseguradoras. Requiere validación legal antes | Por redactar | Planificada |

El panel base (Fase 0.5) se adelanta respecto al plan original para avanzar mientras Meta verifica el negocio ([[0014-panel-base-antes-del-bot]]).

## Plazo

El doctor marcó "1 a 2 semanas" y escribió que no tiene prisa y quiere buen trabajo ([[respuestas-doctor-cuestionario]]). Las estimaciones por fase se fijan en cada auditoría y se acuerdan con él.

## Conexiones

- [[INDEX]]
- [[README-prompts]]
- [[README-decisiones]]
- [[CHANGELOG]]
