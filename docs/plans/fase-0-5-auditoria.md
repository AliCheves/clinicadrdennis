---
title: Fase 0.5 — Auditoría (solo lectura)
status: implementado
scope: esquema, RLS, cifrado del DUI, autenticación, panel base, datos ficticios
last_updated: 2026-11-25
verified_commit: 75a4861
---

# Fase 0.5 — Auditoría (solo lectura)

Entrega de la Parte A de [[01-fase-0-5-esquema-y-panel]] contra el contrato [[fase-0-5-esquema-y-panel]]. No se instaló nada ni se aplicó ninguna migración; este es el único archivo creado. Es un registro histórico: no se vuelve a editar.

Leídos: `AGENTS.md`, `CLAUDE.md`, [[INDEX]], [[CONVENTIONS]], [[agents]], [[modules-overview]], [[supabase-schema]], [[security-and-privacy]], [[google-calendar-sync]], todos los ADR (en especial 0001, 0002, 0007, 0008, 0009, 0010 y la 0011 recién aceptada), [[respuestas-doctor-cuestionario]], [[fase-0-auditoria]] y el código de `main` @ `75a4861`.

**Contexto nuevo desde que se escribió el prompt.** [[0011-numero-whatsapp-coexistencia]] se aceptó el 2026-11-25 con la opción C: la secretaria responderá desde una **bandeja en el panel**. El esquema de esta fase debe dejarla posible, aunque la bandeja se construya en la Fase 1.

---

## 1. Esquema frente a las respuestas del doctor

| Punto | Estado en [[supabase-schema]] | Propuesta |
|---|---|---|
| `patients.birth_date` | Existe | Se mantiene. `CHECK (birth_date <= current_date)` |
| Teléfono de la secretaria | `staff_users.phone_e164` existe | Se mantiene, con un `CHECK` de formato E.164 |
| Citas de 30 min | `appointment_types.duration_min` = 30 | Se mantiene. La duración vive en la tabla, nunca en el código |
| Horario por día | `availability_rules` por día de la semana | Se siembra: lun 13:00–17:30, mié y jue 15:00–17:30, vie 13:00–17:30, sáb 08:00–11:30. Martes sin consulta |
| `slot_capacity` | Default 1 | **Abierto**: 35 espacios por semana frente a 44 pacientes. Se siembra con 1 y paso de 30 min hasta que el doctor responda (D6) |

Cambios que propongo y por qué:

1. **`appointments.calendar_title text`.** La pantalla "sin vincular" tiene que mostrar el título original del evento de Calendar; sin él, la secretaria no sabe qué cita completar.
2. **`appointments.created_by uuid → staff_users`.** Permite saber qué persona del personal creó la cita desde el panel.
3. **`messages.sent_by uuid → staff_users`**, nulo cuando escribe el bot o el paciente. Distingue en la bandeja (opción C) quién respondió. `messages.body` sigue siendo nulo-permitido.
4. **`handoff_requests.resolution_note text`.** Nota operativa al cerrar un caso, nunca clínica.
5. **`patients.source` con `CHECK`** en (`bot`, `panel`, `importacion`, `semilla`). Así el dato ficticio queda marcado también en la base, además del prefijo del nombre.
6. **`updated_at` por trigger** (`set_updated_at()`) en `patients` y `appointments`.
7. **El DUI sin columnas extra.** No se guarda ningún "indicio" en claro: ver D3.
8. Los tipos `enum` se mantienen en español y minúsculas, como en el documento.

No cambian: el teléfono no es único por paciente, `dui_hash UNIQUE` (permite nulos), `messages.wa_message_id UNIQUE` (idempotencia) y `reminders UNIQUE (appointment_id, channel, kind)` ([[0012-recordatorios-idempotentes]]).

## 2. RLS y roles

Funciones `SECURITY DEFINER` con `search_path` fijo, que leen `staff_users` por `auth.uid()` y `active = true`:

- `is_staff()`: doctor o secretaria activos.
- `is_doctor()`
- `is_secretary()`

| Tabla | doctor | secretaria | anónimo |
|---|---|---|---|
| `staff_users` | Lee todos; crea y edita | Lee todos (para asignar casos) | Nada |
| `patients` | Lee, crea, edita | Lee, crea, edita | Nada |
| `patients.dui_encrypted` | **Sin `SELECT` de columna para nadie.** Solo por la función `doctor_get_dui()`, ver abajo | No | Nada |
| `appointment_types`, `availability_rules`, `availability_exceptions` | Lee y edita | Lee | Nada |
| `appointments` | Lee, crea, edita (sin borrar: se cancela) | Igual | Nada |
| `conversations`, `messages`, `handoff_requests` | Lee, crea, edita | Igual | Nada |
| `reminders` | Lee | Lee | Nada. Solo escribe el servidor con la clave de servicio |
| `calendar_sync_state` | Nada | Nada | Nada. Solo la clave de servicio |
| `audit_log` | Lee | Nada | Nada. Nadie edita ni borra; se inserta solo con `log_audit()` |

**Cómo se protege el DUI:**

- Se revoca `SELECT (dui_encrypted)` a `authenticated` y `anon`. Así, ni con la clave anónima en el navegador se puede leer el DUI cifrado.
- El doctor lo obtiene con la función `SECURITY DEFINER` **`doctor_get_dui(patient_id)`**, que en una sola transacción:
  1. Verifica `is_doctor()`.
  2. **Inserta en `audit_log`** (`dui_revelado`).
  3. Devuelve el texto cifrado.
- El servidor lo descifra con `PII_ENCRYPTION_KEY`, que nunca está en la base. Como el registro de auditoría va en la misma transacción, **no se puede ver el DUI sin dejar rastro**.
- La secretaria nunca recibe el DUI ni cifrado: ve "Registrado" o "No registrado" (D3).

**Doble barrera ([[0010-acceso-a-datos-solo-por-servidor]]):**

- Las páginas del panel son componentes de servidor que consultan con la sesión del usuario (`@supabase/ssr`, cookies), así que RLS se aplica siempre.
- El navegador no usa el cliente de Supabase para datos. El login también se hace con acciones de servidor, de modo que el navegador no necesita la clave anónima.
- La clave de servicio no se usa en el panel; queda para el webhook y el cron de fases posteriores.

## 3. Cifrado del DUI

- **Algoritmo:** AES-256-GCM con `node:crypto`. IV aleatorio de 12 bytes por valor y etiqueta de 16 bytes.
- **Formato** en `bytea`: `versión (1 byte = 0x01) ‖ IV (12) ‖ etiqueta (16) ‖ texto cifrado`. La versión permite rotar la clave más adelante.
- **Normalización antes de cifrar:** solo dígitos, 9 dígitos (`########-#`). Si no tiene 9 dígitos, se rechaza.
- **Clave:** `PII_ENCRYPTION_KEY`, 32 bytes en base64, desde una variable de entorno. Se valida longitud al cargar; nunca se registra ni se serializa.
- **Duplicados:** `dui_hash = HMAC-SHA256(PII_HASH_KEY, dui_normalizado)`, con una clave distinta a la de cifrado.
- **Pruebas (Vitest):**
  - Cifrar y descifrar devuelve el original.
  - Dos cifrados del mismo DUI dan bytes distintos (IV aleatorio).
  - Si se altera un byte, el descifrado falla.
  - Una clave incorrecta falla.
  - El HMAC es determinista y cambia con otra clave.
  - Una clave de longitud incorrecta se rechaza.
  - Ningún mensaje de error contiene el DUI.
  - Los DUI de prueba son ficticios y no válidos.

## 4. Runtime del backend ([[0002-runtime-del-backend]])

| Criterio | A: API Fastify + worker pg-boss + panel aparte | B: Next.js único + cron externo |
|---|---|---|
| Piezas para desplegar | 2–3 (API, worker, panel) | 1 |
| Complejidad para un desarrollador | Alta | Baja; mismas convenciones que el autódromo |
| Webhook de WhatsApp | Proceso siempre encendido | Route Handler. Responder rápido con 200 y procesar después |
| Recordatorios | Cola con reintentos | `pg_cron` + `pg_net` de Supabase llaman a un endpoint protegido con `CRON_SECRET` cada 5–15 min. Lo idempotente lo garantiza ADR-0012 |
| Costo mensual estimado | Host de procesos (Railway o Render) ~US$5–20 + Supabase + hosting del panel | Vercel Pro ~US$20 (hace falta igual: Hobby no permite uso comercial) + Supabase |
| Límites de plan | Ninguno especial | Funciones con tiempo límite; suficiente para ~44 citas por semana |
| Riesgos | Más cosas que operar y vigilar | Si el cron de Supabase falla, no salen recordatorios; se mitiga con alertas y reintentos |

**Recomendación: B** (D1). No se implementa en esta fase; solo se registra en el ADR.

## 5. Autenticación

- **Supabase Auth** con correo y contraseña. El enlace `staff_users.auth_user_id → auth.users.id` da el rol.
- **`requireRole(...roles)`** en el servidor:
  1. Valida la sesión con `getUser()`, nunca solo con la cookie.
  2. Lee `staff_users` y exige `active = true`.
  3. Si falla, redirige a `/login`. Si el rol no corresponde, muestra 403.
- La guardia va en el layout de `(panel)` y en cada página o acción, como doble verificación.
- **Dos pasos (TOTP):** Supabase Auth lo trae gratis en todos los planes, con nivel `aal2`. Se implementa la inscripción y la verificación en esta fase. Se **exige** desde que haya datos reales (Fase 3); antes, en local y con datos ficticios, es opcional (D2).
- Sin registro público: las cuentas las crea el doctor o Alí. En local las crea el script de semilla.

## 6. Pantallas del panel

| Ruta | Rol | Consulta |
|---|---|---|
| `/panel` | Ambos | Redirige: doctor → `/panel/semana`, secretaria → `/panel/agenda` |
| `/panel/semana` | Doctor | Citas de lunes a sábado de la semana local, excepto canceladas, agrupadas por día, con estado y tipo. Totales por día y por estado |
| `/panel/agenda` | Ambos | Rejilla semanal: franjas de `availability_rules` y citas encima, incluidas las sin vincular. Navegación entre semanas. Solo lectura en esta fase |
| `/panel/casos` | Ambos | `handoff_requests` con conversación, paciente, motivo, estado y asignado. Filtro por estado. Cambiar estado y asignar (lo único que se puede editar en esta fase) |
| `/panel/sin-vincular` | Ambos | `appointments` con `patient_id IS NULL` y `calendar_title`. Solo lectura |
| `/panel/pacientes` | Ambos | Búsqueda por nombre o teléfono. Ficha con datos de contacto, próximas citas e historial de citas. DUI: secretaria ve "Registrado"; el doctor tiene el botón "Ver DUI", que pasa por `doctor_get_dui()` y queda en la auditoría |
| `/panel/conversaciones` | Ambos | **Vista previa de solo lectura** de la futura bandeja (opción C), con conversaciones ficticias (D4) |

Fechas: se guardan en UTC y la semana y los horarios se calculan en `America/El_Salvador`, UTC−6 sin horario de verano ([[0007-zona-horaria-y-fechas]]), con `@date-fns/tz`.

## 7. Datos ficticios

- **Configuración real del consultorio en migraciones:** `appointment_types` y `availability_rules` salen de las respuestas del doctor y no son datos de pacientes.
- **Datos de demostración:** script `scripts/seed-demo.ts` (`npm run db:seed:demo`). Siembra:
  - 2 cuentas de personal: `doctor@demo.local` y `secretaria@demo.local`, con contraseña local de demo que **no** es secreta.
  - ~40 pacientes "Paciente de Prueba NN", con teléfonos `+5037000xxxx` y DUI ficticios cifrados con claves locales de demo.
  - Citas de la semana pasada, la actual y las dos siguientes, dentro del horario real y con estados variados.
  - Algunos eventos sin vincular, casos pendientes en sus tres estados y conversaciones con mensajes operativos, sin nada clínico.
  - Todo con `source = 'semilla'`.
- **Barreras para que no llegue a producción:**
  1. El script **se niega a correr** si la URL no es `127.0.0.1` o `localhost`.
  2. Requiere además `ALLOW_DEMO_SEED=1`.
  3. `supabase/seed.sql` queda vacío: `supabase db push` no siembra, pero `db reset` sí ejecutaría `seed.sql`.
  4. Las migraciones no contienen ningún paciente.
- **Demostración para el doctor:** se muestra en la laptop de Alí contra el Supabase local. **No se despliega el panel** con datos de demo a ningún servidor (D5, D8).

## 8. Plan de pruebas

| Capa | Herramienta | Qué |
|---|---|---|
| RLS | `supabase test db` (pgTAP) | Por rol (doctor, secretaria, autenticado sin rol, anónimo): qué filas y columnas ve y qué puede escribir. La secretaria no puede leer `dui_encrypted` ni llamar `doctor_get_dui()`. Cada llamada del doctor deja auditoría. `audit_log` no se puede editar ni borrar |
| Cifrado | Vitest | Ver §3 |
| Lógica | Vitest | Semana local en UTC−6, franjas desde `availability_rules`, enmascarado y formato |
| Panel | Playwright contra Supabase local con la semilla | Login de cada rol. Redirección de `/panel`. La secretaria no entra a `/panel/semana`. El DUI no aparece en el HTML para la secretaria; el doctor lo ve y queda auditado. Sin sesión redirige a `/login`. Sin scroll horizontal a 375 px. Sin violaciones axe |
| Regresión | Lo de la Fase 0 | La landing sigue igual |

En CI: un trabajo nuevo levanta Supabase local en el runner (Docker), aplica las migraciones y corre pgTAP y Playwright del panel (D7).

## 9. Plan de la Parte B

Rama `feature/fase-0-5-esquema-y-panel`. Después de cada paso: lint, tipos, pruebas y build.

| Paso | Qué | Hecho cuando |
|---|---|---|
| B1 | Migraciones: extensiones, tipos, 12 tablas con los cambios de §1, índices, triggers, semillas de tipos y horario | `supabase db reset` aplica desde cero sin errores. `supabase-schema.md` coincide |
| B2 | RLS: funciones de rol, políticas, revocación de columna, `doctor_get_dui()`, `log_audit()` + pgTAP | `supabase test db` en verde para los 4 perfiles |
| B3 | `src/lib/crypto/`: `encryptDui`, `decryptDui`, `hashDui`, carga de claves | Vitest en verde. La clave no aparece en ningún log |
| B4 | Auth: `@supabase/ssr`, login y logout con acciones de servidor, `requireRole`, guardia de layout, TOTP opcional | Playwright: login, logout, sin sesión → `/login`, rol incorrecto → 403 |
| B5 | Panel: las 7 rutas de §6, con lógica en `src/modules/*` y su `index.ts`, sin datos estáticos en JSX | Cada pantalla carga con la semilla y respeta el rol. 375 px y axe |
| B6 | Semilla de demo con sus barreras | Corre en local. Contra una URL no local se niega con un mensaje claro |
| B7 | Pruebas por rol y CI con Supabase | CI en verde |
| B8 | Docs: `supabase-schema` pasa a `en-curso`, docs del panel, ADR-0002, INDEX, módulos, CHANGELOG | Según [[CONVENTIONS]] |
| B9 | Reporte, y guion de demostración para la reunión con el doctor | Entregado |

## 10. Decisiones para Alí

1. **D1 — Runtime ([[0002-runtime-del-backend]]).** Recomiendo **B**: Next.js único, con `pg_cron` de Supabase llamando a endpoints con `CRON_SECRET`. Hay un solo despliegue y es lo que ya conoces del autódromo.
2. **D2 — Dos pasos (TOTP).** Recomiendo implementarlo ahora, pero **exigirlo desde la Fase 3** (datos reales). En la demo con datos ficticios no estorba.
3. **D3 — DUI para la secretaria.** Recomiendo que vea solo "Registrado" o "No registrado", sin dígitos. No guardar ningún dígito en claro.
4. **D4 — Vista previa de la bandeja.** Recomiendo incluir `/panel/conversaciones` **solo lectura** con datos ficticios: el esquema ya lo permite y le muestra al doctor cómo se verá la opción C. Responder desde ahí llega en la Fase 1.
5. **D5 — Panel en producción.** Recomiendo que `/panel` y `/login` respondan **404 si Supabase no está configurado**. Así el despliegue de Vercel de la landing no expone un login roto.
6. **D6 — Capacidad.** Recomiendo sembrar `slot_capacity = 1` y paso de 30 min, y **preguntárselo mañana al doctor**. Se corrige con una migración nueva.
7. **D7 — CI con Supabase.** Recomiendo un trabajo de CI aparte con Supabase local (pgTAP y Playwright del panel). Suma unos 3–4 min por PR.
8. **D8 — Demostración.** Recomiendo mostrarla en tu laptop con la semilla local. No crear todavía el proyecto de Supabase en la nube con datos de demo.

## 11. Riesgos

| Riesgo | Mitigación |
|---|---|
| Datos ficticios en producción | Script con dos barreras, `seed.sql` vacío, migraciones sin pacientes |
| Migración riesgosa al aplicarse en la nube | Hoy no hay proyecto en la nube. La primera migración se aplica sobre una base vacía. Las siguientes siguen [[agents]] § Las migraciones son un despliegue |
| Fuga del DUI | Columna sin `SELECT`, función auditada, descifrado solo en el servidor, nunca en logs ni en el HTML de la secretaria, probado con pgTAP y Playwright |
| Clave de cifrado perdida | Sin ella, los DUI no se recuperan. En producción, guardarla en el gestor de contraseñas además del host (runbook en la Fase 3) |
| Texto libre de pacientes con datos clínicos en `messages.body` | Es inevitable en el chat. Se trata como clase B, nunca va a logs y la retención de 90 días queda pendiente de validación legal ([[security-and-privacy]]) |
| El doctor confunde la demo con datos reales | Los nombres "Paciente de Prueba", un aviso fijo "Datos de demostración" en el panel cuando `source = 'semilla'` y la explicación en el guion |
| Tiempo: la demo es mañana | Orden de B priorizando lo visible: B1–B2 → B4 → B5 con semilla (B6) → pruebas y documentación |

## Preguntas para la reunión con el doctor (mañana)

1. **Capacidad:** con citas de 30 min hay 35 espacios por semana y él reporta unos 44 pacientes. ¿Los controles duran menos? ¿Atiende a dos por franja en algunos horarios?
2. **Nombre legal exacto**, letra por letra: en Meta aparece "Clinica de Reumatologia Dr. Dennis Flores", sin tildes. ¿Cuál va en la página y en los documentos?
3. **Datos de la página web:** ¿confirma nombre, especialidad, dirección y horario para publicarlos? ¿Y el teléfono?
4. **Google Calendar:** ¿con qué cuenta está el calendario y quién es el dueño? ¿Lo comparte con edición con la secretaria y con Alí?
5. **Recordatorios:** ¿a qué hora salen el del día anterior y el del mismo día, sobre todo los sábados a las 8:00?
6. **Datos anteriores:** ¿existe un Excel de pacientes o todo está en papel?
7. **El corte del número** (opción C): explicarle que el día que el bot entre, la secretaria responderá desde el panel y no desde el celular.
8. **Plazo:** acordar fechas con lo que se vea en la demo.

## Conexiones

- [[fase-0-5-esquema-y-panel]]
- [[01-fase-0-5-esquema-y-panel]]
- [[supabase-schema]]
- [[security-and-privacy]]
- [[modules-overview]]
- [[0002-runtime-del-backend]]
- [[0009-datos-sensibles]]
- [[0010-acceso-a-datos-solo-por-servidor]]
- [[0011-numero-whatsapp-coexistencia]]
- [[respuestas-doctor-cuestionario]]

Esperando aprobación de la Parte B.
