// Sesión y rol del personal, verificados en el servidor en cada página y acción (ADR-0010).

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

export type StaffRole = Database["public"]["Enums"]["staff_role"];

export type Staff = {
  authUserId: string;
  staffId: string;
  fullName: string;
  role: StaffRole;
};

// getUser() valida el token con Supabase Auth; nunca se confía solo en la cookie.
export async function getStaff(): Promise<Staff | null> {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data } = await supabase
    .from("staff_users")
    .select("id, full_name, role, active")
    .eq("auth_user_id", auth.user.id)
    .maybeSingle();
  if (!data || !data.active) return null;

  return { authUserId: auth.user.id, staffId: data.id, fullName: data.full_name, role: data.role };
}

export async function requireStaff(roles?: StaffRole[]): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) redirect("/login");
  if (roles && !roles.includes(staff.role)) redirect(homeFor(staff.role));
  return staff;
}

export function homeFor(role: StaffRole): string {
  return role === "doctor" ? "/panel/semana" : "/panel/agenda";
}
