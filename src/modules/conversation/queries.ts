// Casos pendientes y conversaciones (vista previa de la bandeja, ADR-0011 opción C).

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Db = SupabaseClient<Database>;
type Enums = Database["public"]["Enums"];
export type EstadoCaso = Enums["handoff_status"];

export const ESTADOS_CASO: EstadoCaso[] = ["abierto", "en_curso", "resuelto"];

export type Caso = {
  id: string;
  motivo: string;
  estado: EstadoCaso;
  creado: string;
  resuelto: string | null;
  asignadoId: string | null;
  asignado: string | null;
  conversacionId: string;
  telefono: string;
  paciente: string | null;
};

export type Personal = { id: string; nombre: string };

export async function listarCasos(db: Db, estado?: EstadoCaso): Promise<Caso[]> {
  let consulta = db
    .from("handoff_requests")
    .select(
      "id, reason, status, created_at, resolved_at, assigned_to, conversation_id, staff_users(full_name), conversations(wa_phone, patients(full_name))",
    )
    .order("created_at", { ascending: false });
  if (estado) consulta = consulta.eq("status", estado);
  const { data, error } = await consulta;
  if (error) throw new Error("No se pudieron leer los casos");
  return data.map((c) => ({
    id: c.id,
    motivo: c.reason,
    estado: c.status,
    creado: c.created_at,
    resuelto: c.resolved_at,
    asignadoId: c.assigned_to,
    asignado: c.staff_users?.full_name ?? null,
    conversacionId: c.conversation_id,
    telefono: c.conversations?.wa_phone ?? "",
    paciente: c.conversations?.patients?.full_name ?? null,
  }));
}

export async function listarPersonal(db: Db): Promise<Personal[]> {
  const { data, error } = await db.from("staff_users").select("id, full_name").eq("active", true).order("full_name");
  if (error) throw new Error("No se pudo leer el personal");
  return data.map((s) => ({ id: s.id, nombre: s.full_name }));
}

export async function cambiarEstadoCaso(db: Db, id: string, estado: EstadoCaso): Promise<void> {
  const { error } = await db
    .from("handoff_requests")
    .update({ status: estado, resolved_at: estado === "resuelto" ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw new Error("No se pudo cambiar el estado del caso");
}

export async function asignarCaso(db: Db, id: string, staffId: string): Promise<void> {
  const { error } = await db.from("handoff_requests").update({ assigned_to: staffId }).eq("id", id);
  if (error) throw new Error("No se pudo asignar el caso");
}

export type ConversacionResumen = {
  id: string;
  telefono: string;
  paciente: string | null;
  necesitaPersona: boolean;
  actualizada: string;
  ultimoMensaje: string | null;
};

export type Mensaje = {
  id: string;
  direccion: "in" | "out";
  tipo: string;
  texto: string | null;
  enviadoPor: string | null;
  fecha: string;
};

export async function listarConversaciones(db: Db): Promise<ConversacionResumen[]> {
  const { data, error } = await db
    .from("conversations")
    .select("id, wa_phone, needs_human, updated_at, patients(full_name), messages(body, created_at)")
    .order("updated_at", { ascending: false })
    .order("created_at", { referencedTable: "messages", ascending: false })
    .limit(1, { referencedTable: "messages" });
  if (error) throw new Error("No se pudieron leer las conversaciones");
  return data.map((c) => ({
    id: c.id,
    telefono: c.wa_phone,
    paciente: c.patients?.full_name ?? null,
    necesitaPersona: c.needs_human,
    actualizada: c.updated_at,
    ultimoMensaje: c.messages[0]?.body ?? null,
  }));
}

export async function mensajesDe(db: Db, conversacionId: string): Promise<Mensaje[]> {
  const { data, error } = await db
    .from("messages")
    .select("id, direction, kind, body, created_at, staff_users(full_name)")
    .eq("conversation_id", conversacionId)
    .order("created_at");
  if (error) throw new Error("No se pudieron leer los mensajes");
  return data.map((m) => ({
    id: m.id,
    direccion: m.direction as "in" | "out",
    tipo: m.kind,
    texto: m.body,
    enviadoPor: m.staff_users?.full_name ?? null,
    fecha: m.created_at,
  }));
}
