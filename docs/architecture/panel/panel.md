---
title: Panel del doctor y la secretaria
status: en-curso
scope: src/app/(auth)/, src/app/(panel)/, src/lib/auth/, src/lib/supabase/, src/modules/agenda, src/modules/patients, src/modules/conversation, src/config/content/panel.ts
last_updated: 2026-11-25
verified_commit: 7755854
---

# Panel del doctor y la secretaria

Panel web para el personal del consultorio. En la Fase 0.5 trabaja con datos ficticios contra Supabase local:

- El doctor ve su semana y la agenda.
- La secretaria ve la agenda, los casos pendientes, las citas sin vincular y los pacientes.
- Los dos ven una vista previa de la bandeja de WhatsApp ([[0011-numero-whatsapp-coexistencia]]).

Todo el acceso a datos pasa por el servidor con la sesión del usuario: RLS es la segunda barrera ([[0010-acceso-a-datos-solo-por-servidor]]).

Estado: implementado lo de la Fase 0.5. Pendiente:
- Autenticación en dos pasos (TOTP), que se exige desde la Fase 3.
- Editar citas, responder en la bandeja y crear pacientes, que llegan con la Fase 1.

---

## Responsabilidades

- Autenticar al personal y dirigir a cada rol a su pantalla de inicio.
- Mostrar citas, horario, casos, citas sin vincular, pacientes y conversaciones en hora de El Salvador ([[0007-zona-horaria-y-fechas]]).
- Mostrar el DUI completo solo al doctor y dejar registro en `audit_log` ([[0009-datos-sensibles]]).
- Permitir a ambos roles asignar casos y cambiar su estado.

## Fronteras

- El navegador no consulta tablas: páginas y acciones son de servidor (`@supabase/ssr` con cookies). El login también es una acción de servidor.
- La clave de servicio no se usa en el panel. Solo la usa la semilla local.
- Sin datos estáticos en JSX: los textos viven en `src/config/content/panel.ts`.
- Sin lógica de negocio en componentes: las consultas y los cálculos viven en `src/modules/*` y se usan a través de su `index.ts` ([[0001-monolito-modular]]).
- Sin Supabase configurado (por ejemplo, en el despliegue de la landing), `/login` y `/panel/*` responden 404. Es la decisión D5 de [[fase-0-5-auditoria]].

## Datos

- Tablas: todas las de [[supabase-schema]] excepto `calendar_sync_state` y `reminders` (estas dos, solo lectura y sin pantalla todavía).
- Funciones de la base: `is_staff()`, `is_doctor()`, `is_secretary()`, `doctor_get_dui()` y `log_audit()`.
- Variables:
  - `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - `PII_ENCRYPTION_KEY` y `PII_HASH_KEY`, para descifrar el DUI en el servidor.

## Interfaz

### Rutas cubiertas

| Ruta | Rol | Qué muestra |
|---|---|---|
| `/login` | Público (404 sin Supabase) | Correo y contraseña. Si la cuenta no tiene rol activo, cierra la sesión y muestra un error |
| `/panel` | Ambos | Redirige: doctor → `/panel/semana`, secretaria → `/panel/agenda` |
| `/panel/semana` | Doctor | Totales por estado y citas de lunes a sábado. Navegación entre semanas con `?semana=AAAA-MM-DD` |
| `/panel/agenda` | Ambos | Franjas de `availability_rules` con sus citas, "Libre", "Sin consulta" y citas fuera del horario. Solo lectura |
| `/panel/casos` | Ambos | `handoff_requests` con filtro `?estado=`. Acciones: asignarme y cambiar el estado |
| `/panel/sin-vincular` | Ambos | Citas con `patient_id` nulo desde la semana actual, con el título de Calendar |
| `/panel/pacientes` | Ambos | Búsqueda `?q=` por nombre o teléfono (mínimo 2 caracteres) |
| `/panel/pacientes/[id]` | Ambos | Contacto, próximas citas e historial. DUI: la secretaria ve "Registrado"; el doctor tiene el botón "Ver DUI" (auditado) |
| `/panel/conversaciones` | Ambos | Vista previa de la bandeja, de solo lectura, con `?c=<id>` |

### Árbol de componentes

```
RootLayout (src/app/layout.tsx)
├── AuthLayout ((auth)/layout.tsx)            404 sin Supabase · noindex
│   └── LoginPage → LoginForm (cliente, useActionState → iniciarSesion)
└── PanelLayout ((panel)/panel/layout.tsx)    404 sin Supabase · noindex · <Suspense>
    └── PanelShell (servidor: requireStaff)   aviso de demo, nombre y rol, Cerrar sesión, NavPanel (cliente)
        ├── semana/page        Encabezado, NavegarSemana, totales, días → InsigniaCita
        ├── agenda/page        Encabezado, NavegarSemana, días → franjas → Cita
        ├── casos/page         filtros, casos → acciones (actualizarCaso)
        ├── sin-vincular/page
        ├── pacientes/page     búsqueda (GET)
        ├── pacientes/[id]/page → VerDui (cliente, useActionState → verDui)
        └── conversaciones/page lista + hilo de solo lectura
```

## Flujos

1. **Login:**
   1. `iniciarSesion` llama a `signInWithPassword`.
   2. `getStaff()` valida con `getUser()` y lee `staff_users` (activo).
   3. Redirige a la pantalla de inicio del rol.
2. **Cada página:** `requireStaff(roles)`.
   - Sin sesión → `/login`.
   - Rol no permitido → la pantalla de inicio de su rol.
   - Después consulta los módulos con el cliente del usuario.
3. **Ver DUI** (solo el doctor):
   1. La acción `verDui` hace `requireStaff(["doctor"])`.
   2. `revelarDui()` llama a `rpc("doctor_get_dui")`. La base vuelve a verificar el rol y registra `dui_revelado` en la misma transacción.
   3. El servidor descifra con AES-256-GCM y devuelve `########-#` solo a esa respuesta.
4. **Casos:** `actualizarCaso` asigna o cambia el estado y hace `revalidatePath`.
5. Con `cacheComponents` activo, la sesión se lee dentro del `<Suspense>` del layout: el shell es estático y los datos llegan en streaming (prerender parcial).

## Errores y casos borde

- Una cuenta de Auth sin fila en `staff_users`, o inactiva: no entra; el login la desconecta.
- Un `id` de paciente que no es UUID, o que no existe: 404.
- Una búsqueda de menos de 2 caracteres o con símbolos: se limpia y no consulta.
- El DUI no se puede descifrar (clave cambiada): mensaje genérico, sin detalles.
- Sin variables de Supabase: 404 en `/login` y `/panel/*`. El build de la landing no falla, comprobado sin `.env.local`.

## Pruebas

- `tests/e2e-panel/panel.spec.ts` (`npm run test:e2e:panel`, contra Supabase local con la semilla):
  - login y error;
  - redirección por rol;
  - la secretaria no puede abrir "Esta semana";
  - el DUI no aparece en el HTML de la secretaria;
  - el doctor revela el DUI y queda un `dui_revelado` en la auditoría;
  - búsqueda, asignación de casos y cierre de sesión;
  - cada pantalla de cada rol a 375 px, sin scroll horizontal, sin errores de consola y sin violaciones axe WCAG 2.1 AA.
- pgTAP de RLS: ver [[supabase-schema]].
- CI: el trabajo "Base de datos y panel" levanta Supabase local en el runner.

## Notas

- **Dos pasos (TOTP): no implementado todavía.** La auditoría lo proponía para esta fase y exigirlo desde la Fase 3 (D2). Queda como requisito antes de operar con datos reales.
- Las citas canceladas se muestran tachadas, no con opacidad, para cumplir contraste AA.
- El aviso "Datos de demostración" aparece cuando la URL de Supabase es local.

## Conexiones

- [[INDEX]]
- [[supabase-schema]]
- [[security-and-privacy]]
- [[modules-overview]]
- [[testing-local-supabase]]
- [[fase-0-5-esquema-y-panel]]
- [[fase-0-5-auditoria]]
- [[guion-demo-doctor]]
- [[0010-acceso-a-datos-solo-por-servidor]]
- [[0011-numero-whatsapp-coexistencia]]
