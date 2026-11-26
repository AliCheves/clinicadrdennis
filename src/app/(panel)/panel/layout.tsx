import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { panel } from "@/config/content/panel";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Cargando } from "./_components/cargando";
import { PanelShell } from "./_components/panel-shell";

export const metadata: Metadata = {
  title: { default: panel.titulo, template: `%s · ${panel.titulo}` },
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  // Decisión D5: sin Supabase configurado, el panel no existe (404).
  if (!isSupabaseConfigured()) notFound();
  return (
    <Suspense fallback={<Cargando pantallaCompleta />}>
      <PanelShell>{children}</PanelShell>
    </Suspense>
  );
}
