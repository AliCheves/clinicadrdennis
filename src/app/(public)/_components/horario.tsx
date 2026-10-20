import type { HorarioDelDia } from "@/config/content/clinic";
import { site } from "@/config/content/site";
import { etiquetaDia, formatearHora } from "@/config/content/visible";

export function Horario({ dias }: { dias: HorarioDelDia[] }) {
  return (
    <dl className="divide-y divide-borde border-y border-borde">
      {dias.map((d) => (
        <div key={d.dia} className="flex flex-wrap justify-between gap-x-6 py-3">
          <dt className="font-bold">{etiquetaDia(d.dia)}</dt>
          <dd className={"sinConsulta" in d ? "text-texto-suave" : "tabular-nums"}>
            {"sinConsulta" in d ? site.sinConsulta : `${formatearHora(d.desde)} – ${formatearHora(d.hasta)}`}
          </dd>
        </div>
      ))}
    </dl>
  );
}
