---
title: Entornos y registro de cuentas
status: en-curso
scope: cuentas y servicios externos del proyecto
last_updated: 2026-10-20
verified_commit: n/a
---

# Entornos y registro de cuentas

Registro de cada cuenta o servicio, de quién es y en qué estado está. Las cuentas quedan a nombre del doctor ([[respuestas-doctor-cuestionario]]). Aquí nunca van contraseñas, tokens ni claves: solo qué existe, quién administra y dónde vive el secreto.

---

## Cuentas y servicios

| Servicio | Titular | Administradores | Estado | Dónde vive el secreto | Notas |
|---|---|---|---|---|---|
| Portafolio de negocio de Meta | Dr. Dennis René Flores | Doctor; Alí pendiente | Creado 2026-10-20 | Cuenta de Facebook del doctor | Nombre: "Clínica de Reumatología Dr. Dennis Flores". Falta alinear el nombre legal con los documentos |
| App de Meta (WhatsApp) | Portafolio del doctor | Alí | Pendiente | `WHATSAPP_APP_SECRET` en el host | Alí debe ser administrador de la app, no solo del negocio |
| Cuenta de WhatsApp Business | Portafolio del doctor | — | Pendiente | — | Ver [[whatsapp-integration]] |
| Número del consultorio | Doctor | — | WhatsApp estándar; migración a Business pendiente | SIM del doctor | Decisión: [[0011-numero-whatsapp-coexistencia]] |
| Usuario del sistema de Meta | Portafolio del doctor | Alí | Pendiente | Gestor de contraseñas y `WHATSAPP_ACCESS_TOKEN` en el host | Rotación: [[runbook-rotar-token]] |
| Google (calendario) | Doctor | Doctor; secretaria y Alí con edición | Por confirmar cuenta y dueño | `GOOGLE_REFRESH_TOKEN` en el host | Ver [[google-calendar-sync]] |
| Supabase | Doctor | Alí | Pendiente | Variables del host y gestor | Elegir región y plan |
| Hosting de la aplicación | Alí (temporal); doctor al pasar a un plan de pago | Alí | Pendiente: Alí conecta el repositorio a Vercel Hobby desde su cuenta ([[runbook-desplegar-landing]]) | Variables del host (la landing no usa ninguna) | **Hobby es solo para uso no comercial**: sirve para la revisión de Meta con la URL `*.vercel.app`. Antes de atender pacientes reales hay que pasar a Pro u otro host. El código no depende de Vercel. Ver [[0002-runtime-del-backend]] |
| Resend (correo) | Doctor | Alí | Pendiente | `RESEND_API_KEY` en el host | Ideal con dominio propio |
| Dominio del consultorio | Doctor | Alí | Pendiente | Registrador | Sirve para la landing, el correo y la verificación de Meta |
| GitHub (repositorio) | Alí | Alí | Creado: `AliCheves/clinicadrdennis`, primer commit el 2026-10-20 | — | Cuenta de Alí; traspaso al doctor por definir. CI con GitHub Actions en cada PR, sin secretos |
| Sentry (errores) | Doctor | Alí | Pendiente | `SENTRY_DSN` | Opcional |

## Entornos

| Entorno | Para qué | Base de datos | WhatsApp |
|---|---|---|---|
| Local | Desarrollo y pruebas | Supabase local (Docker), puertos 554xx ([[testing-local-supabase]]) | Simulado o número de pruebas de Meta |
| CI (GitHub Actions) | Lint, tipos, pruebas y build en cada PR | Ninguna en Fase 0 | Ninguno |
| Producción | Consultorio | Supabase en la nube | Número real, solo tras aprobación de Alí |

No hay entorno de pruebas intermedio por ahora; si se necesita, se documenta aquí.

## Notas

- Un segundo administrador con acceso a cada servicio reduce el riesgo de depender de una sola persona.
- Toda cuenta nueva se anota aquí el mismo día.

## Conexiones

- [[INDEX]]
- [[security-and-privacy]]
- [[whatsapp-integration]]
- [[google-calendar-sync]]
- [[runbook-rotar-token]]
- [[runbook-desplegar-landing]]
- [[testing-local-supabase]]
