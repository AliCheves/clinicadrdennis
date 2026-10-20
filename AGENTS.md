# Instrucciones para agentes — Asistente de citas del Dr. Dennis René Flores

Proyecto: asistente de citas por WhatsApp y panel web (doctor y secretaria) para un consultorio de reumatología en San Salvador, El Salvador. Las cuentas (Meta, hosting, base de datos) quedan a nombre del doctor.

## Fuente de verdad

- Arquitectura: `docs/architecture/`. Empieza siempre por `docs/architecture/INDEX.md`.
- Decisiones cerradas: `docs/decisions/` (un ADR por decisión).
- Requisitos del doctor: `docs/requirements/`.
- Qué ha pasado y cuándo: `docs/log/CHANGELOG.md` y `docs/log/sesiones/`.
- Cómo se opera: `docs/operations/` (runbooks).
- Planes y auditorías por fase: `docs/plans/`. Prompts de cada fase: `docs/prompts/`.
- Si el código y la documentación se contradicen, detente y repórtalo. No adivines cuál es la correcta.

## Reglas duras (nunca)

1. Nunca secretos en el repo, logs, tests, capturas ni mensajes de commit. Solo variables de entorno; `.env.example` lleva nombres sin valores.
2. Nunca datos reales de pacientes en el repo, semillas, tests, logs ni capturas. Solo datos ficticios con prefijo "Paciente de Prueba".
3. Nada clínico (diagnósticos, síntomas, tratamientos, resultados) en WhatsApp, correos, notas de cita ni logs. Ver ADR-0009.
4. El DUI se guarda cifrado (AES-256-GCM, clave fuera de la base de datos), nunca se escribe en logs y nunca se muestra completo salvo al doctor con registro de auditoría.
5. Pruebas y herramientas de desarrollo solo contra Supabase local (Docker). Nunca contra el proyecto de producción.
6. Migraciones solo hacia adelante: nunca editar ni borrar una migración ya aplicada; se corrige con una migración nueva.
7. No hacer push a `main`. Todo cambio va por rama y pull request.
8. No registrar el número real de WhatsApp del consultorio en la API ni enviar mensajes a pacientes reales sin aprobación explícita de Alí (ADR-0011). Las pruebas usan el número de pruebas de Meta o teléfonos de Alí.
9. No inventar datos del doctor o del consultorio: credenciales, títulos, años de experiencia, precios, testimonios. Si un dato no está en `src/config/content/clinic.ts`, no se muestra.
10. Fechas en UTC (`timestamptz`) en la base de datos; se muestran en `America/El_Salvador`. Ver ADR-0007.

## Flujo de trabajo por fase

1. **Auditoría (solo lectura).** Entrega `docs/plans/<fase>-auditoria.md` y se detiene.
2. **Aprobación de Alí.** Sin "aprobado" explícito no hay implementación.
3. **Implementación** en una rama `feature/<fase>`, con commits pequeños.
4. **Verificación:** lint, tipos, build y pruebas. Se reporta qué pasó y qué no se pudo correr.
5. **Documentación:** actualizar los docs tocados (`last_updated`, `status`), crear el ADR si hubo una decisión nueva.
6. **Bitácora:** una entrada en `docs/log/CHANGELOG.md`.
7. **Reporte** a Alí: qué cambió, qué falta, qué decisiones necesitan su respuesta.

## Estructura de código (cuando exista)

```
src/
  app/
    (public)/      landing, /privacidad, /terminos
    (auth)/        login y recuperación
    (panel)/       panel del doctor y la secretaria
    api/           webhooks y endpoints de cron
  modules/
    conversation/  agenda/  patients/  reminders/  sync/
  lib/             supabase, crypto, whatsapp, google, email
  config/content/  texto estático
  types/
```

- Cada módulo expone una sola puerta, su `index.ts`. Un módulo nunca importa archivos internos de otro (ADR-0001).
- Sin lógica de negocio dentro de componentes. Sin datos estáticos dentro de JSX.

## Definición de hecho

- Lint, tipos, build y pruebas en verde, o el motivo escrito de lo que no corrió.
- Docs actualizados según `docs/architecture/CONVENTIONS.md`.
- Entrada en `docs/log/CHANGELOG.md`.
- Ningún secreto ni dato real de paciente en el diff.

## Git

Los commits usan solo la identidad humana configurada (AliCheves). No se añaden co-autores de IA ni líneas "Generated with". Esta regla se heredó del repositorio del autódromo; si ya no aplica, se cambia aquí.
