import type { Metadata } from "next";
import Link from "next/link";
import { estadoCaso, panel } from "@/config/content/panel";
import { requireStaff } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { etiquetaFechaHora } from "@/modules/agenda";
import { ESTADOS_CASO, listarCasos, type EstadoCaso } from "@/modules/conversation";
import { formatearTelefono } from "@/modules/patients";
import { actualizarCaso } from "../actions";
import { Encabezado } from "../_components/encabezado";
import { InsigniaCaso } from "../_components/insignia";

export const metadata: Metadata = { title: panel.casos.titulo };

const boton =
  "inline-flex min-h-11 items-center rounded-md border border-borde px-3 text-sm font-bold hover:bg-fondo";

export default async function CasosPage({ searchParams }: PageProps<"/panel/casos">) {
  const staff = await requireStaff(["doctor", "secretaria"]);
  const { estado } = await searchParams;
  const filtro = ESTADOS_CASO.includes(estado as EstadoCaso) ? (estado as EstadoCaso) : undefined;
  const supabase = await createServerSupabase();
  const casos = await listarCasos(supabase, filtro);
  const t = panel.casos;

  const filtros: { href: string; etiqueta: string; activo: boolean }[] = [
    { href: "/panel/casos", etiqueta: t.todos, activo: !filtro },
    ...ESTADOS_CASO.map((e) => ({ href: `/panel/casos?estado=${e}`, etiqueta: estadoCaso[e], activo: filtro === e })),
  ];

  return (
    <>
      <Encabezado titulo={t.titulo} descripcion={t.descripcion} />
      <nav aria-label={t.filtros} className="mb-6">
        <ul className="flex flex-wrap gap-2">
          {filtros.map((f) => (
            <li key={f.href}>
              <Link
                href={f.href}
                aria-current={f.activo ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-md px-3 text-sm font-bold ${
                  f.activo ? "bg-acento text-acento-texto" : "border border-borde hover:bg-superficie"
                }`}
              >
                {f.etiqueta}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {casos.length === 0 ? (
        <p className="text-texto-suave">{t.vacio}</p>
      ) : (
        <ul className="space-y-3">
          {casos.map((c) => (
            <li key={c.id} className="rounded-lg border border-borde bg-superficie p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="font-bold">{c.motivo}</p>
                  <p className="text-sm text-texto-suave">
                    {c.paciente ?? formatearTelefono(c.telefono)} · {etiquetaFechaHora(c.creado)}
                  </p>
                  <p className="text-sm">
                    <span className="text-texto-suave">{t.asignado}: </span>
                    {c.asignado ?? t.sinAsignar}
                  </p>
                </div>
                <InsigniaCaso estado={c.estado} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/panel/conversaciones?c=${c.conversacionId}`} className={boton}>
                  {t.verConversacion}
                </Link>
                {c.asignadoId !== staff.staffId && c.estado !== "resuelto" && (
                  <form action={actualizarCaso}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" name="accion" value="asignarme" className={boton}>
                      {t.asignarme}
                    </button>
                  </form>
                )}
                <form action={actualizarCaso} className="flex flex-wrap gap-2">
                  <input type="hidden" name="id" value={c.id} />
                  {ESTADOS_CASO.filter((e) => e !== c.estado).map((e) => (
                    <button key={e} type="submit" name="accion" value={e} className={boton}>
                      {t.marcar} {estadoCaso[e].toLowerCase()}
                    </button>
                  ))}
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
