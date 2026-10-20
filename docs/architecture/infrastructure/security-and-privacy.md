---
title: Seguridad y privacidad
status: planificado
scope: src/lib/crypto/, RLS, manejo de secretos, retención
last_updated: 2026-10-20
verified_commit: n/a
---

# Seguridad y privacidad

El sistema guarda datos personales de pacientes de un consultorio médico. Este documento fija cómo se clasifican, quién los ve y cómo se protegen. Las reglas de arriba son obligatorias; lo marcado como pendiente necesita validación legal antes de operar con pacientes reales.

---

## Clasificación de datos

| Clase | Ejemplos | Tratamiento |
|---|---|---|
| A — sensible | DUI. Más adelante, datos clínicos del expediente | Cifrado a nivel de columna, acceso solo del doctor, auditoría de cada lectura, nunca en logs |
| B — personal | Nombre, teléfono, fecha de nacimiento, correo, citas, mensajes del bot | Acceso solo de doctor y secretaria, por servidor, con RLS |
| C — operativo | Reglas de disponibilidad, plantillas, configuración | Sin restricción especial |

## Responsabilidades

- Cifrar el DUI con AES-256-GCM; la clave (`PII_ENCRYPTION_KEY`) vive fuera de la base de datos. Guardar además un HMAC (`dui_hash`, con `PII_HASH_KEY`) solo para detectar duplicados.
- Pedir consentimiento explícito en el primer mensaje y guardar `consent_at` y `consent_text_version`.
- Registrar en `audit_log` cada lectura de DUI y cada exportación o cambio sobre datos de pacientes.
- Exigir autenticación en dos pasos para el doctor y la secretaria.

## Fronteras

- Nada clínico en WhatsApp, correos, notas de cita ni logs ([[0009-datos-sensibles]]).
- El navegador no accede a tablas de pacientes directamente ([[0010-acceso-a-datos-solo-por-servidor]]).
- Los logs no contienen DUI, teléfonos completos ni textos de mensajes; se enmascaran.
- Ningún secreto en el repositorio. Los secretos viven en las variables del host y en un gestor de contraseñas.

## Roles

| Rol | Ve | Puede hacer |
|---|---|---|
| doctor | Todo, incluido el DUI con auditoría | Gestionar personal, disponibilidad, citas, pacientes |
| secretaria | Agenda, pacientes (DUI enmascarado), casos pendientes, eventos sin vincular | Gestionar citas y casos pendientes |

## Retención y respaldos

- Mensajes del bot: propuesta de borrarlos a los 90 días. Pendiente de validar.
- Respaldos diarios de la base de datos y recuperación a un punto en el tiempo, según el plan elegido. Copia periódica de exportación fuera de la plataforma.
- Ubicación de los servidores de la base de datos: elegir región conscientemente y documentarla en [[environments-and-accounts]].

## Incidentes

Si se sospecha que un secreto se filtró o que se vieron datos que no correspondía: seguir [[plantilla-incidente]], rotar con [[runbook-rotar-token]], registrar en [[CHANGELOG]].

## Pendientes de validación legal

- Qué exige la ley salvadoreña de protección de datos personales para datos de salud y para el DUI.
- Texto de consentimiento y aviso de privacidad.
- Tiempo de conservación de datos y mensajes.
- Transferencia a servidores fuera del país.
- Si en el futuro se usa inteligencia artificial sobre datos clínicos, enviar esos datos a un proveedor externo necesita validación aparte; queda fuera de alcance hasta tenerla.

## Notas

- El expediente clínico y el resumen para aseguradoras están planteados como Fase 5, después del piloto. Elevan la clase de datos a A para todo el módulo.

## Conexiones

- [[INDEX]]
- [[agents]]
- [[supabase-schema]]
- [[environments-and-accounts]]
- [[plantilla-incidente]]
- [[runbook-rotar-token]]
- [[0009-datos-sensibles]]
- [[0010-acceso-a-datos-solo-por-servidor]]
