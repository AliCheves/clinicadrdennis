import Link from "next/link";
import { panel } from "@/config/content/panel";
import { claveDia, etiquetaRango, sumarSemanas } from "@/modules/agenda";

export function NavegarSemana({ ruta, lunes }: { ruta: string; lunes: Date }) {
  const t = panel.semanaNav;
  const boton = "inline-flex min-h-11 items-center rounded-md border border-borde px-3 text-sm font-bold hover:bg-superficie";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link className={boton} href={`${ruta}?semana=${claveDia(sumarSemanas(lunes, -1))}`}>
        ← <span className="sr-only sm:not-sr-only sm:ml-1">{t.anterior}</span>
      </Link>
      <Link className={boton} href={ruta}>
        {t.actual}
      </Link>
      <Link className={boton} href={`${ruta}?semana=${claveDia(sumarSemanas(lunes, 1))}`}>
        <span className="sr-only sm:not-sr-only sm:mr-1">{t.siguiente}</span> →
      </Link>
      <p className="w-full text-sm text-texto-suave sm:ml-2 sm:w-auto">{etiquetaRango(lunes)}</p>
    </div>
  );
}
