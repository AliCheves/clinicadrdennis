import { site } from "@/config/content/site";
import type { DatosVisibles } from "@/config/content/visible";

type Props = Pick<DatosVisibles, "telefono" | "whatsapp">;

export function Contacto({ telefono, whatsapp }: Props) {
  return (
    <div className="space-y-5">
      {telefono && (
        <p>
          <span className="text-texto-suave">{site.telefono}: </span>
          <a href={`tel:${telefono.replace(/[^\d+]/g, "")}`} className="font-bold underline underline-offset-4">
            {telefono}
          </a>
        </p>
      )}
      {whatsapp && (
        <a
          href={whatsapp.enlace}
          target="_blank"
          rel="noopener noreferrer"
          aria-describedby="ayuda-whatsapp"
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-acento px-6 font-bold text-acento-texto transition-colors hover:bg-acento-hover"
        >
          {site.botonWhatsApp}
          <span id="ayuda-whatsapp" className="sr-only">
            {` (${site.botonWhatsAppAyuda})`}
          </span>
        </a>
      )}
    </div>
  );
}
