import type { Metadata } from "next";
import { terminos } from "@/config/content/legal";
import { DocumentoLegal } from "../_components/documento-legal";

export const metadata: Metadata = {
  title: terminos.titulo,
  description: terminos.descripcion,
};

export default function Page() {
  return <DocumentoLegal documento={terminos} />;
}
