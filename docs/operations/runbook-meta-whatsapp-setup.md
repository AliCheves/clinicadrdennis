---
title: Runbook — Alta de WhatsApp Business en Meta
status: en-curso
scope: portafolio de Meta, app, número, plantillas, webhook
last_updated: 2026-10-20
---

# Runbook — Alta de WhatsApp Business en Meta

Pasos para dejar la cuenta lista, en el orden que evita cerrar puertas. El número real no se registra en la API hasta decidir [[0011-numero-whatsapp-coexistencia]]. Las cuentas quedan a nombre del doctor ([[environments-and-accounts]]).

## Antes de salir

- [ ] Teléfono con el WhatsApp del consultorio y su SIM (llegan códigos de verificación).
- [ ] Tarjeta de pago a nombre del doctor o su autorización.
- [ ] Datos legales del consultorio y documentos para la verificación de Meta Business.
- [ ] Laptop con acceso a la cuenta de Meta de Alí.

## Antes de tocar el número

- [ ] Confirmar con el doctor si el número es su número personal o una línea del consultorio.
- [ ] Respaldar los chats del WhatsApp actual.
- [ ] Pasar el número a WhatsApp Business (instalar la app, verificar el mismo número y aceptar la migración).
- [ ] Doctor crea el portafolio de negocio de Meta con su Facebook. **Hecho el 2026-10-20**: "Clínica de Reumatología Dr. Dennis Flores".
- [ ] Meta exige una URL de sitio web válida para guardar la información del negocio. Usar una página social del consultorio si existe, o la landing de [[fase-0-cimientos]] cuando esté publicada.
- [ ] Alinear el nombre legal con los documentos: letra por letra. Hoy el formulario dice "Clinica Dr Dennis Flores" sin tilde y el portafolio "Clínica de Reumatología Dr. Dennis Flores".
- [ ] Agregar a Alí como administrador del portafolio.
- [ ] Crear la app en developers.facebook.com con el producto WhatsApp, enlazada al portafolio, con Alí como administrador de la app.
- [ ] Aceptar los términos de la API de WhatsApp Business Cloud (lo hace un administrador del negocio).

## Con el número de pruebas de Meta

- [ ] Enviar una plantilla de prueba al teléfono de Alí.
- [ ] Anotar el identificador del número y el de la cuenta de WhatsApp Business en [[environments-and-accounts]].
- [ ] Definir el token de verificación del webhook. La dirección real llega con el backend.

## Trámites que toman días

- [ ] Iniciar la verificación de Meta Business con los documentos del doctor.
- [ ] Agregar el método de pago.
- [ ] Crear un usuario del sistema y generar su token permanente. Guardarlo en un gestor de contraseñas, nunca en el chat ni en el repositorio.
- [ ] Redactar y enviar a aprobación las plantillas de [[whatsapp-integration]], incluida la de aviso a la secretaria.

## Decisión sobre el número real

- [ ] Ver si Meta ofrece el modo coexistencia para +503 durante el alta.
- [ ] Si no, elegir entre un número nuevo para el bot o pasar el actual a la API con bandeja de respuestas en el panel.
- [ ] No registrar el número real en la API hasta decidirlo.

## Google

- [ ] Anotar con qué cuenta de Gmail está el calendario y quién es el dueño.
- [ ] Pedir que lo compartan con edición con la secretaria y con Alí.

## Qué pasó el 2026-10-20

Ver [[2026-10-20-sesion-clinica]].

## Conexiones

- [[whatsapp-integration]]
- [[environments-and-accounts]]
- [[0011-numero-whatsapp-coexistencia]]
- [[runbook-rotar-token]]
- [[fase-0-cimientos]]
