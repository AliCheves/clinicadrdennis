import type { ReactNode } from "react";
import { navegacion, panel, rolEtiqueta } from "@/config/content/panel";
import { requireStaff } from "@/lib/auth";
import { getSupabaseConfig, isLocalSupabaseUrl } from "@/lib/supabase";
import { cerrarSesion } from "../actions";
import { NavPanel } from "./nav-panel";

export async function PanelShell({ children }: { children: ReactNode }) {
  const staff = await requireStaff();
  const enlaces = navegacion.filter((n) => n.roles.includes(staff.role)).map(({ href, etiqueta }) => ({ href, etiqueta }));
  const config = getSupabaseConfig();
  const demo = config ? isLocalSupabaseUrl(config.url) : false;

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:rounded focus:bg-superficie focus:px-4 focus:py-3"
      >
        Saltar al contenido
      </a>
      {demo && (
        <p className="bg-aviso-fondo px-5 py-2 text-center text-sm font-bold text-aviso-texto">{panel.avisoDemo}</p>
      )}
      <header className="border-b border-borde bg-superficie">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="font-titulo text-lg font-semibold tracking-tight">{panel.titulo}</p>
            <p className="text-sm text-texto-suave">
              {staff.fullName} · {rolEtiqueta[staff.role]}
            </p>
          </div>
          <form action={cerrarSesion}>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-md border border-borde px-4 text-sm font-bold hover:bg-fondo"
            >
              {panel.cerrarSesion}
            </button>
          </form>
        </div>
        <div className="mx-auto w-full max-w-6xl px-5 pb-3">
          <NavPanel enlaces={enlaces} etiqueta={panel.navegacion} />
        </div>
      </header>
      <main id="contenido" className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
        {children}
      </main>
    </div>
  );
}
