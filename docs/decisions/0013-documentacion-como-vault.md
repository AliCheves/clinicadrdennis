---
title: ADR-0013 — Documentación como vault de Obsidian, en español
status: aceptado
fecha: 2026-10-20
last_updated: 2026-10-20
---

# ADR-0013 — Documentación como vault de Obsidian, en español

**Estado:** Aceptado

## Contexto

Alí pidió un sistema de conocimiento como el del autódromo para controlar qué pasa y cómo se ejecuta con el tiempo.

## Decisión

Se usa `docs/architecture/` como vault de Obsidian con índice, convenciones y carriles, más ADRs, requisitos, planes, prompts, runbooks y bitácora. Los documentos están en español; los identificadores de código, en inglés. Cada documento lleva `status` y `last_updated`.

## Consecuencias

Cada sesión de Claude Code lee el vault antes de tocar nada y lo actualiza al terminar. Si se prefiere inglés como en el autódromo, se traduce sin cambiar la estructura.

## Alternativas

Notas sueltas: no dejan rastro ni control.

## Conexiones

- [[CONVENTIONS]]
- [[INDEX]]
- [[README-decisiones]]
