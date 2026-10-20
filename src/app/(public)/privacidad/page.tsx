import type { Metadata } from "next";
import { privacidad } from "@/config/content/legal";
import { DocumentoLegal } from "../_components/documento-legal";

export const metadata: Metadata = {
  title: privacidad.titulo,
  description: privacidad.descripcion,
};

export default function Page() {
  return <DocumentoLegal documento={privacidad} />;
}
