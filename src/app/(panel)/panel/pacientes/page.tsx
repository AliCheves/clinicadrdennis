import type { Metadata } from "next";
import Link from "next/link";
import { panel } from "@/config/content/panel";
import { requireStaff } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { buscarPacientes, formatearTelefono, normalizarBusqueda } from "@/modules/patients";
import { Encabezado } from "../_components/encabezado";

export const metadata: Metadata = { title: panel.pacientes.titulo };

export default async function PacientesPage({ searchParams }: PageProps<"/panel/pacientes">) {
  await requireStaff(["doctor", "secretaria"]);
  const { q } = await searchParams;
  const busqueda = typeof q === "string" ? q : "";
  const valida = normalizarBusqueda(busqueda) !== null;
  const supabase = await createServerSupabase();
  const pacientes = valida ? await buscarPacientes(supabase, busqueda) : [];
  const t = panel.pacientes;

  return (
    <>
      <Encabezado titulo={t.titulo} descripcion={t.descripcion} />
      <form role="search" action="/panel/pacientes" className="mb-6 flex max-w-xl flex-wrap gap-2">
        <label htmlFor="q" className="sr-only">
          {t.placeholder}
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={busqueda}
          placeholder={t.placeholder}
          className="min-h-12 min-w-0 flex-1 rounded-md border border-borde bg-superficie px-4"
        />
        <button
          type="submit"
          className="inline-flex min-h-12 items-center rounded-md bg-acento px-5 font-bold text-acento-texto hover:bg-acento-hover"
        >
          {t.buscar}
        </button>
      </form>

      {!valida ? (
        <p className="text-texto-suave">{t.sinBusqueda}</p>
      ) : pacientes.length === 0 ? (
        <p className="text-texto-suave">{t.vacio}</p>
      ) : (
        <ul className="divide-y divide-borde rounded-lg border border-borde bg-superficie">
          {pacientes.map((p) => (
            <li key={p.id}>
              <Link
                href={`/panel/pacientes/${p.id}`}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-fondo"
              >
                <span className="font-bold">{p.nombre}</span>
                <span className="text-sm tabular-nums text-texto-suave">{formatearTelefono(p.telefono)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
