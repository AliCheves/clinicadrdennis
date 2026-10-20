---
title: Fase 0 — Auditoría (solo lectura)
status: implementado
scope: repositorio, entorno local, contrato de la Fase 0
last_updated: 2026-10-20
verified_commit: n/a
---

# Fase 0 — Auditoría (solo lectura)

Entrega de la Parte A de [[00-fase-0-cimientos]] contra el contrato [[fase-0-cimientos]]. No se instaló nada ni se modificó ningún archivo; este es el único archivo creado. Queda como registro histórico y no se vuelve a editar ([[README-planes]]).

Documentos leídos: `AGENTS.md`, `CLAUDE.md`, `README.md`, [[INDEX]], [[CONVENTIONS]], [[agents]], [[modules-overview]], [[README-decisiones]] y los ADR 0001 a 0014, [[respuestas-doctor-cuestionario]], [[fase-0-cimientos]], [[fase-0-5-esquema-y-panel]], [[environments-and-accounts]], [[security-and-privacy]], [[runbook-meta-whatsapp-setup]], [[CHANGELOG]] y [[2026-10-20-sesion-clinica]].

---

## 1. Estado del repositorio y del entorno

### Repositorio

| Punto | Estado |
|---|---|
| Rama actual | `main`, **sin ningún commit** |
| Remoto | `origin` → `github.com/AliCheves/clinicadrdennis` (no se consultó si tiene contenido) |
| Archivos | Todos sin seguimiento: `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/` y dos `.DS_Store` (raíz y `docs/`) |
| `.gitignore` | No existe |
| Código | No existe `src/`, `package.json`, `supabase/` ni `.github/` |
| GitHub CLI | `gh` 2.96.0, con sesión iniciada como AliCheves |

### Herramientas

| Herramienta | Versión | Estado |
|---|---|---|
| Node | v24.15.0 (por nvm) | OK. Es LTS; conviene fijarla en `.nvmrc` y en `engines` |
| npm / npx | 11.12.1 | OK |
| pnpm | 11.1.1 | Instalado, pero no se usa: el prompt pide `npm run` |
| git | 2.50.1 (Apple Git-155) | OK |
| Docker | 29.5.3, Compose v5.1.4, Docker Desktop instalado | **El daemon no está corriendo** (no hay socket en `~/.docker/run/docker.sock`). Hay que abrir Docker Desktop antes de B4 |
| Supabase CLI | — | **No está instalado.** Ver D5 |
| Homebrew | 7.0.9 | OK |
| Playwright | — | Se instala como dependencia de desarrollo en B5, junto con su navegador Chromium |

---

## 2. Verificación del contrato

| # | Punto de [[fase-0-cimientos]] / prompt | ¿Se puede tal cual? | Observación y propuesta |
|---|---|---|---|
| 1 | App Next.js (App Router, TS, Tailwind) con la estructura de `AGENTS.md` | Sí, con un ajuste | Git no guarda carpetas vacías. Propuesta: cada módulo (`conversation`, `agenda`, `patients`, `reminders`, `sync`) lleva un `index.ts` con `export {};` y un comentario de una línea con su puerta (ADR-0001); `src/lib/*` y `src/types/` llevan `.gitkeep`. Sin lógica |
| 1b | ESLint | Sí | Next.js reciente ya no trae `next lint`: se usa `eslint` directo con configuración plana (`eslint.config.mjs`). Los tipos se revisan con `tsc --noEmit` en un script `typecheck` |
| 1c | `.env.example` con los nombres de [[INDEX]] | Sí | La fila "`GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`" se separa en dos líneas. `CLINIC_TIMEZONE` y `SENTRY_DSN` van comentados como opcionales |
| 1d | `.gitignore` sin `.env*` salvo el ejemplo | Sí | Se añaden también `.DS_Store`, `node_modules`, `.next`, `test-results`, `playwright-report` y `supabase/.temp` |
| 2 | Landing `/`, `/privacidad`, `/terminos` | Sí, pero ver D3 | Con todos los campos en `confirmado: false`, la landing **no muestra ningún dato**. Para Meta, una página vacía no sirve como sitio del negocio. Hace falta un estado de respaldo sobrio ("Información en actualización") y que Alí confirme campos con el doctor antes de publicar |
| 3 | `src/config/content/clinic.ts` con `confirmado` | Sí, con huecos | El plan no da valor para **especialidad** (sale de [[respuestas-doctor-cuestionario]] § Notas: reumatología) ni para el **enlace de WhatsApp** (el número no está decidido, ADR-0011). Ver §3 |
| 3b | Sin datos estáticos dentro de JSX (`AGENTS.md`) | Sí | Los textos de `/privacidad` y `/terminos` también van en config: `src/config/content/legal.ts`. La regla de "mostrar solo lo confirmado" va en una función pura (`src/config/content/` o `src/lib/content/`), no dentro del componente |
| 4 | Supabase local con Docker, `db:start`/`db:stop` | Sí, cuando estén Docker y la CLI | `supabase init` crea `supabase/config.toml` con `project_id`. Si en la misma máquina corre el Supabase local del autódromo, los puertos chocan (54321–54324). Propuesta: `project_id = "clinicadrdennis"` y documentar en `testing-local-supabase.md` que se detenga el otro proyecto o se cambien los puertos |
| 5 | Playwright: carga, sin errores de consola, sin scroll a 375 px, enlaces | Sí | Las pruebas corren contra `next build && next start` y no contra `next dev`, que da avisos de desarrollo y vuelve frágil la prueba de consola. Se añade una revisión automática de accesibilidad (`@axe-core/playwright`) para contraste AA y etiquetas: es barata y respalda la regla de B3 |
| 6 | CI con lint, tipos y build | Sí, pero ver D4 | **Contradicción:** el prompt (B6) dice lint, tipos y build; la definición de hecho del plan dice "Lint, tipos, build y **pruebas** en verde en CI" |
| 7 | Vault y bitácora | Sí, con un hueco | [[INDEX]] **no tiene "tabla de rutas"** y B7 pide actualizarla: hay que crear la sección. `docs/architecture/public/` no existe: se crea |
| 8 | Lista de despliegue, sin desplegar | Sí | Depende de D6 (hosting y dominio) |
| — | Rama `feature/fase-0-cimientos` y PR | **No tal cual** | `main` no tiene commits: una rama sacada de aquí no tiene base contra la cual abrir un PR. Ver D1 |

---

## 3. Contradicciones y huecos

1. **Atribución de commits.** `AGENTS.md` § Git prohíbe co-autores de IA y líneas "Generated with". La configuración de esta sesión de Claude Code pide añadir `Co-Authored-By` a los commits y "Generated with Claude Code" a los PR. **Gana `AGENTS.md`**, por la regla del propio prompt: commits y PR solo con la identidad AliCheves. Lo aviso como pide el prompt (D2).
2. **Repositorio vacío frente a "no push a `main`".** No hay base para el PR (D1).
3. **Pruebas en CI:** el prompt y el plan no coinciden (D4).
4. **Teléfono y enlace de WhatsApp.** El plan da "Teléfono del negocio 7841-4688", pero [[respuestas-doctor-cuestionario]] (punto 4) y ADR-0011 dicen que no se sabe si es el número personal del doctor. Publicarlo en una página pública es irreversible en la práctica (buscadores, capturas). Además el enlace `wa.me` depende de qué número atienda a los pacientes, y eso está abierto. El campo existe, pero no hay ningún valor seguro para el enlace.
5. **Nombre.** Hay tres formas en el vault: "Clínica de Reumatología Dr. Dennis Flores" (portafolio), "Clinica Dr Dennis Flores" (formulario de Meta, sin tilde) y "Dr. Dennis René Flores" (firma). El runbook exige que coincidan letra por letra con los documentos de verificación. La landing debe mostrar el nombre que quede como definitivo.
6. **Especialidad.** Solo se deduce del nombre del portafolio. No viene del cuestionario.
7. **Política de privacidad sin responsable.** Meta pedirá una política pública ([[environments-and-accounts]]). Un borrador honesto debe decir quién trata los datos y cómo contactarlo, y esos datos no están confirmados. Tampoco hay validación legal ([[security-and-privacy]] § Pendientes). El borrador describirá lo que el sistema **va a** tratar (nombre, teléfono, fecha de nacimiento, DUI cifrado, correo) sin afirmar cumplimiento de ninguna ley.
8. **[[INDEX]] sin tabla de rutas**, aunque [[CONVENTIONS]] y el prompt la mencionan.
9. **Frontmatter del prompt.** `docs/prompts/00-fase-0-cimientos.md` tiene `status: implementado` cuando la fase aún no se implementa; en [[README-prompts]] sale como "Listo". Es menor: probablemente quiere decir "prompt terminado". Propongo dejarlo así y aclarar en [[CONVENTIONS]] qué significa `status` en un prompt, o dejarlo como está si Alí prefiere.
10. **Hosting.** ADR-0002 advierte que un plan gratuito puede prohibir el uso comercial. Por ejemplo, Vercel Hobby es solo para uso no comercial, y la landing de un consultorio es comercial. Afecta la lista de despliegue (D6).
11. **ADR-0014** sigue `propuesto`. No bloquea la Fase 0, pero el plan de fases ya lo da por hecho en [[README-planes]].
12. **`.DS_Store`** sin seguimiento en la raíz y en `docs/`: no deben entrar al primer commit.

---

## 4. Decisiones que necesito

**D1. Primer commit en `main`.** El repositorio no tiene commits y no puedo hacer push a `main`.
- *Recomendación:* Alí hace a mano el primer commit en `main` con lo que ya existe (`AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/`, sin `.DS_Store`) y lo sube. Si lo autoriza explícitamente, puedo hacerlo yo, solo ese commit. Después saco `feature/fase-0-cimientos` desde ahí.
- *Razón:* el PR necesita una base; así el diff de la fase muestra solo lo nuevo.

**D2. Atribución.** ¿Se mantiene la regla de `AGENTS.md` (sin co-autor de IA ni "Generated with")?
- *Recomendación:* sí. La aplico por defecto salvo que digas lo contrario.
- *Razón:* es la regla escrita del repositorio y el prompt dice que gana `AGENTS.md`.

**D3. Qué datos se confirman para la primera publicación.**
- *Recomendación:* confirmar con el doctor el **nombre** (la forma definitiva), la **especialidad**, la **dirección** y el **horario**. Dejar **teléfono** y **WhatsApp** en `false` hasta resolver ADR-0011 y saber si el número es personal. Implemento todo en `false`, como pide el prompt, y Alí cambia los valores a `true` en un commit propio cuando el doctor confirme.
- *Razón:* Meta necesita una página con contenido real, pero publicar un número personal no tiene vuelta atrás.

**D4. Playwright en CI.**
- *Recomendación:* sí, en un trabajo aparte con solo Chromium y la caché del navegador.
- *Razón:* la definición de hecho del plan lo exige; cuesta un par de minutos por PR.

**D5. Cómo se instala la CLI de Supabase.**
- *Recomendación:* como dependencia de desarrollo (`supabase` en npm, con versión fija). Los scripts usan `supabase start` / `supabase stop` desde `node_modules/.bin`.
- *Razón:* la versión queda fija en el repositorio y CI puede usarla sin Homebrew. Alternativa: `brew install supabase/tap/supabase`, global y sin versión fija.

**D6. Hosting y dominio para la lista de despliegue.**
- *Recomendación:* la lista asume Vercel con una cuenta a nombre del doctor y plan Pro (uso comercial). Mientras no haya dominio propio, se usa la URL `*.vercel.app` temporal para Meta, y el dominio se registra después a nombre del doctor. Si prefieres otro host, la lista cambia pero el código no.
- *Razón:* es el stack que ya usas en el autódromo; el plan Hobby no permite uso comercial; ADR-0002 aún no decide el runtime final, pero Next.js sirve en ambos casos.

**D7. Indexación en buscadores mientras haya datos sin confirmar.**
- *Recomendación:* `noindex` (en metadatos y `robots.txt`) hasta que el doctor confirme los datos; se quita en un commit aparte.
- *Razón:* evita que un buscador guarde una versión preliminar o un dato equivocado. El revisor de Meta igual puede ver la página.

**D8. Contenido de los borradores legales.**
- *Recomendación:* `/privacidad` describe qué datos se van a tratar y para qué (agendar y recordar citas), dónde se guardan (proveedores en la nube, región por definir), que el DUI se guarda cifrado y que no se usan cookies de seguimiento. El responsable y el contacto aparecen como "Pendiente de confirmar" y todo lleva un aviso visible de borrador sin revisión legal. `/terminos` describe solo el uso del servicio de citas, sin promesas médicas. Ninguno afirma cumplir una ley.
- *Razón:* Meta necesita la URL; inventar un responsable o afirmar cumplimiento rompería la regla 9 de `AGENTS.md` y lo que pide B3.

---

## 5. Plan de la Parte B

Antes de empezar: D1 resuelta y Docker Desktop abierto (para B4). Después de cada paso: `npm run lint`, `npm run typecheck` y `npm run build`, y un commit pequeño.

| Paso | Qué | Archivos | Hecho cuando |
|---|---|---|---|
| B0 | Rama | — | `git branch --show-current` = `feature/fase-0-cimientos`, sacada del primer commit de `main` |
| B1a | Crear la app Next.js (TS, App Router, Tailwind, `src/`, npm) | `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `src/app/layout.tsx`, `src/app/globals.css`, `.nvmrc` | `npm run build` pasa; versiones exactas fijadas; `engines.node` = 24 |
| B1b | Scripts `lint`, `typecheck`, `build`, `start` | `package.json` | Los tres pasan sin avisos |
| B1c | Estructura de `AGENTS.md` | `src/app/(public)/`, `src/modules/*/index.ts`, `src/lib/{supabase,crypto,whatsapp,google,email}/.gitkeep`, `src/types/.gitkeep` | `ls` muestra el árbol; cada `index.ts` solo tiene `export {};` y su comentario |
| B1d | Variables y exclusiones | `.env.example`, `.gitignore` | `.env.example` tiene las 18 variables de [[INDEX]] sin valores; `git check-ignore .env.local` lo excluye y `.env.example` no |
| B2 | Contenido en config | `src/config/content/clinic.ts`, `src/config/content/legal.ts`, `src/config/content/visible.ts` (función pura que filtra lo confirmado) | Todo con `confirmado: false`; valores del plan § Datos observados; especialidad "Reumatología"; WhatsApp sin valor (`null`) por ADR-0011; prueba unitaria de la función de filtro, ver B5 |
| B3a | Layout público y `/` | `src/app/(public)/layout.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/_components/*` | Muestra solo lo confirmado; con todo en `false` muestra el estado de respaldo; `lang="es-SV"`; fuente por `next/font` (se sirve desde el propio sitio, sin pedir nada a terceros); sin analítica ni cookies |
| B3b | `/privacidad` y `/terminos` | `src/app/(public)/privacidad/page.tsx`, `src/app/(public)/terminos/page.tsx` | Aviso de borrador visible arriba de todo; textos sacados de `legal.ts`; sin afirmar cumplimiento de ninguna ley |
| B3c | Metadatos e indexación (según D7) | `src/app/robots.ts`, metadatos del layout | `noindex` presente mientras haya campos sin confirmar |
| B3d | Revisión de diseño y accesibilidad | — | Skill de diseño frontend, dentro de las reglas de B3; foco visible; contraste AA verificado por axe |
| B4 | Supabase local | `supabase/config.toml`, `package.json` (`db:start`, `db:stop`), `docs/architecture/infrastructure/testing-local-supabase.md` | `npm run db:start` levanta los contenedores y `npm run db:stop` los baja; `supabase/migrations/` vacío; el doc dice "nunca contra producción" |
| B5 | Pruebas | `playwright.config.ts`, `tests/e2e/landing.spec.ts`, `tests/unit/visible.test.ts` (Vitest), scripts `test`, `test:e2e` | Pasan en local: cada ruta carga con estado 200, sin errores de consola, `scrollWidth <= 375` en las tres rutas, enlaces a privacidad y términos funcionan, axe sin violaciones serias, filtro de confirmados probado |
| B6 | CI | `.github/workflows/ci.yml` | Corre en `pull_request` (y en push a ramas `feature/**`): `npm ci`, lint, typecheck, build y, según D4, Playwright; pasa en el PR |
| B7 | Documentación | Ver §6 | Frontmatter según [[CONVENTIONS]]; enlaces `[[...]]` válidos |
| B8 | Reporte y PR | PR hacia `main`, sin atribución de IA (D2) | Reporte con lo verificado, lo que no se verificó y la lista de despliegue |

---

## 6. Documentos del vault que se crean o actualizan

| Documento | Acción |
|---|---|
| `docs/architecture/public/landing.md` | **Nuevo**, con el esquema de [[CONVENTIONS]] más `## Rutas cubiertas` y `## Árbol de componentes`; `status: implementado`, con `verified_commit` |
| `docs/architecture/infrastructure/testing-local-supabase.md` | **Nuevo**: cómo levantar y bajar la base, choque de puertos con el autódromo, regla de nunca contra producción |
| [[INDEX]] | Nueva sección "Rutas" (`/`, `/privacidad`, `/terminos`); enlaces a los dos docs nuevos; "Estado general" actualizado; `last_updated` |
| [[modules-overview]] | Nota de que las puertas `index.ts` existen sin lógica; sigue `planificado` |
| [[environments-and-accounts]] | Fila de GitHub (repositorio creado) y de entornos (CI); sin secretos |
| [[fase-0-cimientos]] | `status` → `implementado` al cerrar; enlace a esta auditoría |
| [[README-planes]] | Fila de la Fase 0 → estado actualizado |
| [[CHANGELOG]] | Entrada de la Fase 0 |
| [[runbook-meta-whatsapp-setup]] | Nota de que la URL de la landing existe una vez desplegada (solo si Alí despliega antes del cierre) |

No se crea ningún ADR, salvo que D6 o D7 cambien una decisión de arquitectura. Elegir host para la landing no cierra ADR-0002.

---

## 7. Riesgos de privacidad, secretos y datos reales

| Riesgo | Mitigación |
|---|---|
| Publicar el número personal del doctor | Teléfono y WhatsApp en `confirmado: false`; no se publican hasta resolver ADR-0011 (D3) |
| Publicar datos sin confirmar o un nombre que no coincide con la verificación de Meta | Filtro por `confirmado` probado; `noindex` mientras tanto (D7) |
| Texto legal que afirma cumplimiento o inventa un responsable | Aviso visible de borrador; responsable "Pendiente de confirmar" (D8) |
| Secretos en el repo | `.gitignore` con `.env*` (salvo el ejemplo); `.env.example` sin valores; Fase 0 no usa ninguna variable real; CI sin secretos |
| Valores por defecto de Supabase local en el repo | `supabase/config.toml` solo tiene valores locales públicos de la CLI; no se copian claves locales a docs ni tests |
| Probar contra producción | No existe proyecto de producción conectado; el doc local lo prohíbe y no hay variables de producción en el repo |
| Analítica o rastreo de terceros | Ningún script externo; fuentes servidas desde el sitio; prueba de consola y revisión del HTML |
| Afirmaciones médicas o datos inventados (regla 9) | La landing solo lee `clinic.ts`; nada de credenciales, años de experiencia, precios, testimonios ni fotos de stock |
| Datos de pacientes | Fase 0 no maneja pacientes; los ejemplos de prueba no llevan datos personales |
| `.DS_Store` con nombres de archivos locales | Excluido por `.gitignore` y fuera del primer commit |
| Enlace a un artefacto de claude.ai en [[CHANGELOG]] | Es privado por defecto; no expone datos, pero conviene no compartirlo fuera del equipo |

---

## Conexiones

- [[fase-0-cimientos]]
- [[00-fase-0-cimientos]]
- [[README-planes]]
- [[INDEX]]
- [[CONVENTIONS]]
- [[agents]]
- [[modules-overview]]
- [[environments-and-accounts]]
- [[security-and-privacy]]
- [[0002-runtime-del-backend]]
- [[0011-numero-whatsapp-coexistencia]]
- [[respuestas-doctor-cuestionario]]

Esperando aprobación de la Parte B.
