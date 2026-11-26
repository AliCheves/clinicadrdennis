import { panel } from "@/config/content/panel";

export function Cargando({ pantallaCompleta = false }: { pantallaCompleta?: boolean }) {
  return (
    <div
      role="status"
      className={`flex items-center justify-center text-texto-suave ${pantallaCompleta ? "min-h-dvh" : "py-16"}`}
    >
      {panel.cargando}
    </div>
  );
}
