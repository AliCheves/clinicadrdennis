import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Source_Serif_4 } from "next/font/google";
import { clinic } from "@/config/content/clinic";
import { site } from "@/config/content/site";
import { datosVisibles, sePuedeIndexar } from "@/config/content/visible";
import "./globals.css";

// next/font descarga las fuentes al compilar y las sirve desde el propio sitio: el navegador no llama a terceros.
const titulo = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif", display: "swap" });
const cuerpo = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
  display: "swap",
});

export function generateMetadata(): Metadata {
  const visibles = datosVisibles(clinic);
  const nombre = visibles.nombre ?? site.nombreGenerico;
  const indexar = sePuedeIndexar(clinic);

  return {
    title: { default: nombre, template: `%s · ${nombre}` },
    description: site.descripcionGenerica,
    robots: { index: indexar, follow: indexar },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-SV" className={`${titulo.variable} ${cuerpo.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
