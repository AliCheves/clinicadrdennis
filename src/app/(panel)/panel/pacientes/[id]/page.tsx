import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { panel } from "@/config/content/panel";
import { requireStaff } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { etiquetaFecha, etiquetaFechaHora } from "@/modules/agenda";
import { fichaPaciente, formatearTelefono, type CitaDePaciente } from "@/modules/patients";
import { Encabezado } from "../../_components/encabezado";
import { InsigniaCita } from "../../_components/insignia";
import { VerDui } from "./ver-dui";

export const metadata: Metadata = { title: panel.pacientes.titulo };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ListaCitas({ titulo, citas }: { titulo: string; citas: CitaDePaciente[] }) {
  return (
    <section className="rounded-lg border border-borde bg-superficie">
      <h2 className="border-b border-borde px-4 py-3 font-titulo text-lg font-semibold">{titulo}</h2>
      {citas.length === 0 ? (
        <p className="px-4 py-3 text-texto-suave">{panel.pacientes.sinCitas}</p>
      ) : (
        <ul className="divide-y divide-borde">
          {citas.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <span>
                {etiquetaFechaHora(c.inicio)}
                {c.tipo && <span className="text-texto-suave"> · {c.tipo}</span>}
              </span>
              <InsigniaCita estado={c.estado} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function PacientePage({ params }: PageProps<"/panel/pacientes/[id]">) {
  const staff = await requireStaff(["doctor", "secretaria"]);
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const supabase = await createServerSupabase();
  const p = await fichaPaciente(supabase, id);
  if (!p) notFound();
  const t = panel.pacientes;

  const datos: { etiqueta: string; valor: string }[] = [
    { etiqueta: t.telefono, valor: formatearTelefono(p.telefono) },
    { etiqueta: t.correo, valor: p.correo ?? t.sinDato },
    { etiqueta: t.nacimiento, valor: p.nacimiento ? etiquetaFecha(`${p.nacimiento}T12:00:00Z`) : t.sinDato },
  ];

  return (
    <>
      <Link href="/panel/pacientes" className="mb-4 inline-flex min-h-11 items-center text-sm font-bold underline underline-offset-4">
        ← {t.volver}
      </Link>
      <Encabezado titulo={p.nombre} />
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-lg border border-borde bg-superficie p-4 lg:col-span-1">
          <dl className="space-y-3">
            {datos.map((d) => (
              <div key={d.etiqueta}>
                <dt className="text-sm text-texto-suave">{d.etiqueta}</dt>
                <dd className="font-bold break-words">{d.valor}</dd>
              </div>
            ))}
            <div>
              <dt className="text-sm text-texto-suave">{t.dui}</dt>
              <dd>
                {!p.tieneDui ? (
                  <span className="font-bold">{t.duiNoRegistrado}</span>
                ) : staff.role === "doctor" ? (
                  <VerDui pacienteId={p.id} />
                ) : (
                  <span className="font-bold">{t.duiRegistrado}</span>
                )}
              </dd>
            </div>
          </dl>
        </section>
        <div className="space-y-4 lg:col-span-2">
          <ListaCitas titulo={t.proximas} citas={p.proximas} />
          <ListaCitas titulo={t.historial} citas={p.anteriores} />
        </div>
      </div>
    </>
  );
}
