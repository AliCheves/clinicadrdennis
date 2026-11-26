// Configuración de Supabase desde variables de entorno. Sin ellas, el panel no existe (decisión D5
// de la auditoría de Fase 0.5): /login y /panel responden 404 y la landing sigue funcionando.

export type SupabaseConfig = { url: string; anonKey: string };

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

// Supabase local de desarrollo (Docker). Solo aquí se permiten datos de demostración.
export function isLocalSupabaseUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "127.0.0.1" || hostname === "localhost";
  } catch {
    return false;
  }
}
