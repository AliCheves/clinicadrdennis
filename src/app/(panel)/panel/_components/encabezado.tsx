import type { ReactNode } from "react";

export function Encabezado({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1">
        <h1 className="font-titulo text-3xl font-semibold tracking-tight">{titulo}</h1>
        {descripcion && <p className="max-w-prose text-texto-suave">{descripcion}</p>}
      </div>
      {children}
    </div>
  );
}
