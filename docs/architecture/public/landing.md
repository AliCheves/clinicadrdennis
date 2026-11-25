---
title: Landing pública
status: implementado
scope: src/app/(public)/, src/app/layout.tsx, src/app/robots.ts, src/config/content/
last_updated: 2026-10-20
verified_commit: eba7d5b
---

# Landing pública

Sitio público del consultorio: una página de inicio con los datos confirmados y dos borradores legales, aviso de privacidad y términos de uso. Existe sobre todo porque Meta exige una URL válida para la información del negocio y más adelante una política de privacidad pública ([[environments-and-accounts]]). Es estática: se genera al compilar, no usa base de datos ni JavaScript de cliente propio, y no depende de ningún host en particular.

---

## Responsabilidades

- Mostrar solo los datos del consultorio marcados `confirmado: true` en `src/config/content/clinic.ts`.
- Mostrar "Información en actualización" cuando no hay nada que mostrar.
- Publicar los borradores de `/privacidad` y `/terminos` con un aviso visible de que están pendientes de revisión legal.
- Pedir a los buscadores que no indexen el sitio (`noindex, nofollow`) mientras falte confirmar nombre, especialidad, dirección u horario.

## Fronteras

- No muestra nada que no esté en `clinic.ts` (`AGENTS.md`, regla 9): ni credenciales, ni títulos, ni años de experiencia, ni precios, ni testimonios, ni fotos.
- No hace afirmaciones médicas ni promesas de resultados. Los borradores legales no afirman cumplir ninguna ley.
- No tiene analítica, cookies, formularios ni recursos de terceros. Las fuentes se descargan al compilar (`next/font`) y se sirven desde el propio sitio.
- Teléfono y WhatsApp quedan sin valor hasta resolver [[0011-numero-whatsapp-coexistencia]] (decisión D3 de [[fase-0-auditoria]]).
- Los componentes no leen `clinic.ts` directamente: todo pasa por `datosVisibles()`.

## Datos

| Archivo | Contenido |
|---|---|
| `src/config/content/clinic.ts` | Datos del consultorio. Cada campo es `{ valor, confirmado }`. Hoy todos tienen `confirmado: false` |
| `src/config/content/visible.ts` | `datosVisibles()` (filtro de confirmados), `sePuedeIndexar()`, `enlaceWhatsApp()`, `formatearHora()`, `etiquetaDia()` |
| `src/config/content/site.ts` | Textos genéricos de interfaz y rutas |
| `src/config/content/legal.ts` | Textos de los borradores legales y del aviso; `PENDIENTE = "Pendiente de confirmar"` |

No usa variables de entorno ni tablas.

### Cómo se publica un dato

1. Alí lo confirma con el doctor, letra por letra. El nombre debe coincidir con el de la verificación de Meta.
2. En `clinic.ts`, el campo pasa a `confirmado: true`, en un commit propio.
3. Cuando nombre, especialidad, dirección y horario están confirmados, `sePuedeIndexar()` devuelve `true` y desaparece el `noindex`. Teléfono y WhatsApp no cuentan para esto.

## Interfaz

### Rutas cubiertas

| Ruta | Archivo | Contenido |
|---|---|---|
| `/` | `src/app/(public)/page.tsx` | Especialidad, nombre, dirección, horario y contacto (teléfono y botón de WhatsApp), cada uno solo si está confirmado |
| `/privacidad` | `src/app/(public)/privacidad/page.tsx` | Borrador del aviso de privacidad |
| `/terminos` | `src/app/(public)/terminos/page.tsx` | Borrador de los términos de uso |
| `/robots.txt` | `src/app/robots.ts` | Abierto a todos. La exclusión va por la etiqueta `noindex`: si `robots.txt` bloqueara, los rastreadores no la verían |

### Árbol de componentes

```
RootLayout (src/app/layout.tsx)         lang="es-SV", fuentes, generateMetadata (título, descripción, robots)
└── PublicLayout ((public)/layout.tsx)  enlace "Saltar al contenido", cabecera con el nombre o "Consultorio", pie con enlaces legales
    ├── Home ((public)/page.tsx)
    │   ├── EnActualizacion             cuando no hay datos confirmados
    │   └── Seccion ×3                  Dirección · Horario (Horario) · Contacto (Contacto)
    ├── privacidad/page.tsx ─┐
    └── terminos/page.tsx  ──┴── DocumentoLegal   aviso de borrador (role="note"), título, fecha, secciones
```

## Flujos

1. Al compilar, cada página llama a `datosVisibles(clinic)`. Los campos sin confirmar no salen de esa función, así que no llegan al HTML, al título, a la descripción ni al payload de React.
2. `generateMetadata` usa el nombre confirmado o "Consultorio", una descripción genérica y `robots` según `sePuedeIndexar(clinic)`.
3. El resultado es HTML estático (`○ Static` en el build).

## Errores y casos borde

- **Campo confirmado sin valor** (por ejemplo, teléfono `null` con `confirmado: true`): no se muestra.
- **Solo el nombre confirmado:** se muestran el nombre y el bloque "Información en actualización".
- **Martes sin consulta:** el horario lo muestra como "Sin consulta".
- **Tema oscuro:** sigue `prefers-color-scheme`. `data-theme="light"` o `"dark"` en `<html>` lo fuerza; no hay selector en la interfaz.

## Pruebas

- `tests/unit/visible.test.ts` (Vitest): el filtro no deja pasar valores sin confirmar, la regla de indexación y el formato de horas.
- `tests/e2e/landing.spec.ts` (Playwright, Chromium a 375 px, contra `next start`). Por cada ruta:
  - Estado 200, sin errores de consola, sin scroll horizontal.
  - axe WCAG 2.1 A/AA sin violaciones, en tema claro y oscuro.
  - Sin recursos de terceros ni cookies.
  - `noindex` según los datos confirmados.
  - Ningún valor sin confirmar en el HTML, incluidos los metadatos.

  Además: los enlaces del pie funcionan y los borradores muestran el aviso.
- Se comprobó que la prueba de fugas falla si un valor sin confirmar llega a la descripción.
- CI corre todo en cada pull request (`.github/workflows/ci.yml`).

## Notas

- Dirección visual: funcional y sobria. Source Serif 4 para títulos, Atkinson Hyperlegible para el texto (diseñada para leerse bien), paleta piedra cálida con un acento verde azulado. Los tokens de color están en `src/app/globals.css`.
- El cero con barra es propio de Atkinson Hyperlegible: ayuda a distinguirlo de la O.
- Los borradores legales describen el tratamiento de datos **planificado** para el bot. Hay que revisarlos cuando haya validación legal ([[security-and-privacy]] § Pendientes) y antes de atender pacientes reales.
- La fecha del borrador está fija en `legal.ts` ("20 de octubre de 2026") y se cambia a mano en cada versión.

## Conexiones

- [[INDEX]]
- [[CONVENTIONS]]
- [[fase-0-cimientos]]
- [[fase-0-auditoria]]
- [[environments-and-accounts]]
- [[security-and-privacy]]
- [[runbook-meta-whatsapp-setup]]
- [[runbook-desplegar-landing]]
- [[0011-numero-whatsapp-coexistencia]]
