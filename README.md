# Asistente de citas — Consultorio del Dr. Dennis René Flores

Asistente de WhatsApp para agendar, confirmar, reprogramar y cancelar citas, con recordatorios y un panel web para el doctor y la secretaria. Google Calendar es la agenda única.

## Dónde está cada cosa

| Qué busco | Dónde |
|---|---|
| Entender el sistema | `docs/architecture/INDEX.md` |
| Por qué se decidió algo | `docs/decisions/` |
| Qué pidió el doctor | `docs/requirements/` |
| Qué ha pasado y cuándo | `docs/log/CHANGELOG.md` |
| Cómo se opera (Meta, tokens, incidentes) | `docs/operations/` |
| Qué se construye en cada fase | `docs/plans/` y `docs/prompts/` |

## Estado

Ver `docs/log/CHANGELOG.md`. Fase 0 (cimientos) implementada; sigue la Fase 0.5 (esquema y panel).

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run lint` / `npm run typecheck` / `npm run build` | Calidad y compilación |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run test:e2e` | Pruebas de la landing (Playwright; la primera vez: `npx playwright install chromium`) |
| `npm run db:start` / `npm run db:stop` | Supabase local con Docker (ver `docs/architecture/infrastructure/testing-local-supabase.md`) |

## Para empezar a trabajar con Claude Code

1. Abre el repo en Claude Code.
2. Pega el contenido de `docs/prompts/00-fase-0-cimientos.md`.
3. Revisa la auditoría que entrega, responde sus preguntas y escribe "aprobado" para que implemente.
