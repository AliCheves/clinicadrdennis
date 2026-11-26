import { estadoCaso, estadoCita } from "@/config/content/panel";
import type { Database } from "@/types/database";

type Enums = Database["public"]["Enums"];
type Tono = "ok" | "info" | "alerta" | "peligro" | "neutro";

const clases: Record<Tono, string> = {
  ok: "bg-ok-fondo text-ok-texto",
  info: "bg-info-fondo text-info-texto",
  alerta: "bg-alerta-fondo text-alerta-texto",
  peligro: "bg-peligro-fondo text-peligro-texto",
  neutro: "bg-neutro-fondo text-neutro-texto",
};

const tonoCita: Record<Enums["appointment_status"], Tono> = {
  programada: "info",
  confirmada: "ok",
  completada: "neutro",
  no_asistio: "alerta",
  cancelada: "peligro",
};

const tonoCaso: Record<Enums["handoff_status"], Tono> = {
  abierto: "alerta",
  en_curso: "info",
  resuelto: "ok",
};

export function Insignia({ tono, children }: { tono: Tono; children: string }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold whitespace-nowrap ${clases[tono]}`}>
      {children}
    </span>
  );
}

export function InsigniaCita({ estado }: { estado: Enums["appointment_status"] }) {
  return <Insignia tono={tonoCita[estado]}>{estadoCita[estado]}</Insignia>;
}

export function InsigniaCaso({ estado }: { estado: Enums["handoff_status"] }) {
  return <Insignia tono={tonoCaso[estado]}>{estadoCaso[estado]}</Insignia>;
}
