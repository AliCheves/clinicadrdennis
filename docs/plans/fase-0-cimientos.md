---
title: Fase 0 — Cimientos
status: planificado
scope: repositorio, landing pública, entorno local, CI
last_updated: 2026-10-20
---

# Fase 0 — Cimientos

Deja listo el terreno: repositorio con reglas y vault, una landing pública que sirve para la verificación de Meta, entorno local con Supabase y CI. No toca WhatsApp, Calendar ni datos de pacientes.

## Por qué ahora

Meta exige una URL de sitio web válida para guardar la información del negocio y más adelante pedirá una política de privacidad pública ([[environments-and-accounts]]).

## Alcance

1. Aplicación base en Next.js (App Router, TypeScript, Tailwind) con la estructura de `AGENTS.md`.
2. Landing pública: `/`, `/privacidad`, `/terminos`.
3. Contenido del consultorio en `src/config/content/clinic.ts`, mostrando solo campos confirmados.
4. Supabase local con Docker, sin esquema todavía.
5. Pruebas básicas de la landing y CI (lint, tipos, build).
6. Vault actualizado y bitácora.

## Fuera de alcance

- Esquema de base de datos y panel ([[fase-0-5-esquema-y-panel]]).
- Cualquier llamada a Meta o a Google.
- Despliegue: lo hace Alí con la cuenta del doctor siguiendo el checklist que entrega la fase.

## Datos del consultorio observados (por confirmar con el doctor)

Salen del formulario de Meta del 2026-10-20 y de sus respuestas. Ninguno se publica hasta marcarlo `confirmado`.

| Campo | Valor observado |
|---|---|
| Nombre | Clínica de Reumatología Dr. Dennis Flores |
| Dirección | Avenida La Capilla, Casa 314, Colonia San Benito, San Salvador |
| Teléfono del negocio | 7841-4688 |
| Horario de consulta | Lunes y viernes 1:00–5:30 pm; miércoles y jueves 3:00–5:30 pm; sábado 8:00–11:30 am; martes sin consulta |
| Nombre legal | Por confirmar: debe coincidir con los documentos de la verificación de Meta |

## Definición de hecho

- La landing carga sin errores y sin scroll horizontal a 375 px.
- `/privacidad` y `/terminos` existen, con aviso visible de borrador pendiente de revisión legal.
- Lint, tipos, build y pruebas en verde en CI.
- `docs/architecture/public/landing.md` creado según [[CONVENTIONS]].
- Entrada en [[CHANGELOG]].
- Lista de despliegue entregada a Alí.

## Conexiones

- [[README-planes]]
- [[00-fase-0-cimientos]]
- [[environments-and-accounts]]
- [[runbook-meta-whatsapp-setup]]
