import { site } from "@/config/content/site";

export function EnActualizacion() {
  return (
    <div className="max-w-prose space-y-4">
      <h1 className="font-titulo text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
        {site.enActualizacion.titulo}
      </h1>
      <p className="text-texto-suave">{site.enActualizacion.texto}</p>
    </div>
  );
}
