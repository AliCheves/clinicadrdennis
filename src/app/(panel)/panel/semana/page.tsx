import type { Metadata } from "next";
import Link from "next/link";
import { estadoCita, panel } from "@/config/content/panel";
import { requireStaff } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import {
  agruparPorDia,
  citasDeSemana,
  diaDeSemana,
  esHoy,
  etiquetaDia,
  hora,
  reglasDeHorario,
  semanaDesdeParametro,
} from "@/modules/agenda";
import { Encabezado } from "../_components/encabezado";
import { InsigniaCita } from "../_components/insignia";
import { NavegarSemana } from "../_components/navegar-semana";

export const metadata: Metadata = { title: panel.semana.titulo };

export default async function SemanaPage({ searchParams }: PageProps<"/panel/semana">) {
  await requireStaff(["doctor"]);
  const { semana } = await searchParams;
  const lunes = semanaDesdeParametro(typeof semana === "string" ? semana : undefined);
  const supabase = await createServerSupabase();
  const [citas, reglas] = await Promise.all([citasDeSemana(supabase, lunes), reglasDeHorario(supabase)]);
  const dias = agruparPorDia(lunes, citas);
  const diasConConsulta = new Set(reglas.map((r) => r.weekday));
  const activas = citas.filter((c) => c.estado !== "cancelada");
  const porEstado = Object.entries(estadoCita)
    .map(([estado, etiqueta]) => ({ etiqueta, n: citas.filter((c) => c.estado === estado).length }))
    .filter((e) => e.n > 0);
  const t = panel.semana;

  return (
    <>
      <Encabezado titulo={t.titulo} descripcion={t.descripcion}>
        <NavegarSemana ruta="/panel/semana" lunes={lunes} />
      </Encabezado>

      <section aria-label={t.total} className="mb-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <div className="rounded-lg border border-borde bg-superficie px-5 py-4">
          <p className="text-sm text-texto-suave">{t.total}</p>
          <p className="font-titulo text-3xl font-semibold tabular-nums">{activas.length}</p>
        </div>
        {porEstado.map((e) => (
          <div key={e.etiqueta} className="rounded-lg border border-borde bg-superficie px-5 py-4">
            <p className="text-sm text-texto-suave">{e.etiqueta}</p>
            <p className="font-titulo text-3xl font-semibold tabular-nums">{e.n}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dias.map(({ dia, citas: delDia }) => {
          const visibles = delDia.filter((c) => c.estado !== "cancelada");
          return (
            <section
              key={dia.toISOString()}
              aria-label={etiquetaDia(dia)}
              className={`min-w-0 rounded-lg border bg-superficie ${esHoy(dia) ? "border-acento" : "border-borde"}`}
            >
              <header className="flex items-baseline justify-between gap-3 border-b border-borde px-4 py-3">
                <h2 className="font-titulo text-lg font-semibold">{etiquetaDia(dia)}</h2>
                <span className="text-sm tabular-nums text-texto-suave">{visibles.length}</span>
              </header>
              {!diasConConsulta.has(diaDeSemana(dia)) && delDia.length === 0 ? (
                <p className="px-4 py-4 text-texto-suave">{t.sinConsulta}</p>
              ) : delDia.length === 0 ? (
                <p className="px-4 py-4 text-texto-suave">{t.sinCitas}</p>
              ) : (
                <ul className="divide-y divide-borde">
                  {delDia.map((c) => (
                    <li
                      key={c.id}
                      className={`flex items-start justify-between gap-3 px-4 py-3 ${c.estado === "cancelada" ? "opacity-70" : ""}`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm tabular-nums text-texto-suave">{hora(c.inicio)}</p>
                        {c.pacienteId ? (
                          <Link
                            href={`/panel/pacientes/${c.pacienteId}`}
                            className="font-bold underline-offset-4 hover:underline"
                          >
                            {c.paciente}
                          </Link>
                        ) : (
                          <p className="font-bold text-alerta-texto">{c.tituloCalendar ?? panel.agenda.sinVincular}</p>
                        )}
                        {c.tipo && <p className="text-sm text-texto-suave">{c.tipo}</p>}
                      </div>
                      <InsigniaCita estado={c.estado} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
