"use server";

import { redirect } from "next/navigation";
import { panel } from "@/config/content/panel";
import { getStaff, homeFor } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

export type EstadoLogin = { error: string | null };

export async function iniciarSesion(_prev: EstadoLogin, form: FormData): Promise<EstadoLogin> {
  const correo = String(form.get("correo") ?? "").trim();
  const contrasena = String(form.get("contrasena") ?? "");
  if (!correo || !contrasena) return { error: panel.login.errorCredenciales };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email: correo, password: contrasena });
  if (error) return { error: panel.login.errorCredenciales };

  const staff = await getStaff();
  if (!staff) {
    await supabase.auth.signOut();
    return { error: panel.login.errorSinRol };
  }
  redirect(homeFor(staff.role));
}
