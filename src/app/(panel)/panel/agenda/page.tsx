import type { Metadata } from "next";
import Link from "next/link";
import { panel } from "@/config/content/panel";
import { requireStaff } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import {
  armarAgenda,
  citasDeSemana,
  esHoy,
  etiquetaDiaCorta,
  hora,
  reglasDeHorario,
  semanaDesdeParametro,
  type CitaDeSemana,
} from "@/modules/agenda";
import { Encabezado } from "../_components/encabezado";
import { InsigniaCita } from "../_components/insignia";
import { NavegarSemana } from "../_components/navegar-semana";

export const metadata: Metadata = { title: panel.agenda.titulo };

function Cita({ c }: { c: CitaDeSemana }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      {c.pacienteId ? (
        <Link href={`/panel/pacientes/${c.pacienteId}`} className="truncate font-bold underline-offset-4 hover:underline">
          {c.paciente}
        </Link>
      ) : (
        <span className="truncate font-bold text-alerta-texto">{c.tituloCalendar ?? panel.agenda.sinVincular}</span>
      )}
      <span className="flex flex-wrap items-center gap-2">
        {c.tipo && <span className="text-xs text-texto-suave">{c.tipo}</span>}
        <InsigniaCita estado={c.estado} />
      </span>
    </div>
  );
}

export default async function AgendaPage({ searchParams }: PageProps<"/panel/agenda">) {
  await requireStaff(["doctor", "secretaria"]);
  const { semana } = await searchParams;
  const lunes = semanaDesdeParametro(typeof semana === "string" ? semana : undefined);
  const supabase = await createServerSupabase();
  const [citas, reglas] = await Promise.all([citasDeSemana(supabase, lunes), reglasDeHorario(supabase)]);
  const agenda = armarAgenda(lunes, reglas, citas);
  const t = panel.agenda;

  return (
    <>
      <Encabezado titulo={t.titulo} descripcion={t.descripcion}>
        <NavegarSemana ruta="/panel/agenda" lunes={lunes} />
      </Encabezado>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agenda.map((d) => (
          <section
            key={d.dia.toISOString()}
            aria-label={etiquetaDiaCorta(d.dia)}
            className={`min-w-0 rounded-lg border bg-superficie ${esHoy(d.dia) ? "border-acento" : "border-borde"}`}
          >
            <h2 className="border-b border-borde px-3 py-2 font-titulo font-semibold">{etiquetaDiaCorta(d.dia)}</h2>
            {!d.conConsulta && d.fueraDeHorario.length === 0 ? (
              <p className="px-3 py-4 text-sm text-texto-suave">{t.sinConsulta}</p>
            ) : (
              <ol className="divide-y divide-borde">
                {d.franjas.map((f) => (
                  <li key={f.inicio.toISOString()} className="flex gap-3 px-3 py-2">
                    <span className="w-20 shrink-0 pt-0.5 text-xs tabular-nums text-texto-suave">{hora(f.inicio)}</span>
                    {f.citas.length === 0 ? (
                      <span className="text-sm text-texto-suave">{t.libre}</span>
                    ) : (
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        {f.citas.map((c) => (
                          <Cita key={c.id} c={c} />
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
            {d.fueraDeHorario.length > 0 && (
              <div className="border-t border-borde px-3 py-2">
                <p className="mb-1 text-xs font-bold text-texto-suave">{t.fueraDeHorario}</p>
                {d.fueraDeHorario.map((c) => (
                  <div key={c.id} className="flex gap-3 py-1">
                    <span className="w-20 shrink-0 text-xs tabular-nums text-texto-suave">{hora(c.inicio)}</span>
                    <Cita c={c} />
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
