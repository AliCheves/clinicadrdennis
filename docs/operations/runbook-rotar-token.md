---
title: Runbook — Rotar un secreto o token
status: planificado
scope: tokens y claves de Meta, Google, Resend y cifrado
last_updated: 2026-10-20
---

# Runbook — Rotar un secreto o token

Cuándo: sospecha de filtración, salida de una persona con acceso, o rotación periódica. Ningún valor se escribe en el repositorio, en el chat ni en la bitácora; solo se anota qué se rotó y cuándo.

## Token de Meta (`WHATSAPP_ACCESS_TOKEN`)

1. En la configuración del negocio, entrar a Usuarios del sistema y generar un token nuevo para el usuario del sistema, con los permisos de gestión y de mensajería de WhatsApp. <!-- verify: nombres de permisos y menú vigentes en Meta -->
2. Guardarlo en el gestor de contraseñas.
3. Actualizar la variable en el host y redesplegar.
4. Probar enviando una plantilla al teléfono de Alí.
5. Revocar el token anterior.
6. Anotar la rotación en [[CHANGELOG]].

## Otros secretos

| Secreto | Dónde se genera | Después de cambiarlo |
|---|---|---|
| `GOOGLE_REFRESH_TOKEN` | Repetir el consentimiento OAuth con la cuenta del calendario | Verificar que la sincronización sigue ([[google-calendar-sync]]) |
| `RESEND_API_KEY` | Panel de Resend | Enviar un correo de prueba |
| `SUPABASE_SERVICE_ROLE_KEY` | Panel de Supabase | Revisar el webhook y el cron |
| `WHATSAPP_APP_SECRET` | App de Meta | El webhook rechaza firmas viejas: verificar que acepta las nuevas |
| `CRON_SECRET` | Generado al azar | Actualizar en el programador y en el host |
| `PII_ENCRYPTION_KEY` y `PII_HASH_KEY` | **No rotar sin plan** | Cambiarlas invalida los DUI guardados. Antes hace falta un ADR y un procedimiento de re-cifrado |

## Si hubo exposición

Seguir [[plantilla-incidente]] y avisar al doctor el mismo día.

## Conexiones

- [[security-and-privacy]]
- [[environments-and-accounts]]
- [[plantilla-incidente]]
- [[CHANGELOG]]
