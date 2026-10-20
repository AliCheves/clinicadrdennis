---
title: Bitácora del proyecto
status: en-curso
scope: todo el proyecto
last_updated: 2026-10-20
---

# Bitácora del proyecto

Qué pasó y cuándo, más reciente arriba. Cada fase cerrada, decisión, cuenta creada, incidente o rotación de secretos deja una entrada. Sin secretos ni datos reales de pacientes. Los detalles largos van en `docs/log/sesiones/`.

## Formato

```
## AAAA-MM-DD — título corto
- Qué cambió o pasó
- Estado en que quedó
- Enlaces: [[doc]] [[adr]]
```

---

## 2026-10-20 — Portafolio de Meta creado, vault y prompts

- En la clínica: el número de WhatsApp es estándar; se indicó pasarlo a WhatsApp Business. Queda por confirmar si se hizo y si es el número personal del doctor o una línea del consultorio.
- Se creó el portafolio de negocio de Meta con la cuenta del doctor: "Clínica de Reumatología Dr. Dennis Flores".
- Meta exige una URL de sitio web válida para guardar la información del negocio; se resuelve con la landing de [[fase-0-cimientos]]. Pendiente alinear el nombre legal con los documentos.
- Se creó este vault, tomando como modelo el del autódromo ([[0013-documentacion-como-vault]]), y los prompts de las fases 0 y 0.5.
- Al releer el PDF del doctor se corrigieron suposiciones previas: cancelación con 24 horas (no 2 a 4), agendar hasta 2 semanas adelante, la secretaria responde desde el mismo número, se pide fecha de nacimiento, el plazo marcado fue "1 a 2 semanas" y no está confirmado que exista un Excel de pacientes. Detalle en [[respuestas-doctor-cuestionario]].
- Enlaces: [[INDEX]] [[0011-numero-whatsapp-coexistencia]] [[runbook-meta-whatsapp-setup]]

## 2026-10-10 — Cuestionario respondido y propuesta entregada

- El doctor respondió el cuestionario de 16 preguntas ([[respuestas-doctor-cuestionario]]).
- Se entregó la propuesta de proyecto: monolito modular, esquema de 12 tablas, stack del panel, 10 decisiones cerradas, riesgos y plan por fases (documento en claude.ai: <https://claude.ai/code/artifact/ac6ea241-dbbd-4977-b1ae-7a292ce9d0a3>).
- Enlaces: [[README-decisiones]]
