---
title: Respuestas del doctor al cuestionario
status: implementado
scope: requisitos del consultorio; norma para toda decisión de arquitectura
last_updated: 2026-10-20
fuente: PDF "Preguntas Dr. Denis" contestado por el Dr. Dennis René Flores
---

# Respuestas del doctor al cuestionario

Respuestas del Dr. Dennis René Flores al cuestionario de 16 preguntas, recibidas el 2026-10-10. Cada fila dice qué marcó, qué escribió y qué norma de arquitectura crea. Estas respuestas mandan sobre cualquier suposición anterior del proyecto.

Fuente: el PDF contestado. Las casillas marcadas se leyeron de la imagen del PDF; los comentarios son texto del doctor. Donde el doctor marcó dos opciones, se registran ambas.

---

## Respuestas y normas

| # | Tema | Marcó | Comentó | Norma de arquitectura |
|---|---|---|---|---|
| 1 | Agenda actual | Papel o cuaderno; Google Calendar | "Desde hace 15 días se inició a través de Google Calendar precisamente para migrar datos digitalmente" | Calendar es la agenda ([[0003-calendar-fuente-de-verdad]]). Los datos anteriores están en papel; la existencia de un Excel no está confirmada |
| 2 | Horario | Varía según el día | Lunes y viernes 1:00 a 5:30 pm; martes sin consulta; miércoles y jueves 3:00 a 5:30 pm; sábado 8:00 a 11:30 am | Reglas de disponibilidad por día de la semana ([[supabase-schema]]) |
| 3 | Pacientes al día | — | Lunes y viernes 10; miércoles y jueves 8; sábados 8 | Volumen de unas 44 citas por semana ([[0001-monolito-modular]]) |
| 4 | Tipos de cita | Primera vez 30 min; Control 30 min | — | Duración por tipo en `appointment_types`, nunca fija en el código |
| 5 | Consultorios | Un solo consultorio | — | [[0008-un-doctor-un-consultorio]] |
| 6 | Anticipación máxima para agendar | Hasta 2 semanas | — | El bot ofrece solo fechas dentro de 14 días |
| 7 | Cancelar o reprogramar | Con mínimo 24 horas de anticipación | — | Pasado ese límite el bot no cancela: explica que debe llamar y crea un caso pendiente |
| 8 | Quién agenda | Ambas: a mano y por el asistente | "Necesito que sea Mixto, pero siempre lo realizarán por Calendar" | Sincronización en dos vías con Calendar ([[google-calendar-sync]]) |
| 9 | Si el bot no resuelve | La secretaria responde desde el mismo número de WhatsApp; el asistente avisa a la secretaria para que escriba al paciente | — | La secretaria debe poder responder desde el número del consultorio: exige coexistencia o una bandeja de respuestas en el panel ([[0011-numero-whatsapp-coexistencia]]) |
| 10 | Cómo avisar a la secretaria | Mensaje de WhatsApp a su número; panel web con lista de casos pendientes | "Si no es complicado y puede realizarse el panel web sería lo ideal" | Aviso por plantilla de WhatsApp al número de la secretaria y panel de casos pendientes ([[whatsapp-integration]]) |
| 11 | Número de WhatsApp | Sí, con WhatsApp normal (el mismo personal) | "Existe un número con WhatsApp Estándar que se puede migrar a Business exclusivamente para pacientes" | Pasar el número a WhatsApp Business. Falta confirmar si es el número personal del doctor o una línea del consultorio |
| 12 | Datos del paciente nuevo | Nombre, teléfono y fecha de nacimiento; nombre, DUI y datos de contacto | "Agregar correo electrónico si posee" | Se piden: nombre, teléfono, fecha de nacimiento, DUI, contacto y correo si tiene. DUI cifrado ([[0009-datos-sensibles]]) |
| 13 | Seguimiento | Recordatorio y confirmación de la cita | "Debe recordarle al paciente 2 días previos y el día de la consulta, tanto por WhatsApp y correo electrónico si el paciente posee" | [[reminders]], [[0012-recordatorios-idempotentes]]. Sin mensaje posconsulta ni recordatorio de controles por ahora |
| 14 | Titular de las cuentas | Dr. Denis (cuentas del consultorio) | "Dr. Dennis René Flores" | [[0005-whatsapp-cloud-api-directo]]; [[environments-and-accounts]] |
| 15 | Costos mensuales | Se busca mantenerlos bajos | "Lo que se necesite para que funcione adecuadamente" | Servicios gestionados y confiables, sin pagar de más |
| 16 | Plazo de la primera versión | En 1 a 2 semanas | "No tengo prisa pero lo antes posible, es decir buen trabajo en el tiempo que consideren" | Calidad sobre velocidad; alinear expectativa de plazo ([[README-planes]]) |

---

## Puntos abiertos y contradicciones

1. **Capacidad.** Con citas de 30 minutos los horarios dan 35 espacios por semana (lunes 9, miércoles 5, jueves 5, viernes 9, sábado 7) y el doctor reporta 44 pacientes. Hay que saber si los controles duran menos de 30 minutos o si atiende más de un paciente por franja (`slot_capacity`).
2. **Plazo.** Marcó "1 a 2 semanas" y escribió que no tiene prisa. El plan del proyecto estima unas 4 semanas para el bot con recordatorios y unas 7 con panel y piloto. Hay que acordar el plazo con él.
3. **Costos.** Marcó mantenerlos bajos y escribió "lo que se necesite". Presentar el estimado mensual antes de contratar planes de pago.
4. **Número de WhatsApp.** "El mismo personal" no aclara si es su número personal o una línea del consultorio. Confirmarlo antes de pasarlo a Business o a la API.
5. **Excel.** Marcó papel o cuaderno y Calendar; no mencionó un Excel. Confirmar si existe y qué columnas tiene antes de planear una importación.
6. **Cuenta de Google.** No indicó con qué correo está el calendario.
7. **Hora de los recordatorios.** No la indicó. El recordatorio del mismo día del sábado no debería salir a las 7:00 si atiende desde las 8:00.
8. **Respuesta de la secretaria.** Marcó que responde desde el mismo número y que el bot le avisa por WhatsApp y por panel: define dos plantillas y una decisión de número ([[0011-numero-whatsapp-coexistencia]]).

## Notas

- El doctor aparece como "Dr. Denis" en el cuestionario y firma "Dr. Dennis René Flores". En todo el proyecto se usa Dennis.
- La especialidad del consultorio, según el nombre del portafolio de Meta, es reumatología.

## Conexiones

- [[INDEX]]
- [[supabase-schema]]
- [[google-calendar-sync]]
- [[whatsapp-integration]]
- [[reminders]]
- [[security-and-privacy]]
- [[environments-and-accounts]]
