---
title: Runbook — Desplegar la landing en Vercel
status: en-curso
scope: despliegue de la landing pública (Fase 0)
last_updated: 2026-10-20
---

# Runbook — Desplegar la landing en Vercel

Pasos para que Alí conecte el repositorio desde su cuenta de Vercel y obtenga la URL `*.vercel.app` para la revisión de Meta (decisión D6 de [[fase-0-auditoria]]). Ninguna sesión de Claude Code despliega.

> **Vercel Hobby es solo para uso no comercial.** Sirve como paso temporal para la revisión de Meta. **Antes de atender pacientes reales** hay que pasar a Vercel Pro u otro host. El código no depende de Vercel: es una app Next.js estándar (`npm run build` y `npm run start`) que corre en cualquier host con Node 24.

## Antes de desplegar

- [ ] El PR de la Fase 0 está fusionado en `main` y CI pasó.
- [ ] Revisaste `src/config/content/clinic.ts`. Lo normal es desplegar primero con todo en `confirmado: false`: la página muestra "Información en actualización" y lleva `noindex`.
- [ ] Si el doctor ya confirmó nombre, especialidad, dirección y horario, márcalos `confirmado: true` en un commit propio, por PR. Teléfono y WhatsApp siguen en `false` hasta resolver [[0011-numero-whatsapp-coexistencia]].

## Conectar el repositorio

1. En vercel.com, con tu cuenta: **Add New → Project → Import Git Repository** → `AliCheves/clinicadrdennis`.
2. Framework: Next.js (se detecta solo). Directorio raíz: `/`. Comandos por defecto (`npm install`, `npm run build`).
3. Node.js: 24.x en **Settings → General → Node.js Version**, igual que `.nvmrc`.
4. Variables de entorno: **ninguna**. La landing no usa variables; no copies `.env.example`.
5. Rama de producción: `main`. Las vistas previas de PR pueden quedar activas.
6. Deploy.

## Después de desplegar

- [ ] Abrir `https://<proyecto>.vercel.app/`, `/privacidad` y `/terminos` en el celular: cargan, no hay scroll horizontal y se ve el aviso de borrador.
- [ ] Ver el código fuente de la página y confirmar que tiene `<meta name="robots" content="noindex, nofollow">` mientras falten datos.
- [ ] En **Settings → Analytics / Speed Insights**: dejarlos **apagados** (la landing promete no usar analítica).
- [ ] Anotar la URL en [[environments-and-accounts]] (fila "Hosting de la aplicación") y en [[runbook-meta-whatsapp-setup]].
- [ ] Usar la URL en Meta: "Editar información del negocio" → sitio web. La política de privacidad es `https://<proyecto>.vercel.app/privacidad`.
- [ ] Entrada en [[CHANGELOG]].

## Más adelante

- Dominio propio a nombre del doctor ([[environments-and-accounts]]): se agrega en **Settings → Domains** sin cambiar el código.
- Antes del piloto con pacientes reales ([[README-planes]], Fase 3): migrar a Pro u otro host y revisar [[0002-runtime-del-backend]].

## Conexiones

- [[landing]]
- [[environments-and-accounts]]
- [[runbook-meta-whatsapp-setup]]
- [[fase-0-cimientos]]
- [[0002-runtime-del-backend]]
