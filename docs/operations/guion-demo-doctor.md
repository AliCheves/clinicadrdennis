---
title: Guion de la demostración al doctor (2026-11-26)
status: en-curso
scope: demostración del panel con datos ficticios en la laptop de Alí
last_updated: 2026-11-25
---

# Guion de la demostración al doctor

Cómo mostrar el panel de la Fase 0.5 en la reunión del 2026-11-26. Todo corre en la laptop de Alí contra Supabase **local** con datos 100 % ficticios ("Paciente de Prueba"), sin internet ni servicios en la nube (decisión D8 de [[fase-0-5-auditoria]]).

## Antes de salir (≈10 min)

1. Abrir **Docker Desktop** y esperar a que diga "running".
2. En la carpeta del proyecto:
   ```
   npm run db:start
   npm run db:demo
   npm run build && npm run start
   ```
   - `db:demo` reinicia la base local y siembra la demostración. Las fechas son relativas al día en que se corre, así que **hay que correrlo la misma mañana** para que "Esta semana" sea la semana correcta.
   - Usa `npm run start`, no `npm run dev`: es más rápido y no muestra avisos de desarrollo.
3. Abrir `http://localhost:3000/login` en el navegador.
4. Cuentas de demostración (solo locales; la contraseña no es secreta):
   - `doctor@demo.local`
   - `secretaria@demo.local`
   - Contraseña: `demo-local-2026`
5. Opcional: abrir la secretaria en una ventana privada para mostrar los dos roles lado a lado.

## Orden sugerido (≈15 min)

1. **Contexto (1 min).** "Esto es el panel con pacientes inventados. Todavía no está conectado a WhatsApp ni a Google Calendar; eso llega en la siguiente fase."
2. **Doctor → Esta semana.** Citas por día con estado (programada, confirmada, atendida, no asistió, cancelada) y totales. Navegar a la semana siguiente y a la anterior.
3. **Agenda.** Su horario real (lunes y viernes 1:00–5:30, miércoles y jueves 3:00–5:30, sábado 8:00–11:30, martes sin consulta) con franjas de 30 minutos y las libres. Aquí entra la **pregunta de capacidad**: 35 espacios por semana frente a ~44 pacientes.
4. **Sin vincular.** "Si la secretaria agenda a mano en Calendar sin el formato, la cita aparece aquí para completarla y que reciba recordatorios."
5. **Casos pendientes.** Lo que el asistente no pudo resolver, por ejemplo cancelar con menos de 24 horas. Asignarse un caso y marcarlo resuelto.
6. **Conversaciones.** Vista previa de cómo la secretaria verá y responderá los mensajes de WhatsApp. Explicar el **corte del número** ([[0011-numero-whatsapp-coexistencia]], opción C): ese día, la secretaria responde desde aquí y no desde el celular.
7. **Pacientes.**
   - Buscar "Martínez" o un teléfono "0000-0002".
   - Ficha con próximas citas e historial.
   - **DUI:** la secretaria solo ve "Registrado"; el doctor pulsa "Ver DUI" y queda registrado quién lo vio y cuándo.
8. **Cerrar sesión y entrar como secretaria:** no ve "Esta semana" ni el DUI.

## Preguntas para el doctor

Copiadas de [[fase-0-5-auditoria]]. Anotar las respuestas en [[respuestas-doctor-cuestionario]] y en el CHANGELOG.

1. **Capacidad:** ¿los controles duran menos de 30 minutos? ¿Atiende a dos pacientes por franja en algunos horarios?
2. **Nombre legal exacto**, letra por letra. En Meta aparece "Clinica de Reumatologia Dr. Dennis Flores", sin tildes.
3. **Página web:** ¿confirma nombre, especialidad, dirección y horario para publicarlos? ¿Publicamos el teléfono?
4. **Google Calendar:** ¿con qué cuenta está el calendario y quién es el dueño? ¿Lo comparte con edición con la secretaria y con Alí?
5. **Recordatorios:** ¿a qué hora salen el de dos días antes y el del mismo día, sobre todo los sábados a las 8:00?
6. **Datos anteriores:** ¿existe un Excel de pacientes o todo está en papel?
7. **Corte del número:** ¿qué día y hora convienen, fuera de consulta? ¿Quién avisa a los pacientes con conversaciones abiertas?
8. **Plazo:** fechas para la Fase 1 (el asistente de agendar).

## Qué NO prometer

- Que ya funciona con WhatsApp o con Google Calendar: eso es la Fase 1.
- Cumplimiento legal: la política de privacidad sigue en borrador sin revisión legal ([[security-and-privacy]]).
- Expediente clínico: está planteado para una fase posterior, con validación legal.

## Si algo falla

| Síntoma | Qué hacer |
|---|---|
| "Cannot connect to the Docker daemon" | Abrir Docker Desktop y repetir `npm run db:start` |
| `/login` da 404 | Falta `.env.local`: ver [[testing-local-supabase]] |
| "La base ya tiene pacientes" | Usar `npm run db:demo`, que reinicia antes de sembrar |
| Se cuelga al compilar o al correr | Revisar que iCloud no haya desalojado archivos del proyecto (ver la nota en [[testing-local-supabase]]) |

## Conexiones

- [[panel]]
- [[fase-0-5-auditoria]]
- [[testing-local-supabase]]
- [[respuestas-doctor-cuestionario]]
- [[0011-numero-whatsapp-coexistencia]]
