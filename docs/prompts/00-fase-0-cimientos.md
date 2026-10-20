---
title: Prompt 00 — Fase 0 Cimientos
status: implementado
scope: pegar en Claude Code dentro del repositorio
last_updated: 2026-10-20
---

# Prompt 00 — Fase 0 Cimientos

Pega todo lo que sigue, a partir de la línea, en Claude Code. Plan de la fase: [[fase-0-cimientos]].

---

Eres el desarrollador de este repositorio: el asistente de citas por WhatsApp y el panel web del consultorio del Dr. Dennis René Flores (San Salvador, El Salvador). Trabajas por fases con una compuerta: primero auditas sin cambiar nada, luego esperas mi aprobación, luego implementas.

## Lee primero (sin modificar nada)

1. `AGENTS.md` y `CLAUDE.md`.
2. `docs/architecture/INDEX.md`, `CONVENTIONS.md`, `agents.md` y `modules-overview.md`.
3. `docs/decisions/README-decisiones.md` y todos los ADR.
4. `docs/requirements/respuestas-doctor-cuestionario.md`.
5. `docs/plans/fase-0-cimientos.md`: es el contrato de esta fase.

Si algo se contradice, no lo resuelvas por tu cuenta: anótalo en la auditoría.

## Parte A — Auditoría (solo lectura)

No instales dependencias, no cambies archivos y no corras comandos que modifiquen algo. El único archivo que puedes crear es `docs/plans/fase-0-auditoria.md`. Puedes correr `--version`, `ls` y `git status`.

La auditoría contiene:

1. Estado del repositorio y del entorno: Node, npm, Docker, Supabase CLI y git (versiones y qué falta).
2. Verificación del contrato: ¿cada punto de `docs/plans/fase-0-cimientos.md` se puede hacer tal cual? Lo que no, con propuesta.
3. Contradicciones o huecos entre los ADR, los requisitos y el contrato.
4. Las decisiones que necesito tomar (máximo 8), cada una con tu recomendación y su razón.
5. El plan de la Parte B en pasos pequeños, cada uno con su criterio de "hecho" verificable y los archivos que tocará.
6. Los documentos del vault que vas a crear o actualizar.
7. Riesgos de privacidad, secretos y datos reales.

Termina con la línea "Esperando aprobación de la Parte B." y detente. No empieces la Parte B hasta que yo escriba "aprobado".

## Parte B — Implementación (solo después de "aprobado")

Rama `feature/fase-0-cimientos`. Commits pequeños. Después de cada paso corre lint, tipos y build, y arregla antes de seguir.

**B1. Aplicación base.** Next.js (App Router, TypeScript, Tailwind) con la estructura de `AGENTS.md`. ESLint. `.env.example` con los nombres de `docs/architecture/INDEX.md` y sin valores. `.gitignore` que excluya `.env*` salvo el ejemplo.

**B2. Contenido en config.** `src/config/content/clinic.ts` con nombre, especialidad, dirección, teléfono, horario y enlace de WhatsApp. Cada campo lleva `confirmado: boolean` y la landing solo muestra los confirmados. Valores iniciales, todos con `confirmado: false`, tomados de `docs/plans/fase-0-cimientos.md` § Datos del consultorio observados.

**B3. Landing pública.** Rutas `/`, `/privacidad` y `/terminos`.
- `/`: nombre, especialidad, dirección, horario, teléfono y botón de WhatsApp; solo con campos confirmados.
- `/privacidad` y `/terminos`: borradores con un aviso visible de que están pendientes de revisión legal. No afirmes cumplimiento de ninguna ley.
- Español, sobria, accesible (contraste AA, foco visible, etiquetas), mobile-first sin scroll horizontal a 375 px, sin cookies de seguimiento ni analítica de terceros.
- No inventes credenciales, títulos, años de experiencia, precios ni testimonios. Sin fotos de stock que parezcan del consultorio. Sin afirmaciones médicas ni promesas de resultados.
- Usa la skill de diseño frontend disponible si la tienes, sin salir de estas reglas.

**B4. Supabase local.** `supabase init`, configuración para correr en Docker, scripts `npm run db:start` y `npm run db:stop`. Sin esquema todavía. Crea `docs/architecture/infrastructure/testing-local-supabase.md` con la regla: nunca contra producción.

**B5. Calidad.** Playwright básico: la landing carga, sin errores de consola, sin scroll horizontal a 375 px, y los enlaces a privacidad y términos funcionan. Lint y tipos.

**B6. CI.** GitHub Actions que corra lint, tipos y build en cada pull request.

**B7. Documentación.** Crea `docs/architecture/public/landing.md` con el esquema de `CONVENTIONS.md`. Actualiza `INDEX.md` (tabla de rutas), los documentos que cambien, `status` y `last_updated`. Añade la entrada en `docs/log/CHANGELOG.md`.

**B8. Reporte final.** Qué hiciste, qué no pudiste verificar y una lista de despliegue para mí. No despliegues tú.

## Reglas de esta fase

- No llames a la API de Meta ni a Google, no crees cuentas y no toques secretos.
- No uses datos reales de pacientes en ningún archivo.
- No hagas push a `main`.
- Si una regla de `AGENTS.md` choca con algo de este prompt, gana `AGENTS.md`; avísame.
