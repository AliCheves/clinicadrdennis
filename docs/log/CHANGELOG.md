---
title: Bitácora del proyecto
status: en-curso
scope: todo el proyecto
last_updated: 2026-10-20
---

# Bitácora del proyecto

Qué pasó y cuándo, más reciente arriba. Cada fase cerrada, decisión, cuenta creada, incidente o rotación de secretos deja una entrada. Sin secretos ni datos reales de pacientes. Los detalles largos van en `docs/log/sesiones/`.

## Formato

```
## AAAA-MM-DD — título corto
- Qué cambió o pasó
- Estado en que quedó
- Enlaces: [[doc]] [[adr]]
```

---

## 2026-10-20 — Fase 0 implementada: landing, Supabase local y CI

- Auditoría de solo lectura entregada y aprobada por Alí, con las decisiones D1 a D8 ([[fase-0-auditoria]]). Alí hizo el primer commit en `main`; el trabajo va en `feature/fase-0-cimientos`.
- App Next.js 16 (App Router, TypeScript, Tailwind 4, ESLint) con la estructura de `AGENTS.md`, puertas vacías por módulo, `.env.example` sin valores y `.nvmrc` con Node 24. `agentRules: false` evita que `next dev` reescriba `AGENTS.md`.
- Landing pública `/`, `/privacidad` y `/terminos` ([[landing]]):
  - Todos los datos del consultorio con `confirmado: false`, así que la página muestra "Información en actualización" y lleva `noindex`.
  - Teléfono y WhatsApp sin valor hasta resolver [[0011-numero-whatsapp-coexistencia]]; el número del consultorio no aparece en el código.
  - Borradores legales con aviso visible y responsable "Pendiente de confirmar".
  - Sin analítica, cookies ni recursos de terceros.
- Supabase local con la CLI como dependencia de desarrollo, en puertos 554xx para convivir con el del autódromo ([[testing-local-supabase]]). Sin esquema.
- Pruebas:
  - Vitest para el filtro de datos confirmados.
  - Playwright a 375 px: carga sin errores, sin scroll horizontal, axe WCAG A/AA en claro y oscuro, sin terceros, `noindex` y ningún dato sin confirmar en el HTML.
  - CI en GitHub Actions en cada PR, con un trabajo aparte de Playwright (solo Chromium, con caché).
- Despliegue pendiente: Alí conecta Vercel Hobby siguiendo [[runbook-desplegar-landing]]. Hobby es solo para uso no comercial; hay que pasar a Pro u otro host antes de atender pacientes reales ([[environments-and-accounts]]).
- Enlaces: [[fase-0-cimientos]] [[landing]] [[testing-local-supabase]] [[runbook-desplegar-landing]]

## 2026-10-20 — Portafolio de Meta creado, vault y prompts

- En la clínica: el número de WhatsApp es estándar; se indicó pasarlo a WhatsApp Business. Queda por confirmar si se hizo y si es el número personal del doctor o una línea del consultorio.
- Se creó el portafolio de negocio de Meta con la cuenta del doctor: "Clínica de Reumatología Dr. Dennis Flores".
- Meta exige una URL de sitio web válida para guardar la información del negocio; se resuelve con la landing de [[fase-0-cimientos]]. Pendiente alinear el nombre legal con los documentos.
- Se creó este vault, tomando como modelo el del autódromo ([[0013-documentacion-como-vault]]), y los prompts de las fases 0 y 0.5.
- Al releer el PDF del doctor se corrigieron suposiciones previas: cancelación con 24 horas (no 2 a 4), agendar hasta 2 semanas adelante, la secretaria responde desde el mismo número, se pide fecha de nacimiento, el plazo marcado fue "1 a 2 semanas" y no está confirmado que exista un Excel de pacientes. Detalle en [[respuestas-doctor-cuestionario]].
- Enlaces: [[INDEX]] [[0011-numero-whatsapp-coexistencia]] [[runbook-meta-whatsapp-setup]]

## 2026-10-10 — Cuestionario respondido y propuesta entregada

- El doctor respondió el cuestionario de 16 preguntas ([[respuestas-doctor-cuestionario]]).
- Se entregó la propuesta de proyecto: monolito modular, esquema de 12 tablas, stack del panel, 10 decisiones cerradas, riesgos y plan por fases (documento en claude.ai: <https://claude.ai/code/artifact/ac6ea241-dbbd-4977-b1ae-7a292ce9d0a3>).
- Enlaces: [[README-decisiones]]
