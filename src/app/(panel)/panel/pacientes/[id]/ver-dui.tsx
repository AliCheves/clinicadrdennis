"use client";

import { useActionState } from "react";
import { panel } from "@/config/content/panel";
import { verDui, type EstadoDui } from "../../actions";

const inicial: EstadoDui = { dui: null, error: null };

// El DUI solo llega al navegador cuando el doctor lo pide; la base registra cada petición.
export function VerDui({ pacienteId }: { pacienteId: string }) {
  const [estado, accion, pendiente] = useActionState(verDui, inicial);
  const t = panel.pacientes;

  if (estado.dui) {
    return (
      <span className="font-bold tabular-nums" data-testid="dui-revelado">
        {estado.dui}
      </span>
    );
  }

  return (
    <form action={accion} className="space-y-1">
      <input type="hidden" name="pacienteId" value={pacienteId} />
      <span className="mr-2 font-bold">{t.duiRegistrado}</span>
      <button
        type="submit"
        disabled={pendiente}
        className="inline-flex min-h-11 items-center rounded-md border border-borde px-3 text-sm font-bold hover:bg-fondo disabled:opacity-70"
      >
        {t.verDui}
      </button>
      <p className="text-xs text-texto-suave">{t.duiAviso}</p>
      {estado.error && (
        <p role="alert" className="text-sm text-peligro-texto">
          {estado.error}
        </p>
      )}
    </form>
  );
}
