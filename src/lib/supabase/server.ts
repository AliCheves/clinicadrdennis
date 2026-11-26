// Cliente de Supabase para el servidor, con la sesión del usuario en cookies: RLS aplica siempre
// (ADR-0010). El navegador no consulta datos de pacientes directamente.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getSupabaseConfig } from "./config";

export async function createServerSupabase() {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase no está configurado");
  const cookieStore = await cookies();

  return createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
        } catch {
          // En un Server Component no se pueden escribir cookies; las acciones de servidor sí.
        }
      },
    },
  });
}

export type ServerSupabase = Awaited<ReturnType<typeof createServerSupabase>>;
