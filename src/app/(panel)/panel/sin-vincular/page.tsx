import type { Metadata } from "next";
import { origenCita, panel } from "@/config/content/panel";
import { requireStaff } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { citasSinVincular, etiquetaFechaHora, inicioDeSemana } from "@/modules/agenda";
import { Encabezado } from "../_components/encabezado";
import { InsigniaCita } from "../_components/insignia";

export const metadata: Metadata = { title: panel.sinVincular.titulo };

export default async function SinVincularPage() {
  await requireStaff(["doctor", "secretaria"]);
  const supabase = await createServerSupabase();
  const citas = await citasSinVincular(supabase, inicioDeSemana(new Date()));
  const t = panel.sinVincular;

  return (
    <>
      <Encabezado titulo={t.titulo} descripcion={t.descripcion} />
      {citas.length === 0 ? (
        <p className="text-texto-suave">{t.vacio}</p>
      ) : (
        <ul className="space-y-3">
          {citas.map((c) => (
            <li key={c.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-borde bg-superficie p-4">
              <div className="min-w-0 space-y-1">
                <p className="font-bold">{etiquetaFechaHora(c.inicio)}</p>
                <p className="break-words">
                  <span className="text-texto-suave">{t.tituloEvento}: </span>
                  {c.tituloCalendar ?? "—"}
                </p>
                <p className="text-sm text-texto-suave">
                  {origenCita[c.origen]}
                  {c.tipo ? ` · ${c.tipo}` : ""}
                </p>
              </div>
              <InsigniaCita estado={c.estado} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
