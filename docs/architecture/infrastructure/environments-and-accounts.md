---
title: Entornos y registro de cuentas
status: en-curso
scope: cuentas y servicios externos del proyecto
last_updated: 2026-11-25
verified_commit: n/a
---

# Entornos y registro de cuentas

Registro de cada cuenta o servicio, de quién es y en qué estado está. Las cuentas quedan a nombre del doctor ([[respuestas-doctor-cuestionario]]). Aquí nunca van contraseñas, tokens ni claves: solo qué existe, quién administra y dónde vive el secreto.

---

## Cuentas y servicios

| Servicio | Titular | Administradores | Estado | Dónde vive el secreto | Notas |
|---|---|---|---|---|---|
| Portafolio de negocio de Meta | Dr. Dennis René Flores | Doctor; Alí pendiente | Creado 2026-10-20. Business ID 1671046891334842. Perfil completo (nombre legal, dirección y sitio web) desde 2026-11-25; sin verificar | Cuenta de Facebook del doctor | En Meta figura "Clinica de Reumatologia Dr. Dennis Flores", sin tildes. Falta alinear el nombre legal con los documentos |
| App de Meta (WhatsApp) | Portafolio del doctor | Alí | Creada 2026-11-25: "Citas Consultorio Dr Flores", App ID 1517454403604135, modo desarrollo, caso de uso WhatsApp Business Messaging, conectada al portafolio | `WHATSAPP_APP_SECRET` en el host (todavía no se ha generado ni copiado) | Creada con el MCP `meta-devtools`. Correo de contacto: el de Alí. Sin número, webhook ni usuario del sistema todavía |
| Cuenta de WhatsApp Business | Portafolio del doctor | — | Pendiente | — | Ver [[whatsapp-integration]] |
| Número del consultorio | Doctor | — | Línea del consultorio (no personal). En la app WhatsApp Business desde octubre de 2026; no registrado en la API | SIM del consultorio | Pasa solo a la Cloud API el día del corte, con la bandeja del panel lista ([[0011-numero-whatsapp-coexistencia]]) |
| Usuario del sistema de Meta | Portafolio del doctor | Alí | Pendiente | Gestor de contraseñas y `WHATSAPP_ACCESS_TOKEN` en el host | Rotación: [[runbook-rotar-token]] |
| Google (calendario) | Doctor | Doctor; secretaria y Alí con edición | Por confirmar cuenta y dueño | `GOOGLE_REFRESH_TOKEN` en el host | Ver [[google-calendar-sync]] |
| Supabase | Doctor | Alí | Pendiente | Variables del host y gestor | Elegir región y plan |
| Hosting de la aplicación | Alí (temporal); doctor al pasar a un plan de pago | Alí | Activo desde 2026-11-25: proyecto Vercel `clinicadrdennis` en el equipo personal de Alí (plan Hobby), conectado a `AliCheves/clinicadrdennis`, rama `main`, Node 24.x. URL: `https://clinicadrdennis.vercel.app` ([[runbook-desplegar-landing]]) | Variables del host (la landing no usa ninguna) | **Hobby es solo para uso no comercial**: sirve para la revisión de Meta con la URL `*.vercel.app`. Antes de atender pacientes reales hay que pasar a Pro u otro host. El código no depende de Vercel. Ver [[0002-runtime-del-backend]] |
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
