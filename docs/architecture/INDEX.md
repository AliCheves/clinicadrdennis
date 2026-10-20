---
title: Vault de arquitectura — Índice maestro
status: en-curso
scope: todo el proyecto
last_updated: 2026-10-20
verified_commit: n/a
---

# Asistente de citas del Dr. Dennis René Flores — Vault de arquitectura

Punto de entrada único a la documentación. El sistema permite a los pacientes agendar, consultar, reprogramar y cancelar citas por WhatsApp, envía recordatorios por WhatsApp y correo, y da al doctor y a la secretaria un panel web. Google Calendar es la agenda única: la secretaria también agenda a mano allí. Es un monolito modular ([[0001-monolito-modular]]) con PostgreSQL en Supabase, la API de WhatsApp Cloud de Meta, Google Calendar y Resend para correo.

Estado general: Fase 0 (cimientos) implementada en la rama `feature/fase-0-cimientos`: app Next.js, landing pública, Supabase local y CI. Lo demás sigue `planificado`; cada documento lo indica en su frontmatter.

---

## Cómo leer este vault

- **"¿Qué pidió el doctor y por qué el sistema es así?"** → [[respuestas-doctor-cuestionario]] → [[0001-monolito-modular]]
- **"¿Qué decisiones están cerradas?"** → [[README-decisiones]]
- **"¿Qué tablas hay?"** → [[supabase-schema]]
- **"¿Qué muestra el sitio público?"** → [[landing]] → [[runbook-desplegar-landing]]
- **"¿Cómo levanto la base de datos local?"** → [[testing-local-supabase]]
- **"¿Cómo se conecta WhatsApp?"** → [[whatsapp-integration]] → [[runbook-meta-whatsapp-setup]]
- **"¿Cómo se sincroniza con Google Calendar?"** → [[google-calendar-sync]]
- **"¿Cómo salen los recordatorios?"** → [[reminders]]
- **"¿Cómo se protegen los datos?"** → [[security-and-privacy]]
- **"¿Qué cuentas y servicios existen y de quién son?"** → [[environments-and-accounts]]
- **"¿Qué módulos hay y qué no pueden tocar?"** → [[modules-overview]]
- **"¿Cómo trabajan las sesiones de Claude Code?"** → [[agents]]
- **"¿Cómo agrego o actualizo un documento?"** → [[CONVENTIONS]]
- **"¿Qué ha pasado hasta ahora?"** → [[CHANGELOG]]
- **"¿Qué se construye en cada fase?"** → [[README-planes]] y [[README-prompts]]

---

## Mapa completo

### Arquitectura

| Doc | Cubre | Estado |
|---|---|---|
| [[supabase-schema]] | Las 12 tablas, índices, semillas y plan de RLS | planificado |
| [[whatsapp-integration]] | Cuenta de Meta, número, plantillas, webhook, ventana de 24 h | planificado |
| [[google-calendar-sync]] | Sincronización en dos vías, avisos push, reserva sin doble cita | planificado |
| [[reminders]] | Recordatorios a 2 días y el mismo día, idempotencia | planificado |
| [[security-and-privacy]] | Clasificación de datos, cifrado del DUI, roles, auditoría, retención | planificado |
| [[environments-and-accounts]] | Registro de cuentas, titulares y estado (sin secretos) | en-curso |
| [[modules-overview]] | Módulos, tablas propias y fronteras | planificado |
| [[landing]] | Landing pública, filtro de datos confirmados, borradores legales | implementado |
| [[testing-local-supabase]] | Supabase local con Docker, puertos, regla de nunca contra producción | implementado |

### Meta

| Doc | Cubre |
|---|---|
| [[CONVENTIONS]] | Esquema de documentos, enlaces y flujo de actualización |
| [[agents]] | Carriles de trabajo, reglas globales y formato del veredicto |

### Decisiones, requisitos, operación y bitácora

| Carpeta | Contenido |
|---|---|
| `docs/decisions/` | ADRs: una decisión por archivo, con su estado |
| `docs/requirements/` | Respuestas del doctor convertidas en normas |
| `docs/plans/` | Plan y auditoría de cada fase |
| `docs/prompts/` | Prompts de Claude Code, uno por fase, con compuerta de auditoría |
| `docs/operations/` | Runbooks y plantilla de incidente |
| `docs/log/` | Bitácora (`CHANGELOG.md`) y notas de sesiones |

---

## Rutas

| Ruta | Grupo | Acceso | Doc | Estado |
|---|---|---|---|---|
| `/` | `(public)` | Público | [[landing]] | implementado |
| `/privacidad` | `(public)` | Público | [[landing]] | implementado (borrador legal) |
| `/terminos` | `(public)` | Público | [[landing]] | implementado (borrador legal) |
| `/robots.txt` | raíz | Público | [[landing]] | implementado |

Las rutas de `(auth)`, `(panel)` y `api/` llegan en [[fase-0-5-esquema-y-panel]] y en fases posteriores.

---

## Mapa de conexiones

```
PACIENTE (WhatsApp)
  mensaje ──────────► Meta Cloud API ──webhook──► conversation
  conversation ─────► agenda ──► sync ──► Google Calendar (evento con appointment_id)
  conversation ─────► patients (consentimiento, DUI cifrado)
  conversation ─────► handoff_requests ──► panel de la secretaria

GOOGLE CALENDAR
  cambio hecho a mano por la secretaria ──aviso push o sondeo──► sync ──► appointments
  evento sin teléfono ───────────────────────────────────────────► panel: "sin vincular"

RECORDATORIOS
  cron ──► reminders ──► plantilla de WhatsApp (Meta) y correo (Resend)
  respuesta del botón Confirmar/Cancelar ──► conversation ──► agenda

PANEL (doctor y secretaria)
  login ──► capa de servidor con verificación de rol ──► tablas (RLS como segunda capa)
  doctor:     "Esta semana", agenda, pacientes, resumen
  secretaria: agenda, casos pendientes, eventos sin vincular, pacientes

TRANSVERSAL
  audit_log ◄── todo acceso o cambio sobre datos de pacientes
```

---

## Variables de entorno (solo nombres; los valores nunca van en el repo)

| Variable | Obligatoria | La usa |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | Clientes de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí | Clientes de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí (servidor) | Tareas del servidor sin sesión: webhook, cron. Uso acotado y documentado |
| `WHATSAPP_ACCESS_TOKEN` | Sí | Token del usuario del sistema de Meta |
| `WHATSAPP_PHONE_NUMBER_ID` | Sí | Envío de mensajes |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Sí | Plantillas |
| `WHATSAPP_APP_SECRET` | Sí | Verificar la firma `X-Hub-Signature-256` del webhook |
| `WHATSAPP_VERIFY_TOKEN` | Sí | Verificación inicial del webhook |
| `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` | Sí | OAuth de Google |
| `GOOGLE_REFRESH_TOKEN` | Sí | Acceso sin conexión al calendario del doctor |
| `GOOGLE_CALENDAR_ID` | Sí | Calendario de las citas |
| `RESEND_API_KEY` | Sí | Correo de recordatorios |
| `RESEND_FROM_EMAIL` | Sí | Remitente (idealmente del dominio del consultorio) |
| `PII_ENCRYPTION_KEY` | Sí | Cifrado AES-256-GCM del DUI |
| `PII_HASH_KEY` | Sí | HMAC del DUI para detectar duplicados |
| `CRON_SECRET` | Sí | Autenticar las llamadas de cron a los endpoints internos |
| `CLINIC_TIMEZONE` | No | Por defecto `America/El_Salvador` |
| `SENTRY_DSN` | No | Monitoreo de errores |

---

## Riesgos conocidos

| Riesgo | Estado | Doc |
|---|---|---|
| Cita hecha a mano sin teléfono: no recibe recordatorios | Abierto: se mitiga con el formato del título y el panel "sin vincular" | [[google-calendar-sync]] |
| Registrar el número real en la API lo saca de la app de WhatsApp | Abierto: decisión pendiente | [[0011-numero-whatsapp-coexistencia]] |
| Horarios y pacientes por día no cuadran con citas de 30 min (35 espacios por semana frente a 44 pacientes) | Abierto: preguntar al doctor | [[respuestas-doctor-cuestionario]] |
| Verificación de Meta Business y aprobación de plantillas toman días | Abierto | [[runbook-meta-whatsapp-setup]] |
| El doctor marcó "1 a 2 semanas" para la primera versión; el plan estima unas 4 semanas para el bot | Abierto: acordar el plazo | [[respuestas-doctor-cuestionario]] |
| No está confirmado si el número es personal del doctor o una línea del consultorio | Abierto: confirmar antes de migrarlo | [[respuestas-doctor-cuestionario]] |
| No está confirmado que exista un Excel de pacientes; los datos anteriores están en papel | Abierto | [[respuestas-doctor-cuestionario]] |
| Datos personales y DUI | Abierto: validación legal pendiente | [[security-and-privacy]] |

---

## Cómo actualizar este vault

Instrucciones completas en [[CONVENTIONS]]. Resumen: tabla nueva → [[supabase-schema]]; plantilla nueva → [[whatsapp-integration]]; ruta nueva → su doc y esta página; decisión nueva → ADR; algo salió mal → incidente y [[CHANGELOG]]; siempre `last_updated`.

## Conexiones

- [[CONVENTIONS]]
- [[agents]]
- [[modules-overview]]
- [[supabase-schema]]
- [[whatsapp-integration]]
- [[google-calendar-sync]]
- [[reminders]]
- [[security-and-privacy]]
- [[environments-and-accounts]]
- [[landing]]
- [[testing-local-supabase]]
- [[CHANGELOG]]
