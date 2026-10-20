import { avisoBorrador, type DocumentoLegal as Documento } from "@/config/content/legal";
import { site } from "@/config/content/site";

export function DocumentoLegal({ documento }: { documento: Documento }) {
  return (
    <article className="max-w-prose space-y-10">
      <div
        role="note"
        aria-labelledby="aviso-borrador"
        className="rounded-md border-l-4 border-aviso-borde bg-aviso-fondo px-5 py-4 text-aviso-texto"
      >
        <p id="aviso-borrador" className="font-bold">
          {avisoBorrador.titulo}
        </p>
        <p className="mt-1">{avisoBorrador.texto}</p>
      </div>

      <header className="space-y-2">
        <h1 className="font-titulo text-4xl leading-tight font-semibold tracking-tight">{documento.titulo}</h1>
        <p className="text-texto-suave">
          {site.borradorFecha} {documento.fechaBorrador}
        </p>
      </header>

      {documento.secciones.map((s) => (
        <section key={s.titulo} className="space-y-3">
          <h2 className="font-titulo text-2xl font-semibold tracking-tight">{s.titulo}</h2>
          {s.parrafos.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {s.lista && (
            <ul className="list-disc space-y-1 pl-6 marker:text-texto-suave">
              {s.lista.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
}
