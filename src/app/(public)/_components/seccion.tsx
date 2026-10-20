import { useId, type ReactNode } from "react";

export function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="border-t border-borde pt-6">
      <h2 id={id} className="mb-4 font-titulo text-2xl font-semibold tracking-tight">
        {titulo}
      </h2>
      {children}
    </section>
  );
}
