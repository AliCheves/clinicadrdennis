---
title: Seguridad y privacidad
status: en-curso
scope: src/lib/crypto/, RLS, manejo de secretos, retención
last_updated: 2026-11-25
verified_commit: 7755854
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

- Cifrar el DUI con AES-256-GCM; la clave (`PII_ENCRYPTION_KEY`) vive fuera de la base de datos. Guardar además un HMAC (`dui_hash`, con `PII_HASH_KEY`) solo para detectar duplicados. **Implementado (Fase 0.5):**
  - `src/lib/crypto/` usa el formato `versión ‖ IV(12) ‖ etiqueta(16) ‖ cifrado`, con IV aleatorio.
  - Normaliza el DUI a 9 dígitos y exige claves de 32 bytes distintas.
  - Los errores no incluyen el valor.
  - Tiene 9 pruebas unitarias.
- **Implementado:**
  - La columna `dui_encrypted` no se puede leer con `SELECT` por nadie del lado del cliente.
  - El doctor la obtiene con `doctor_get_dui()`, que registra `dui_revelado` en `audit_log` en la misma transacción.
  - La secretaria solo ve "Registrado" o "No registrado" (decisión D3).
- Pedir consentimiento explícito en el primer mensaje y guardar `consent_at` y `consent_text_version`.
- Registrar en `audit_log` cada lectura de DUI y cada exportación o cambio sobre datos de pacientes.
- Exigir autenticación en dos pasos para el doctor y la secretaria. **Pendiente:** TOTP de Supabase Auth, obligatorio antes de la Fase 3 (datos reales); decisión D2. En la Fase 0.5 hay login con correo y contraseña y verificación del rol en el servidor.

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
