---
title: Convenciones de la documentación
status: implementado
scope: docs/architecture/
last_updated: 2026-10-20
---

# Convenciones de la documentación

Define el esquema de los documentos, los enlaces y cómo se mantiene al día el vault `docs/architecture/`. Está pensado para abrirse con Obsidian y para que Claude Code lo lea antes de cambiar nada.

---

## Estado de un documento

Todo documento de arquitectura lleva en su frontmatter:

```yaml
---
title: <título legible>
status: planificado | en-curso | implementado | obsoleto
scope: <archivos, rutas o tablas que cubre>
last_updated: AAAA-MM-DD
verified_commit: <hash corto o "n/a">
---
```

- `planificado`: describe la intención de diseño; todavía no hay código. Nada de lo escrito se afirma como existente.
- `en-curso`: parte está implementada. Cada sección indica cuál.
- `implementado`: el contenido se verificó contra el código. `verified_commit` dice contra qué commit.
- `obsoleto`: se conserva por historia y apunta al documento que lo reemplaza.
- `last_updated` se actualiza cada vez que se edita el archivo.

### `status` en otros tipos de documento

- **Prompt** (`docs/prompts/`): `status` describe el prompt, no la fase. `implementado` quiere decir que el prompt está redactado y listo para pegarse; `en-curso`, que todavía se está escribiendo. El avance de la fase se lee en su plan (`docs/plans/`) y en [[CHANGELOG]].
- **ADR**: usa sus propios estados (`propuesto`, `aceptado`, `reemplazado`, `rechazado`); ver [[README-decisiones]].
- **Auditoría** (`docs/plans/<fase>-auditoria.md`): `implementado` desde que se entrega. Es un registro histórico y no se vuelve a editar.

---

## Esquema de un documento de módulo o infraestructura

Las secciones van en este orden:

| Sección | Para qué |
|---|---|
| `# Título` y un párrafo de resumen | Qué hace esta pieza, en prosa |
| `## Responsabilidades` | Lo que le toca hacer |
| `## Fronteras` | Lo que no debe hacer ni tocar |
| `## Datos` | Tablas, columnas y variables de entorno que usa |
| `## Interfaz` | Funciones públicas, rutas, endpoints o eventos |
| `## Flujos` | Pasos, en lista numerada o diagrama ASCII |
| `## Errores y casos borde` | Qué pasa cuando algo falla |
| `## Pruebas` | Cómo se verifica |
| `## Notas` | Detalles no obvios, pendientes, desviaciones |
| `## Conexiones` | Enlaces `[[...]]` a todo lo relacionado |

Los documentos de rutas de la landing y del panel usan además `## Rutas cubiertas` y `## Árbol de componentes` (árbol ASCII, sin código fuente).

---

## Enlaces

- Se usa `[[nombre-del-archivo]]` sin ruta ni extensión, por ejemplo `[[supabase-schema]]`.
- Todo documento termina con `## Conexiones` y lista los documentos relacionados.
- Un ADR se cita como `[[0003-calendar-fuente-de-verdad]]`.
- Lo que no se pudo confirmar en el código lleva `<!-- verify: qué comprobar -->`.

---

## Cómo actualizar el vault

| Qué pasó | Qué actualizar |
|---|---|
| Tabla o columna nueva | `[[supabase-schema]]` y los tipos en `src/types/` |
| Plantilla de WhatsApp creada o cambiada | `[[whatsapp-integration]]` |
| Cambio en la sincronización con Calendar | `[[google-calendar-sync]]` |
| Cambio en recordatorios | `[[reminders]]` |
| Ruta nueva del panel o la landing | Su doc de rutas y la tabla de rutas en `[[INDEX]]` |
| Módulo nuevo | Una fila en `[[modules-overview]]` y su propio documento |
| Variable de entorno nueva | Tabla de variables en `[[INDEX]]` (solo el nombre, nunca el valor) |
| Cuenta o servicio nuevo | `[[environments-and-accounts]]` |
| Decisión nueva o cambiada | Un ADR nuevo en `docs/decisions/`; si reemplaza a otro, el viejo pasa a `Reemplazado` |
| Algo salió mal | Plantilla de incidente en `docs/operations/` y entrada en `docs/log/CHANGELOG.md` |
| Fase completada | Cerrar el plan en `docs/plans/` y entrada en el CHANGELOG |
| Siempre | `last_updated` en cada archivo tocado |

---

## Lista de verificación para sesiones de Claude Code

- [ ] Leer el estado actual del archivo antes de documentarlo; no confiar en la memoria.
- [ ] Verificar cada ruta de archivo, símbolo y variable contra el código antes de escribirla.
- [ ] No documentar comportamiento que no se pueda observar en el código; usar `<!-- verify: -->`.
- [ ] Actualizar `last_updated`, `status` y `verified_commit` en cada archivo tocado.
- [ ] Revisar que `## Conexiones` cubra todo lo relacionado.
- [ ] No pegar secretos, números reales de pacientes ni DUI en ningún documento.
- [ ] Si hubo una decisión, crear su ADR.
- [ ] Añadir la entrada en `docs/log/CHANGELOG.md`.

---

## Conexiones

- [[INDEX]]
- [[agents]]
- [[modules-overview]]
