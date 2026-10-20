---
title: Supabase local para desarrollo y pruebas
status: implementado
scope: supabase/config.toml, scripts db:start y db:stop
last_updated: 2026-10-20
verified_commit: 7a0ba5b
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
| Migraciones | `supabase/migrations/` (vacía en Fase 0) |
| Semillas | `supabase/seed.sql` (no existe en Fase 0; la CLI avisa "no files matched" y sigue) |
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

- CI no levanta Supabase en Fase 0: no hay esquema que probar.

## Conexiones

- [[INDEX]]
- [[agents]]
- [[supabase-schema]]
- [[security-and-privacy]]
- [[environments-and-accounts]]
- [[fase-0-cimientos]]
- [[fase-0-5-esquema-y-panel]]
