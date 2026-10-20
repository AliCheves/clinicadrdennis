---
title: Carriles de trabajo y reglas globales
status: implementado
scope: sesiones de Claude Code en este repositorio
last_updated: 2026-10-20
---

# Carriles de trabajo y reglas globales

Un solo desarrollador (Alí) trabaja con sesiones de Claude Code. Para no mezclar responsabilidades, cada sesión toma un carril. Una petición va a un solo carril; si cruza varios, Alí la divide.

---

## Reglas globales (nunca)

Las mismas de `AGENTS.md`. Se repiten aquí las que más importan al repartir trabajo:

- No push a `main`.
- No tocar secretos ni leer archivos `.env` con valores reales.
- No usar datos reales de pacientes.
- No registrar el número real de WhatsApp ni enviar mensajes a pacientes reales sin aprobación de Alí ([[0011-numero-whatsapp-coexistencia]]).
- No correr herramientas ni pruebas contra producción.

## Las migraciones son un despliegue

Una migración en `supabase/migrations/**` se aplica a producción cuando se fusiona su pull request, igual que en el autódromo. Antes de fusionar una migración riesgosa (borra datos, rellena columnas, cambia restricciones, cambia RLS) hacen falta:

1. Consultas de censo: cuántas filas y cuáles se afectan.
2. Un respaldo o resguardo (tabla de copia, SQL idempotente).
3. Un comentario de Alí en el PR citando los conteos.

Una migración ya aplicada se corrige con una migración nueva.

---

## Carriles

| Carril | Responsabilidad | Puede editar | No puede |
|---|---|---|---|
| Auditor | Lee, mide y propone. Entrega `docs/plans/<fase>-auditoria.md` | Solo `docs/plans/` | Código, migraciones, secretos |
| Constructor | Implementa lo aprobado, en una rama | `src/`, `tests/`, `docs/architecture/` de lo que toca | Migraciones sin censo; decisiones sin ADR |
| Datos | Esquema, RLS, migraciones, cifrado | `supabase/`, `src/lib/supabase/`, `src/lib/crypto/`, `[[supabase-schema]]`, `[[security-and-privacy]]` | UI |
| Integraciones | WhatsApp, Google Calendar, correo | `src/lib/whatsapp/`, `src/lib/google/`, `src/lib/email/`, sus documentos | Esquema y RLS |
| Revisor | Revisa un PR contra estas reglas y entrega veredicto | Nada | Abrir ramas, implementar |
| Seguridad | Revisa acceso, RLS, manejo de DUI y secretos; solo lectura | Nada | Parches |

---

## Veredicto del Revisor

Formato único, por PR:

```
PR #<n> @ <sha> — LISTO PARA FUSIONAR | BLOQUEADO
Carril: <carril del autor>; archivos fuera de su alcance: ninguno | <lista>
Docs: CONVENTIONS (last_updated, status, enlaces): pasa | falla <detalle>
Pruebas: lint <pasa|falla>; tipos <pasa|falla>; build <pasa|falla>; pruebas <pasa|falla|no corrió (motivo)>
Migraciones: ninguna | DESPLIEGUE A PRODUCCIÓN (datos en riesgo: no | sí, censo y firma de Alí vistos | BLOQUEADO hasta tenerlos)
Secretos y datos de pacientes en el diff: ninguno | <detalle>
Bitácora: entrada en CHANGELOG presente | falta
Puntos que bloquean: <lista numerada> | ninguno
```

---

## Conexiones

- [[INDEX]]
- [[CONVENTIONS]]
- [[supabase-schema]]
- [[security-and-privacy]]
- [[0011-numero-whatsapp-coexistencia]]
