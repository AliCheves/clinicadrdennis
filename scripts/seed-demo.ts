// Semilla de DEMOSTRACIÓN para Supabase LOCAL. Datos 100 % ficticios (AGENTS.md, regla 2).
//
// Uso: npm run db:demo   (reinicia la base local y siembra)
//
// Barreras para que nunca llegue a producción (auditoría de Fase 0.5, §7):
//   1. Se niega a correr si NEXT_PUBLIC_SUPABASE_URL no es 127.0.0.1 o localhost.
//   2. Exige ALLOW_DEMO_SEED=1.
//   3. Se niega si ya hay pacientes en la base.
// Las cuentas de demo usan una contraseña local conocida: no es un secreto y no sirve fuera de local.

import { createClient } from "@supabase/supabase-js";
import { encryptDui, hashDui, loadDuiKeys, toPgBytea } from "../src/lib/crypto";
import { diasHabiles, diaDeSemana, inicioDeSemana, instanteLocal, sumarSemanas } from "../src/modules/agenda";
import type { Database } from "../src/types/database";

type Enums = Database["public"]["Enums"];
type CitaInsert = Database["public"]["Tables"]["appointments"]["Insert"];

const DEMO_PASSWORD = "demo-local-2026";
const PREFIJO = "Paciente de Prueba";

function salir(mensaje: string): never {
  console.error(`✗ ${mensaje}`);
  process.exit(1);
}

// --- Barreras -----------------------------------------------------------------------------------
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
let host = "";
try {
  host = new URL(url).hostname;
} catch {
  salir("NEXT_PUBLIC_SUPABASE_URL no es una URL válida.");
}
if (host !== "127.0.0.1" && host !== "localhost") salir(`La semilla de demo solo corre contra Supabase local (recibí ${host}).`);
if (process.env.ALLOW_DEMO_SEED !== "1") salir("Falta ALLOW_DEMO_SEED=1.");
if (!serviceKey) salir("Falta SUPABASE_SERVICE_ROLE_KEY (local) en .env.local.");

const db = createClient<Database>(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const claves = loadDuiKeys();

// --- Aleatoriedad determinista ------------------------------------------------------------------
let estado = 20261126;
function azar(): number {
  estado = (estado + 0x6d2b79f5) | 0;
  let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const elegir = <T,>(xs: readonly T[]): T => xs[Math.floor(azar() * xs.length)];
const pad = (n: number, w: number) => String(n).padStart(w, "0");

// --- Pacientes ficticios ------------------------------------------------------------------------
const NOMBRES = [
  "Ana Martínez", "Carlos Hernández", "María López", "José Ramírez", "Rosa Flores", "Luis Mejía",
  "Carmen Rivas", "Jorge Castillo", "Elena Portillo", "Miguel Alvarado", "Sofía Cruz", "Ricardo Guzmán",
  "Patricia Romero", "Francisco Orellana", "Gloria Aguilar", "Manuel Escobar", "Teresa Molina",
  "Roberto Pineda", "Isabel Campos", "Fernando Rosales", "Lucía Menjívar", "Óscar Ayala", "Marta Quintanilla",
  "Daniel Sorto", "Beatriz Henríquez", "Raúl Navarro", "Silvia Argueta", "Alberto Cornejo", "Claudia Chávez",
  "Ernesto Vásquez", "Verónica Bonilla", "Hugo Ventura", "Norma Salazar", "Mauricio Peña", "Lorena Galdámez",
  "Andrés Barrera", "Cecilia Moreno", "Julio Zelaya", "Karla Domínguez", "Rafael Durán",
] as const;

async function main() {
  const { count } = await db.from("patients").select("id", { count: "exact", head: true });
  if ((count ?? 0) > 0) salir("La base ya tiene pacientes. Usa `npm run db:demo`, que reinicia la base local primero.");

  // Personal --------------------------------------------------------------------------------------
  const personal: { email: string; nombre: string; rol: Enums["staff_role"]; telefono: string | null }[] = [
    { email: "doctor@demo.local", nombre: "Doctor (cuenta de demostración)", rol: "doctor", telefono: null },
    { email: "secretaria@demo.local", nombre: "Secretaria (cuenta de demostración)", rol: "secretaria", telefono: "+50300009990" },
  ];
  const staffIds: Record<Enums["staff_role"], string> = { doctor: "", secretaria: "" };
  for (const p of personal) {
    const { data, error } = await db.auth.admin.createUser({ email: p.email, password: DEMO_PASSWORD, email_confirm: true });
    if (error || !data.user) salir(`No se pudo crear ${p.email}: ${error?.message}`);
    const { data: staff, error: e2 } = await db
      .from("staff_users")
      .insert({ auth_user_id: data.user.id, full_name: p.nombre, role: p.rol, phone_e164: p.telefono })
      .select("id")
      .single();
    if (e2) salir(`No se pudo crear el personal ${p.email}: ${e2.message}`);
    staffIds[p.rol] = staff.id;
  }

  // Pacientes -------------------------------------------------------------------------------------
  const pacientes = NOMBRES.map((nombre, i) => {
    const n = i + 1;
    const conDui = azar() < 0.7;
    const dui = `00000${pad(n, 3)}0`; // ficticio e inválido a propósito
    const anio = 1948 + Math.floor(azar() * 55);
    return {
      full_name: `${PREFIJO} — ${nombre}`,
      phone_e164: `+5030000${pad(n, 4)}`,
      birth_date: `${anio}-${pad(1 + Math.floor(azar() * 12), 2)}-${pad(1 + Math.floor(azar() * 28), 2)}`,
      email: azar() < 0.5 ? `paciente.prueba${pad(n, 2)}@ejemplo.invalid` : null,
      dui_encrypted: conDui ? toPgBytea(encryptDui(dui, claves)) : null,
      dui_hash: conDui ? toPgBytea(hashDui(dui, claves)) : null,
      consent_at: new Date(Date.now() - (30 + Math.floor(azar() * 300)) * 86_400_000).toISOString(),
      consent_text_version: "demo-v0",
      source: "semilla",
    };
  });
  const { data: filasPacientes, error: ep } = await db.from("patients").insert(pacientes).select("id, full_name, phone_e164, email");
  if (ep || !filasPacientes) salir(`No se pudieron crear los pacientes: ${ep?.message}`);

  // Citas -----------------------------------------------------------------------------------------
  const { data: reglas } = await db.from("availability_rules").select("*");
  if (!reglas?.length) salir("No hay horario en availability_rules: ¿se aplicaron las migraciones?");

  const ahora = new Date();
  const lunesActual = inicioDeSemana(ahora);
  const semanas = [
    { desplazamiento: -2, ocupacion: 0.8 },
    { desplazamiento: -1, ocupacion: 0.85 },
    { desplazamiento: 0, ocupacion: 0.8 },
    { desplazamiento: 1, ocupacion: 0.6 },
    { desplazamiento: 2, ocupacion: 0.35 },
  ];
  const titulosSinVincular = [
    "Consulta — confirmar nombre",
    "Control (llamó por teléfono)",
    "Primera vez · sin teléfono",
    "Reservado — secretaria",
  ];

  const citas: CitaInsert[] = [];
  let evento = 0;
  for (const s of semanas) {
    const lunes = sumarSemanas(lunesActual, s.desplazamiento);
    const usadosEnSemana = new Set<number>();
    for (const dia of diasHabiles(lunes)) {
      for (const regla of reglas.filter((r) => r.weekday === diaDeSemana(dia))) {
        let inicio = instanteLocal(dia, regla.start_time);
        const fin = instanteLocal(dia, regla.end_time);
        while (inicio < fin) {
          const termina = new Date(inicio.getTime() + regla.slot_step_min * 60_000);
          if (azar() < s.ocupacion) {
            const pasada = termina <= ahora;
            const sinVincular = azar() < (pasada ? 0.02 : 0.06);
            let idx = Math.floor(azar() * filasPacientes.length);
            for (let k = 0; k < filasPacientes.length && usadosEnSemana.has(idx); k++) idx = (idx + 1) % filasPacientes.length;
            usadosEnSemana.add(idx);
            const paciente = filasPacientes[idx];

            const r = azar();
            let status: Enums["appointment_status"];
            if (pasada) status = r < 0.8 ? "completada" : r < 0.9 ? "no_asistio" : "cancelada";
            else {
              const enDosDias = inicio.getTime() - ahora.getTime() < 2 * 86_400_000;
              status = enDosDias ? (r < 0.6 ? "confirmada" : r < 0.95 ? "programada" : "cancelada") : r < 0.12 ? "confirmada" : r < 0.95 ? "programada" : "cancelada";
            }
            const source: Enums["appointment_source"] = sinVincular
              ? "calendario_manual"
              : elegir(["bot", "bot", "bot", "calendario_manual", "calendario_manual", "panel"] as const);
            const tipo = azar() < 0.25 ? 1 : 2;
            const telefonoCorto = paciente.phone_e164.slice(4, 8) + "-" + paciente.phone_e164.slice(8);
            const nombreCorto = paciente.full_name.replace(`${PREFIJO} — `, "");
            evento++;

            citas.push({
              patient_id: sinVincular ? null : paciente.id,
              type_id: sinVincular && azar() < 0.5 ? null : tipo,
              starts_at: inicio.toISOString(),
              ends_at: termina.toISOString(),
              status,
              source,
              google_event_id: `demo-evento-${pad(evento, 4)}`,
              calendar_title: sinVincular
                ? elegir(titulosSinVincular)
                : source === "calendario_manual"
                  ? `${nombreCorto} · ${telefonoCorto} · ${tipo === 1 ? "Primera vez" : "Control"}`
                  : null,
              confirmed_at: status === "confirmada" ? new Date(inicio.getTime() - 86_400_000).toISOString() : null,
              cancelled_at: status === "cancelada" ? new Date(inicio.getTime() - 2 * 86_400_000).toISOString() : null,
              cancel_reason: status === "cancelada" ? "El paciente pidió reprogramar" : null,
              created_by: source === "panel" ? staffIds.secretaria : null,
            });
          }
          inicio = termina;
        }
      }
    }
  }
  const { data: filasCitas, error: ec } = await db.from("appointments").insert(citas).select("id, patient_id, starts_at, status");
  if (ec || !filasCitas) salir(`No se pudieron crear las citas: ${ec?.message}`);

  // Recordatorios (ADR-0012): uno por cita, canal y tipo --------------------------------------------
  const conCorreo = new Set(filasPacientes.filter((p) => p.email).map((p) => p.id));
  const recordatorios = filasCitas
    .filter((c) => c.patient_id && c.status !== "cancelada")
    .flatMap((c) => {
      const inicio = new Date(c.starts_at).getTime();
      const canales: Enums["reminder_channel"][] = conCorreo.has(c.patient_id!) ? ["whatsapp", "email"] : ["whatsapp"];
      return canales.flatMap((channel) =>
        (["dos_dias", "mismo_dia"] as const).map((kind) => {
          const scheduled = new Date(inicio - (kind === "dos_dias" ? 2 * 86_400_000 : 3 * 3_600_000));
          const enviado = scheduled <= ahora;
          return {
            appointment_id: c.id,
            channel,
            kind,
            scheduled_for: scheduled.toISOString(),
            status: (enviado ? "enviado" : "pendiente") as Enums["reminder_status"],
            sent_at: enviado ? scheduled.toISOString() : null,
          };
        }),
      );
    });
  const { error: er } = await db.from("reminders").insert(recordatorios);
  if (er) salir(`No se pudieron crear los recordatorios: ${er.message}`);

  // Conversaciones y casos (vista previa de la bandeja) ---------------------------------------------
  const hace = (min: number) => new Date(ahora.getTime() - min * 60_000).toISOString();
  type Msg = { dir: "in" | "out"; kind?: "texto" | "boton" | "lista" | "plantilla"; body: string; staff?: boolean; min: number };
  type Guion = {
    paciente: number | null;
    telefono?: string;
    mensajes: Msg[];
    caso?: { reason: string; status: Enums["handoff_status"]; asignar?: boolean; nota?: string };
  };
  const menu =
    "¡Hola! Soy el asistente de citas del consultorio. ¿Qué deseas hacer?\n1. Agendar una cita\n2. Consultar mi cita\n3. Cancelar o reprogramar";

  const guiones: Guion[] = [
    {
      paciente: 0,
      mensajes: [
        { dir: "in", body: "Hola, quiero agendar una cita", min: 50 },
        { dir: "out", kind: "lista", body: menu, min: 50 },
        { dir: "in", kind: "lista", body: "Agendar una cita", min: 49 },
        { dir: "out", kind: "boton", body: "¿Es tu primera consulta o un control?", min: 49 },
        { dir: "in", kind: "boton", body: "Control", min: 48 },
        { dir: "out", kind: "lista", body: "Estos son los próximos horarios disponibles. Elige uno:", min: 48 },
        { dir: "in", kind: "lista", body: "Viernes 2:00 p. m.", min: 47 },
        { dir: "out", body: "Listo, tu cita quedó agendada. Te enviaremos un recordatorio dos días antes y el mismo día.", min: 47 },
      ],
    },
    {
      paciente: 1,
      mensajes: [
        { dir: "in", body: "Buenas, necesito cancelar mi cita de hoy", min: 35 },
        { dir: "out", kind: "lista", body: menu, min: 35 },
        { dir: "in", kind: "lista", body: "Cancelar o reprogramar", min: 34 },
        {
          dir: "out",
          body: "Tu cita es en menos de 24 horas, así que no puedo cancelarla por aquí. Una persona del consultorio te escribirá en breve.",
          min: 34,
        },
      ],
      caso: { reason: "Quiere cancelar con menos de 24 horas de anticipación", status: "abierto" },
    },
    {
      paciente: null,
      telefono: "+50300009901",
      mensajes: [
        { dir: "in", body: "¿Atienden con seguro médico?", min: 120 },
        { dir: "out", body: "No entendí tu mensaje. Una persona del consultorio te responderá pronto.", min: 120 },
      ],
      caso: { reason: "Mensaje que el asistente no entendió", status: "abierto" },
    },
    {
      paciente: 2,
      mensajes: [
        { dir: "in", body: "Quisiera reprogramar para un martes", min: 240 },
        { dir: "out", body: "Los martes no hay consulta. Una persona del consultorio te ayudará a buscar otro horario.", min: 240 },
        { dir: "out", body: "Buenas tardes, con gusto le ayudo. ¿Le funciona el miércoles a las 3:30 p. m.?", staff: true, min: 200 },
      ],
      caso: { reason: "Pide un horario fuera de la agenda", status: "en_curso", asignar: true },
    },
    {
      paciente: 3,
      mensajes: [
        { dir: "out", kind: "plantilla", body: "Recordatorio: tienes cita en el consultorio en dos días. ¿Confirmas tu asistencia?", min: 1500 },
        { dir: "in", kind: "boton", body: "Confirmar", min: 1490 },
        { dir: "out", body: "¡Gracias! Tu cita quedó confirmada.", min: 1490 },
      ],
    },
    {
      paciente: 4,
      mensajes: [
        { dir: "in", body: "¿Me pueden ayudar? No me llegó el recordatorio", min: 2900 },
        { dir: "out", body: "Una persona del consultorio te responderá pronto.", min: 2900 },
        { dir: "out", body: "Buen día, su cita sigue en pie para el jueves. Gracias por avisar.", staff: true, min: 2800 },
      ],
      caso: { reason: "Consulta sobre un recordatorio", status: "resuelto", asignar: true, nota: "Se confirmó la cita por WhatsApp." },
    },
    {
      paciente: 5,
      mensajes: [
        { dir: "in", body: "Hola, ¿qué días atiende el doctor?", min: 15 },
        { dir: "out", body: "Una persona del consultorio te responderá pronto.", min: 15 },
      ],
      caso: { reason: "Pregunta por el horario de atención", status: "abierto" },
    },
    {
      paciente: 6,
      mensajes: [
        { dir: "out", kind: "plantilla", body: "Recordatorio: hoy tienes cita en el consultorio. ¿Confirmas tu asistencia?", min: 600 },
        { dir: "in", kind: "boton", body: "Cancelar", min: 590 },
        { dir: "out", body: "Tu cita es en menos de 24 horas. Una persona del consultorio te escribirá.", min: 590 },
        { dir: "out", body: "Entendido, ya cancelamos su cita. ¿Desea agendar para la próxima semana?", staff: true, min: 560 },
      ],
      caso: { reason: "Quiere cancelar con menos de 24 horas de anticipación", status: "resuelto", asignar: true, nota: "Se canceló y se ofreció nueva fecha." },
    },
  ];

  for (const g of guiones) {
    const paciente = g.paciente === null ? null : filasPacientes[g.paciente];
    const ultima = Math.min(...g.mensajes.map((m) => m.min));
    const ultimaEntrante = Math.min(...g.mensajes.filter((m) => m.dir === "in").map((m) => m.min));
    const { data: conv, error: e1 } = await db
      .from("conversations")
      .insert({
        wa_phone: paciente?.phone_e164 ?? g.telefono!,
        patient_id: paciente?.id ?? null,
        state: g.caso && g.caso.status !== "resuelto" ? "derivado" : "inicio",
        needs_human: !!g.caso && g.caso.status !== "resuelto",
        last_inbound_at: Number.isFinite(ultimaEntrante) ? hace(ultimaEntrante) : null,
        updated_at: hace(ultima),
      })
      .select("id")
      .single();
    if (e1) salir(`No se pudo crear una conversación: ${e1.message}`);

    const { error: e2 } = await db.from("messages").insert(
      g.mensajes.map((m, i) => ({
        conversation_id: conv.id,
        direction: m.dir,
        kind: m.kind ?? "texto",
        body: m.body,
        sent_by: m.staff ? staffIds.secretaria : null,
        delivery_status: m.dir === "out" ? "leido" : null,
        created_at: new Date(new Date(hace(m.min)).getTime() + i * 1000).toISOString(),
      })),
    );
    if (e2) salir(`No se pudieron crear los mensajes: ${e2.message}`);

    if (g.caso) {
      const creado = Math.max(...g.mensajes.map((m) => m.min));
      const { error: e3 } = await db.from("handoff_requests").insert({
        conversation_id: conv.id,
        reason: g.caso.reason,
        status: g.caso.status,
        assigned_to: g.caso.asignar ? staffIds.secretaria : null,
        resolution_note: g.caso.nota ?? null,
        created_at: hace(creado),
        resolved_at: g.caso.status === "resuelto" ? hace(ultima) : null,
      });
      if (e3) salir(`No se pudo crear un caso: ${e3.message}`);
    }
  }

  const sinVincular = citas.filter((c) => c.patient_id === null).length;
  console.log("✓ Semilla de demostración lista (solo local)");
  console.log(`  Pacientes: ${filasPacientes.length} · Citas: ${filasCitas.length} (${sinVincular} sin vincular) · Recordatorios: ${recordatorios.length}`);
  console.log(`  Conversaciones: ${guiones.length} · Casos: ${guiones.filter((g) => g.caso).length}`);
  console.log(`  Cuentas: doctor@demo.local y secretaria@demo.local · contraseña local: ${DEMO_PASSWORD}`);
}

main().catch((e) => salir(e instanceof Error ? e.message : String(e)));
