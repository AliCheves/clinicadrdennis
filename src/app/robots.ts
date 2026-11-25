import type { MetadataRoute } from "next";

// robots.txt queda abierto a propósito: la página se excluye con la etiqueta noindex mientras
// falten datos por confirmar (ver generateMetadata en layout.tsx). Si se bloqueara aquí,
// los rastreadores no verían esa etiqueta.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" } };
}
