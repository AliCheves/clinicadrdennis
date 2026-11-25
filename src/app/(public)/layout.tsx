import Link from "next/link";
import { clinic } from "@/config/content/clinic";
import { rutas, site } from "@/config/content/site";
import { datosVisibles } from "@/config/content/visible";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  const visibles = datosVisibles(clinic);
  const nombre = visibles.nombre ?? site.nombreGenerico;

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded focus:bg-superficie focus:px-4 focus:py-3"
      >
        {site.saltarAlContenido}
      </a>

      <header className="border-b border-borde">
        <div className="mx-auto w-full max-w-3xl px-5 py-5 sm:px-8">
          <Link
            href={rutas.inicio}
            className="inline-flex min-h-11 items-center font-titulo text-lg font-semibold tracking-tight"
          >
            {nombre}
          </Link>
        </div>
      </header>

      <main id="contenido" className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        {children}
      </main>

      <footer className="border-t border-borde">
        <nav
          aria-label={site.pie.navegacion}
          className="mx-auto flex w-full max-w-3xl flex-wrap gap-x-6 gap-y-1 px-5 py-6 text-base sm:px-8"
        >
          <Link
            href={rutas.privacidad}
            className="inline-flex min-h-11 items-center text-texto-suave underline underline-offset-4 hover:text-texto"
          >
            {site.pie.privacidad}
          </Link>
          <Link
            href={rutas.terminos}
            className="inline-flex min-h-11 items-center text-texto-suave underline underline-offset-4 hover:text-texto"
          >
            {site.pie.terminos}
          </Link>
        </nav>
      </footer>
    </div>
  );
}
