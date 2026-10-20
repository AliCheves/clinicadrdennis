---
title: Prompt 01 — Fase 0.5 Esquema y panel base
status: implementado
scope: pegar en Claude Code dentro del repositorio, después de cerrar la Fase 0
last_updated: 2026-10-20
---

# Prompt 01 — Fase 0.5 Esquema y panel base

Pega todo lo que sigue, a partir de la línea, en Claude Code. Plan de la fase: [[fase-0-5-esquema-y-panel]]. Requiere que la Fase 0 esté fusionada.

---

Eres el desarrollador de este repositorio: el asistente de citas por WhatsApp y el panel web del consultorio del Dr. Dennis René Flores. Esta fase construye la base de datos, la seguridad de acceso y un panel funcional con datos ficticios. Sin WhatsApp ni Calendar. Trabajas con compuerta: auditas sin cambiar nada, esperas mi "aprobado" e implementas.

## Lee primero (sin modificar nada)

1. `AGENTS.md`, `CLAUDE.md`.
2. `docs/architecture/INDEX.md`, `CONVENTIONS.md`, `agents.md`, `modules-overview.md`.
3. `docs/architecture/infrastructure/supabase-schema.md` y `security-and-privacy.md`.
4. Todos los ADR, en especial 0001, 0002, 0007, 0008, 0009 y 0010.
5. `docs/requirements/respuestas-doctor-cuestionario.md`.
6. `docs/plans/fase-0-5-esquema-y-panel.md`: es el contrato.
7. `docs/plans/fase-0-auditoria.md` y el estado actual del código.

## Parte A — Auditoría (solo lectura)

El único archivo que puedes crear es `docs/plans/fase-0-5-auditoria.md`. No instales nada ni apliques migraciones.

La auditoría contiene:

1. Revisión del esquema de `supabase-schema.md` contra las respuestas del doctor: `birth_date`, teléfono de la secretaria, citas de 30 minutos, horario por día, `slot_capacity`. Cambios que propones y por qué.
2. Diseño de RLS y de las funciones `is_doctor()` e `is_secretary()`. Qué ve cada rol, tabla por tabla, y cómo se enmascara el DUI para la secretaria.
3. Diseño del cifrado del DUI: AES-256-GCM, formato de almacenamiento, origen de la clave, HMAC para duplicados. Qué se prueba.
4. Evaluación de [[0002-runtime-del-backend]]: Opción A (API aparte con worker) frente a Opción B (Next.js único con cron). Tabla comparativa de complejidad, costo mensual, límites de plan y riesgos, con tu recomendación. No la implementes.
5. Autenticación: Supabase Auth, tabla `staff_users`, cómo se verifica el rol en el servidor y si la autenticación en dos pasos es viable con el plan.
6. Pantallas del panel y los datos que cada una consulta. Qué se consulta en cada rol.
7. Datos ficticios: qué se siembra, cómo se marca como ficticio y cómo se evita que lleguen a producción.
8. Plan de pruebas: RLS por rol, cifrado, panel por rol.
9. Plan de la Parte B en pasos pequeños con criterio de "hecho".
10. Decisiones que necesito tomar (máximo 8), cada una con tu recomendación.
11. Riesgos de privacidad y de migraciones.

Termina con "Esperando aprobación de la Parte B." y detente.

## Parte B — Implementación (solo después de "aprobado")

Rama `feature/fase-0-5-esquema-y-panel`. Commits pequeños. Lint, tipos, build y pruebas después de cada paso.

**B1. Migraciones.** Esquema aprobado, índices y semillas de `appointment_types` y `availability_rules` (horario del doctor). Aplicables desde cero en Supabase local con un comando.

**B2. RLS.** Funciones `is_doctor()` e `is_secretary()` (`SECURITY DEFINER`), políticas por tabla y pruebas con usuarios ficticios de cada rol.

**B3. Cifrado.** Utilidad en `src/lib/crypto/` para cifrar y descifrar el DUI y para calcular su HMAC. Pruebas unitarias. La clave viene de la variable de entorno y nunca se escribe en logs.

**B4. Autenticación.** Login, cierre de sesión, `requireRole()` en el servidor y guardia de layout. Autenticación en dos pasos según la auditoría.

**B5. Panel.**
- `/panel`: redirige según el rol.
- `/panel/semana` (doctor): pacientes de la semana por día, con estado.
- `/panel/agenda`: vista semanal, solo lectura en esta fase.
- `/panel/casos`: casos pendientes, con estado y asignación.
- `/panel/sin-vincular`: eventos de calendario sin paciente.
- `/panel/pacientes`: búsqueda por nombre o teléfono; DUI enmascarado, completo solo para el doctor con registro en `audit_log`.

**B6. Datos ficticios.** Script de semilla con prefijo "Paciente de Prueba". Debe negarse a correr si la URL de Supabase no es local.

**B7. Pruebas.** Playwright por rol contra Supabase local y pruebas unitarias.

**B8. Documentación.** `supabase-schema.md` pasa a `en-curso` con `verified_commit`. Crea los documentos del panel con el esquema de `CONVENTIONS.md`. Registra la decisión de `0002` actualizando su ADR o creando uno nuevo. Entrada en `docs/log/CHANGELOG.md`.

**B9. Reporte final.** Qué hiciste, qué no pudiste verificar y las decisiones que siguen abiertas.

## Reglas de esta fase

- No llames a Meta ni a Google. No hay WhatsApp ni Calendar en esta fase.
- Solo Supabase local. Una migración ya aplicada nunca se edita.
- Ningún dato real de pacientes; solo ficticios.
- El DUI nunca aparece en logs, ni en pruebas con valores reales.
- No hagas push a `main`.
