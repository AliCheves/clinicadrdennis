import type { Metadata } from "next";
import Link from "next/link";
import { panel } from "@/config/content/panel";
import { requireStaff } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { etiquetaFechaHora } from "@/modules/agenda";
import { listarConversaciones, mensajesDe } from "@/modules/conversation";
import { formatearTelefono } from "@/modules/patients";
import { Encabezado } from "../_components/encabezado";
import { Insignia } from "../_components/insignia";

export const metadata: Metadata = { title: panel.conversaciones.titulo };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Vista previa de solo lectura de la bandeja (ADR-0011, opción C). Responder llega en la Fase 1.
export default async function ConversacionesPage({ searchParams }: PageProps<"/panel/conversaciones">) {
  await requireStaff(["doctor", "secretaria"]);
  const { c } = await searchParams;
  const seleccion = typeof c === "string" && UUID.test(c) ? c : null;
  const supabase = await createServerSupabase();
  const [conversaciones, mensajes] = await Promise.all([
    listarConversaciones(supabase),
    seleccion ? mensajesDe(supabase, seleccion) : Promise.resolve([]),
  ]);
  const actual = conversaciones.find((x) => x.id === seleccion);
  const t = panel.conversaciones;

  return (
    <>
      <Encabezado titulo={t.titulo} descripcion={t.descripcion} />
      {conversaciones.length === 0 ? (
        <p className="text-texto-suave">{t.vacio}</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <ul className="divide-y divide-borde self-start rounded-lg border border-borde bg-superficie">
            {conversaciones.map((x) => (
              <li key={x.id}>
                <Link
                  href={`/panel/conversaciones?c=${x.id}`}
                  aria-current={x.id === seleccion ? "true" : undefined}
                  className={`block space-y-1 px-4 py-3 hover:bg-fondo ${x.id === seleccion ? "bg-fondo" : ""}`}
                >
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold">{x.paciente ?? formatearTelefono(x.telefono)}</span>
                    {x.necesitaPersona && <Insignia tono="alerta">{t.necesitaPersona}</Insignia>}
                  </span>
                  {x.ultimoMensaje && <span className="block truncate text-sm text-texto-suave">{x.ultimoMensaje}</span>}
                  <span className="block text-xs text-texto-suave">{etiquetaFechaHora(x.actualizada)}</span>
                </Link>
              </li>
            ))}
          </ul>

          <section aria-label={t.titulo} className="min-w-0 rounded-lg border border-borde bg-superficie">
            {!actual ? (
              <p className="px-4 py-6 text-texto-suave">{t.elegir}</p>
            ) : (
              <>
                <header className="border-b border-borde px-4 py-3">
                  <h2 className="font-titulo text-lg font-semibold">{actual.paciente ?? t.sinPaciente}</h2>
                  <p className="text-sm tabular-nums text-texto-suave">{formatearTelefono(actual.telefono)}</p>
                </header>
                <ol className="space-y-3 px-4 py-4">
                  {mensajes.map((m) => (
                    <li key={m.id} className={`flex ${m.direccion === "out" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 ${
                          m.direccion === "out" ? "bg-info-fondo text-info-texto" : "border border-borde bg-fondo"
                        }`}
                      >
                        <p className="text-xs font-bold">
                          {m.direccion === "in" ? t.paciente : (m.enviadoPor ?? t.bot)}
                        </p>
                        <p className="break-words whitespace-pre-line">{m.texto}</p>
                        <p className="mt-1 text-right text-xs opacity-80">{etiquetaFechaHora(m.fecha)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="border-t border-borde px-4 py-3 text-sm text-texto-suave">{t.soloLectura}</p>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
