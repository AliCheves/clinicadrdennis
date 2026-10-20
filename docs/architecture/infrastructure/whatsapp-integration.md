---
title: Integración con WhatsApp (Meta Cloud API)
status: planificado
scope: src/lib/whatsapp/, src/modules/conversation/, src/app/api/whatsapp/
last_updated: 2026-10-20
verified_commit: n/a
---

# Integración con WhatsApp (Meta Cloud API)

El bot usa la API de WhatsApp Cloud de Meta directamente, sin intermediario ([[0005-whatsapp-cloud-api-directo]]). Recibe mensajes por un webhook, responde con botones y listas (bot determinista, [[0004-bot-determinista-sin-ia]]) y envía recordatorios con plantillas aprobadas por Meta.

---

## Estado de la cuenta (2026-10-20)

| Pieza | Estado |
|---|---|
| Portafolio de negocio de Meta | Creado el 2026-10-20 con la cuenta del doctor, nombre "Clínica de Reumatología Dr. Dennis Flores" |
| Información del negocio | Formulario abierto; Meta exige una URL de sitio web válida para guardar. Ver [[runbook-meta-whatsapp-setup]] |
| Alí como administrador del portafolio | Pendiente |
| App de desarrollador con producto WhatsApp | Pendiente |
| Verificación de Meta Business | Pendiente (toma días) |
| Método de pago | Pendiente |
| Número del consultorio | Es WhatsApp estándar; falta pasarlo a WhatsApp Business. Decisión sobre coexistencia en [[0011-numero-whatsapp-coexistencia]] |
| Plantillas | Pendientes (nombres propuestos abajo) |
| Webhook | Pendiente; se configura cuando exista un backend desplegado |

## Responsabilidades

- Verificar y recibir el webhook, descartar duplicados, entregar el mensaje a `conversation`.
- Enviar mensajes libres (dentro de la ventana de 24 h) y plantillas (fuera de ella).
- Registrar cada mensaje entrante y saliente, sin contenido clínico.

## Fronteras

- Solo `src/lib/whatsapp/` habla con la API de Meta. Los módulos la usan a través de esa capa.
- El token del usuario del sistema vive solo en variables de entorno ([[INDEX]] § Variables de entorno).
- Nada clínico en los mensajes ([[0009-datos-sensibles]]).

## Datos

- Tablas: `conversations`, `messages`, `handoff_requests` ([[supabase-schema]]).
- Variables: `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`.

## Interfaz

- `GET /api/whatsapp/webhook`: verificación inicial. Compara `hub.verify_token` con `WHATSAPP_VERIFY_TOKEN` y devuelve `hub.challenge`. <!-- verify: nombres exactos de los parámetros contra la documentación vigente de Meta -->
- `POST /api/whatsapp/webhook`: eventos. Valida la firma `X-Hub-Signature-256` (HMAC SHA-256 del cuerpo sin modificar con `WHATSAPP_APP_SECRET`) antes de procesar. <!-- verify: encabezado y algoritmo contra la documentación vigente -->
- Responder 200 rápido y procesar sin bloquear la respuesta.

## Plantillas propuestas

Categoría de utilidad, idioma español. Los textos finales se redactan y envían a aprobación cuanto antes porque Meta tarda.

| Nombre | Cuándo | Botones |
|---|---|---|
| `confirmacion_cita` | Al agendar | Ninguno o Reprogramar / Cancelar |
| `recordatorio_2_dias` | Dos días antes | Confirmar / Reprogramar / Cancelar |
| `recordatorio_dia_cita` | El día de la cita | Confirmar / Cancelar |
| `aviso_caso_pendiente` | Interno: avisa a la secretaria de un caso nuevo, enviado a su número | Ninguno |

Reglas: sin información clínica, sin nombre de la especialidad del paciente ni diagnósticos; solo fecha, hora, lugar y nombre del paciente.

## Flujos

1. **Agendar:** saludo → consentimiento (si es nuevo) → tipo de cita → fecha (solo dentro de los próximos 14 días) → hora → confirmación.
2. **Consultar mi cita:** muestra la próxima cita del paciente.
3. **Reprogramar o cancelar:** con botones, hasta 24 horas antes de la cita. Pasado ese límite el bot explica que debe llamar al consultorio y crea un caso pendiente ([[respuestas-doctor-cuestionario]]).
4. **Hablar con la clínica:** crea un `handoff_request`, lo muestra en el panel y avisa a la secretaria con una plantilla de WhatsApp a su número. La secretaria responde al paciente desde el mismo número del consultorio ([[0011-numero-whatsapp-coexistencia]]).
5. **Recordatorios:** ver [[reminders]].

## Errores y casos borde

- Fuera de la ventana de 24 h solo se pueden enviar plantillas aprobadas.
- Mensaje duplicado: se descarta por `wa_message_id`.
- Si el bot no entiende dos veces seguidas, crea un caso pendiente.
- Si Meta rechaza una plantilla, el recordatorio de WhatsApp pasa a `fallido` y el de correo sigue ([[reminders]]).

## Pruebas

- Con el número de pruebas de Meta y teléfonos de Alí. Nunca con pacientes reales antes del piloto.
- Pruebas automáticas con la firma del webhook simulada y datos ficticios.

## Notas

- Costos por mensaje: verificar la tarifa vigente de Meta antes de cotizar al doctor.
- Datos del modo coexistencia (número usado a la vez en la app de WhatsApp Business y en la API): un proveedor lo lista como no disponible solo en Nigeria y Sudáfrica, sin confirmar El Salvador; requiere la app Business 2.24.17 o más reciente; la voz no está disponible en esos números; Meta desconecta el número tras unos 14 días sin abrir la app. Fuente de un proveedor, no de Meta: <https://app.wassenger.com/help/coexistence>. <!-- verify: confirmar en la documentación de Meta y en el alta real del número -->
- El MCP "WhatsApp Business Tools" de Meta está en beta y sirve para configurar la cuenta (números, plantillas, webhooks), no para correr el bot. Se autentica por OAuth y hay que repetir el inicio de sesión al reiniciar el cliente.

## Conexiones

- [[INDEX]]
- [[modules-overview]]
- [[supabase-schema]]
- [[reminders]]
- [[security-and-privacy]]
- [[environments-and-accounts]]
- [[runbook-meta-whatsapp-setup]]
- [[runbook-rotar-token]]
- [[0004-bot-determinista-sin-ia]]
- [[0005-whatsapp-cloud-api-directo]]
- [[0011-numero-whatsapp-coexistencia]]
