import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: ReactNode }) {
  // Sin Supabase configurado (por ejemplo, el despliegue de la landing) no hay login: 404.
  if (!isSupabaseConfigured()) notFound();
  return <main className="flex min-h-dvh items-center justify-center px-5 py-12">{children}</main>;
}
