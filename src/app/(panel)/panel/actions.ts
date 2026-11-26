"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { ESTADOS_CASO, asignarCaso, cambiarEstadoCaso, type EstadoCaso } from "@/modules/conversation";
import { revelarDui } from "@/modules/patients";

export async function cerrarSesion() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function actualizarCaso(form: FormData) {
  const staff = await requireStaff(["doctor", "secretaria"]);
  const id = String(form.get("id") ?? "");
  const accion = String(form.get("accion") ?? "");
  const supabase = await createServerSupabase();

  if (accion === "asignarme") {
    await asignarCaso(supabase, id, staff.staffId);
  } else if (ESTADOS_CASO.includes(accion as EstadoCaso)) {
    await cambiarEstadoCaso(supabase, id, accion as EstadoCaso);
  }
  revalidatePath("/panel/casos");
}

export type EstadoDui = { dui: string | null; error: string | null };

// Solo el doctor. La base verifica el rol de nuevo y registra la auditoría.
export async function verDui(_prev: EstadoDui, form: FormData): Promise<EstadoDui> {
  await requireStaff(["doctor"]);
  const id = String(form.get("pacienteId") ?? "");
  try {
    const supabase = await createServerSupabase();
    return { dui: await revelarDui(supabase, id), error: null };
  } catch {
    return { dui: null, error: "No se pudo obtener el DUI." };
  }
}
