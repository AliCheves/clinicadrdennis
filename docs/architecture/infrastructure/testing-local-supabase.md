---
title: Supabase local para desarrollo y pruebas
status: implementado
scope: supabase/config.toml, scripts db:start y db:stop
last_updated: 2026-11-25
verified_commit: 7755854
---

# Supabase local para desarrollo y pruebas

Supabase corre en local con Docker, controlado por la CLI de Supabase instalada como dependencia de desarrollo con versión fija (`supabase` en `package.json`, decisión D5 de [[fase-0-auditoria]]). Todavía no hay esquema: las migraciones llegan en [[fase-0-5-esquema-y-panel]].

**Regla: nunca contra producción.** Pruebas, semillas, scripts y herramientas de desarrollo corren solo contra este Supabase local. Nunca contra el proyecto de producción (`AGENTS.md`, regla 5).

---

## Responsabilidades

- Dar una base de datos, autenticación y API idénticas a las de Supabase, solo en la máquina de desarrollo.
- Ser el único destino de las pruebas que tocan la base de datos.

## Fronteras

- No se enlaza el proyecto local con el de la nube (`supabase link`) desde una sesión de Claude Code.
- No se corre `supabase db push` ni ningún comando contra producción desde local. Las migraciones llegan a producción al fusionar su PR ([[agents]] § Las migraciones son un despliegue).
- No se copian claves locales ni de producción a docs, pruebas, capturas ni commits.
- No se cargan datos reales de pacientes: solo ficticios con el prefijo "Paciente de Prueba".

## Datos

| Pieza | Valor |
|---|---|
| Configuración | `supabase/config.toml`, `project_id = "clinicadrdennis"` |
| Migraciones | `supabase/migrations/`: esquema base y RLS desde la Fase 0.5 ([[supabase-schema]]) |
| Semillas | `supabase/seed.sql` **no existe a propósito**: `db reset` no siembra nada. La configuración del consultorio (tipos de cita, horario) va en la migración. Los datos de demostración salen solo de `scripts/seed-demo.ts` |
| Variables | Las de [[INDEX]] § Variables de entorno; en local los valores salen de `npx supabase status` y van en `.env.local`, que nunca se sube |

### Puertos

Los puertos están corridos al bloque 554xx para que este proyecto conviva con el Supabase local del autódromo, que usa los 543xx por defecto.

| Servicio | Puerto |
|---|---|
| API (Kong) | 55421 |
| Postgres | 55422 |
| Postgres sombra (diffs) | 55420 |
| Studio | 55423 |
| Correo de pruebas (Mailpit) | 55424 |
| Analítica | 55427 |
| Pooler (apagado) | 55429 |
| Inspector de edge functions | 8183 |

## Interfaz

| Comando | Qué hace |
|---|---|
| `npm run db:start` | Levanta los contenedores (`supabase start`). La primera vez descarga las imágenes |
| `npm run db:stop` | Detiene los contenedores de este proyecto y conserva los datos en volúmenes de Docker |
| `npx supabase status` | Muestra URLs y claves locales. No pegues su salida en docs ni issues |
| `npm run db:demo` | Reinicia la base local (`supabase db reset`) y siembra la demostración |
| `npm run db:seed:demo` | Solo siembra. Exige `ALLOW_DEMO_SEED=1` (el script ya lo pone), URL local y una base sin pacientes |
| `npm run db:test` | Pruebas pgTAP de RLS (`supabase test db`) |
| `npm run db:types` | Regenera `src/types/database.ts` desde el esquema local |
| `npm run test:e2e:panel` | Pruebas del panel por rol; requieren `db:demo` antes |

### `.env.local` para desarrollo

Se arma con los valores de `npx supabase status -o env`:
- `NEXT_PUBLIC_SUPABASE_URL` ← `API_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ← `ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` ← `SERVICE_ROLE_KEY`, solo para la semilla local
- `PII_ENCRYPTION_KEY` y `PII_HASH_KEY`: dos valores distintos de `openssl rand -base64 32`

Son valores solo locales y el archivo nunca se sube. Si se pierde la clave de cifrado local, basta con `npm run db:demo`.

### Semilla de demostración

`scripts/seed-demo.ts` crea:
- Las cuentas `doctor@demo.local` y `secretaria@demo.local`, con contraseña local `demo-local-2026` (no es un secreto).
- 40 pacientes "Paciente de Prueba — …", con teléfonos `+503 0000-00NN` y DUI ficticios e inválidos, cifrados con la clave local.
- Unas 120 citas de cinco semanas, relativas a la fecha de hoy y dentro del horario real.
- Citas sin vincular, recordatorios, 8 conversaciones y 6 casos, sin nada clínico.

Todo lleva `source = 'semilla'`. Barreras:
1. Se niega si la URL no es `127.0.0.1` o `localhost`.
2. Se niega sin `ALLOW_DEMO_SEED=1`.
3. Se niega si ya hay pacientes.

## Flujos

1. Abrir Docker Desktop.
2. `npm run db:start`.
3. Copiar URL y clave anónima locales de `npx supabase status` a `.env.local`.
4. Trabajar o correr pruebas.
5. `npm run db:stop`.

## Errores y casos borde

- **"Cannot connect to the Docker daemon":** Docker Desktop no está abierto.
- **Puerto ocupado:** otro proyecto usa el mismo bloque. Detener ese proyecto o cambiar los puertos aquí y en esta tabla.
- **Servicios `imgproxy` y `pooler` detenidos:** es lo esperado con la configuración por defecto.

## Pruebas

En Fase 0 se verificó a mano que `db:start` levanta los servicios mientras el Supabase del autódromo sigue corriendo, y que `db:stop` detiene solo los contenedores de este proyecto. Las pruebas automáticas contra la base de datos llegan en [[fase-0-5-esquema-y-panel]].

## Notas

- **iCloud Drive.** Si el proyecto está dentro de `~/Documents` con la sincronización de iCloud activa, macOS puede desalojar archivos (`node_modules`, `.next`, incluso `.git`). Las herramientas que intentan leerlos se quedan colgadas sin error. Pasó el 2026-11-25.
  - Diagnóstico: `find . -flags +dataless`.
  - Arreglo rápido: borrar y reinstalar `node_modules` y `.next`, y leer los demás archivos para que se descarguen.
  - Arreglo de fondo: marcar la carpeta como "Mantener descargado" en Finder, o mover el repositorio fuera de iCloud.
- CI no levanta Supabase en Fase 0: no hay esquema que probar.

## Conexiones

- [[INDEX]]
- [[agents]]
- [[supabase-schema]]
- [[security-and-privacy]]
- [[environments-and-accounts]]
- [[fase-0-cimientos]]
- [[fase-0-5-esquema-y-panel]]
