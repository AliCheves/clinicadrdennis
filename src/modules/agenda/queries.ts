// Lecturas de la agenda. Reciben el cliente de Supabase del servidor (RLS aplica).

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { claveDia, diaDeSemana, diasHabiles, instanteLocal, rangoDeSemana } from "./time";

type Db = SupabaseClient<Database>;
type Enums = Database["public"]["Enums"];

export type CitaDeSemana = {
  id: string;
  inicio: string;
  fin: string;
  estado: Enums["appointment_status"];
  origen: Enums["appointment_source"];
  pacienteId: string | null;
  paciente: string | null;
  tipo: string | null;
  tituloCalendar: string | null;
};

export type ReglaHorario = Database["public"]["Tables"]["availability_rules"]["Row"];

export async function citasDeSemana(db: Db, lunes: Date): Promise<CitaDeSemana[]> {
  const { desde, hasta } = rangoDeSemana(lunes);
  const { data, error } = await db
    .from("appointments")
    .select("id, starts_at, ends_at, status, source, patient_id, calendar_title, patients(full_name), appointment_types(name)")
    .gte("starts_at", desde.toISOString())
    .lt("starts_at", hasta.toISOString())
    .order("starts_at");
  if (error) throw new Error("No se pudieron leer las citas");
  return data.map((c) => ({
    id: c.id,
    inicio: c.starts_at,
    fin: c.ends_at,
    estado: c.status,
    origen: c.source,
    pacienteId: c.patient_id,
    paciente: c.patients?.full_name ?? null,
    tipo: c.appointment_types?.name ?? null,
    tituloCalendar: c.calendar_title,
  }));
}

export async function reglasDeHorario(db: Db): Promise<ReglaHorario[]> {
  const { data, error } = await db.from("availability_rules").select("*").order("weekday").order("start_time");
  if (error) throw new Error("No se pudo leer el horario");
  return data;
}

export async function citasSinVincular(db: Db, desde: Date): Promise<CitaDeSemana[]> {
  const { data, error } = await db
    .from("appointments")
    .select("id, starts_at, ends_at, status, source, patient_id, calendar_title, appointment_types(name)")
    .is("patient_id", null)
    .neq("status", "cancelada")
    .gte("starts_at", desde.toISOString())
    .order("starts_at");
  if (error) throw new Error("No se pudieron leer las citas sin vincular");
  return data.map((c) => ({
    id: c.id,
    inicio: c.starts_at,
    fin: c.ends_at,
    estado: c.status,
    origen: c.source,
    pacienteId: null,
    paciente: null,
    tipo: c.appointment_types?.name ?? null,
    tituloCalendar: c.calendar_title,
  }));
}

// Agrupa las citas por día local, de lunes a sábado.
export function agruparPorDia(lunes: Date, citas: CitaDeSemana[]) {
  return diasHabiles(lunes).map((dia) => ({
    dia,
    citas: citas.filter((c) => claveDia(new Date(c.inicio)) === claveDia(dia)),
  }));
}

export type Franja = { inicio: Date; fin: Date; citas: CitaDeSemana[] };

export type DiaDeAgenda = {
  dia: Date;
  conConsulta: boolean;
  franjas: Franja[];
  fueraDeHorario: CitaDeSemana[];
};

function reglaVigente(regla: ReglaHorario, dia: Date): boolean {
  const clave = claveDia(dia);
  return regla.weekday === diaDeSemana(dia) && regla.valid_from <= clave && (!regla.valid_to || regla.valid_to >= clave);
}

// Arma la agenda de la semana: franjas del horario con sus citas y las citas fuera del horario.
export function armarAgenda(lunes: Date, reglas: ReglaHorario[], citas: CitaDeSemana[]): DiaDeAgenda[] {
  const activas = citas.filter((c) => c.estado !== "cancelada");
  return agruparPorDia(lunes, activas).map(({ dia, citas: delDia }) => {
    const franjas: Franja[] = [];
    for (const regla of reglas.filter((r) => reglaVigente(r, dia))) {
      let inicio = instanteLocal(dia, regla.start_time);
      const finRegla = instanteLocal(dia, regla.end_time);
      while (inicio < finRegla) {
        const fin = new Date(inicio.getTime() + regla.slot_step_min * 60_000);
        franjas.push({
          inicio,
          fin,
          citas: delDia.filter((c) => {
            const t = new Date(c.inicio).getTime();
            return t >= inicio.getTime() && t < fin.getTime();
          }),
        });
        inicio = fin;
      }
    }
    const enFranja = new Set(franjas.flatMap((f) => f.citas.map((c) => c.id)));
    return {
      dia,
      conConsulta: franjas.length > 0,
      franjas,
      fueraDeHorario: delDia.filter((c) => !enFranja.has(c.id)),
    };
  });
}
