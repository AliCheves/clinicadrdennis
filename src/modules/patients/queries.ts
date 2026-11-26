// Pacientes: búsqueda, ficha y revelado del DUI. Solo este módulo toca el DUI (modules-overview).

import type { SupabaseClient } from "@supabase/supabase-js";
import { decryptDui, formatDui, fromPgBytea, loadDuiKeys } from "@/lib/crypto";
import type { Database } from "@/types/database";

type Db = SupabaseClient<Database>;
type Enums = Database["public"]["Enums"];

export type PacienteResumen = {
  id: string;
  nombre: string;
  telefono: string;
  tieneDui: boolean;
};

export type CitaDePaciente = {
  id: string;
  inicio: string;
  estado: Enums["appointment_status"];
  tipo: string | null;
};

export type FichaPaciente = PacienteResumen & {
  correo: string | null;
  nacimiento: string | null;
  proximas: CitaDePaciente[];
  anteriores: CitaDePaciente[];
};

// Columnas permitidas: dui_encrypted no se puede leer con SELECT (ver migración de RLS).
const COLUMNAS = "id, full_name, phone_e164, dui_hash, email, birth_date";

function aResumen(p: { id: string; full_name: string; phone_e164: string; dui_hash: unknown }): PacienteResumen {
  return { id: p.id, nombre: p.full_name, telefono: p.phone_e164, tieneDui: p.dui_hash !== null };
}

// Texto libre → filtro seguro: solo letras, números, espacios y algunos signos de nombre.
export function normalizarBusqueda(q: string): { campo: "telefono" | "nombre"; valor: string } | null {
  const limpio = q.normalize("NFC").replace(/[^\p{L}\p{N}\s.'-]/gu, "").trim();
  if (limpio.length < 2) return null;
  const digitos = limpio.replace(/\D/g, "");
  if (digitos.length >= 3 && digitos.length === limpio.replace(/[\s-]/g, "").length) {
    return { campo: "telefono", valor: digitos };
  }
  return { campo: "nombre", valor: limpio };
}

export async function buscarPacientes(db: Db, q: string): Promise<PacienteResumen[]> {
  const filtro = normalizarBusqueda(q);
  if (!filtro) return [];
  const consulta = db.from("patients").select(COLUMNAS).order("full_name").limit(50);
  const { data, error } =
    filtro.campo === "telefono"
      ? await consulta.ilike("phone_e164", `%${filtro.valor}%`)
      : await consulta.ilike("full_name", `%${filtro.valor}%`);
  if (error) throw new Error("No se pudo buscar pacientes");
  return data.map(aResumen);
}

export async function fichaPaciente(db: Db, id: string, ahora: Date = new Date()): Promise<FichaPaciente | null> {
  const { data: p, error } = await db.from("patients").select(COLUMNAS).eq("id", id).maybeSingle();
  if (error) throw new Error("No se pudo leer el paciente");
  if (!p) return null;

  const { data: citas, error: e2 } = await db
    .from("appointments")
    .select("id, starts_at, status, appointment_types(name)")
    .eq("patient_id", id)
    .order("starts_at", { ascending: false });
  if (e2) throw new Error("No se pudieron leer las citas del paciente");

  const lista = citas.map((c) => ({ id: c.id, inicio: c.starts_at, estado: c.status, tipo: c.appointment_types?.name ?? null }));
  const t = ahora.getTime();
  return {
    ...aResumen(p),
    correo: p.email,
    nacimiento: p.birth_date,
    proximas: lista.filter((c) => new Date(c.inicio).getTime() >= t).reverse(),
    anteriores: lista.filter((c) => new Date(c.inicio).getTime() < t),
  };
}

// Solo el doctor: la función de la base verifica el rol y deja la auditoría en la misma transacción.
// El descifrado ocurre aquí, en el servidor. El DUI nunca se escribe en logs.
export async function revelarDui(db: Db, pacienteId: string): Promise<string | null> {
  const { data, error } = await db.rpc("doctor_get_dui", { p_patient_id: pacienteId });
  if (error) throw new Error("No autorizado para ver el DUI");
  if (!data) return null;
  return formatDui(decryptDui(fromPgBytea(data), loadDuiKeys()));
}

// "+50370000001" → "+503 7000-0001". Otros países se muestran tal cual.
export function formatearTelefono(e164: string): string {
  const m = /^\+503(\d{4})(\d{4})$/.exec(e164);
  return m ? `+503 ${m[1]}-${m[2]}` : e164;
}
